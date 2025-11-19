#include "zip_parser.hpp"
#include "http_server.hpp"
#include <iostream>
#include <fstream>
#include <sstream>
#include <filesystem>
#include <ctime>
#include <cstdlib>

#ifdef _WIN32
#include <io.h>
#define access _access
#define F_OK 0
#else
#include <unistd.h>
#endif

std::string generateTempFileName() {
    std::srand(std::time(nullptr));
    int random = std::rand();
    return "temp_zip_" + std::to_string(random) + ".zip";
}

std::string handleUpload(const std::string& body, const std::map<std::string, std::string>& headers) {
    // Find boundary from Content-Type header
    std::string contentType = headers.count("Content-Type") ? headers.at("Content-Type") : "";
    size_t boundaryPos = contentType.find("boundary=");
    if (boundaryPos == std::string::npos) {
        return "{\"error\":\"No boundary found in Content-Type header\"}";
    }
    
    std::string boundary = "--" + contentType.substr(boundaryPos + 9);
    
    // Find the file part in multipart data
    // Look for Content-Disposition with filename
    size_t filePartStart = body.find("Content-Disposition: form-data; name=\"file\"");
    if (filePartStart == std::string::npos) {
        filePartStart = body.find("Content-Disposition: form-data; name='file'");
    }
    if (filePartStart == std::string::npos) {
        // Try to find any file-like content
        filePartStart = body.find("Content-Type: application/zip");
        if (filePartStart == std::string::npos) {
            filePartStart = body.find("Content-Type: application/x-zip-compressed");
        }
        if (filePartStart == std::string::npos) {
            filePartStart = body.find("Content-Type: application/octet-stream");
        }
    }
    
    if (filePartStart == std::string::npos) {
        return "{\"error\":\"No file found in multipart data\"}";
    }
    
    // Find the actual file data (after headers, after double CRLF)
    size_t dataStart = body.find("\r\n\r\n", filePartStart);
    if (dataStart == std::string::npos) {
        dataStart = body.find("\n\n", filePartStart);
        if (dataStart != std::string::npos) {
            dataStart += 2;
        }
    } else {
        dataStart += 4;
    }
    
    if (dataStart == std::string::npos) {
        return "{\"error\":\"Invalid multipart format - no data separator found\"}";
    }
    
    // Find end of file data (before next boundary or end of body)
    size_t dataEnd = body.find(boundary, dataStart);
    if (dataEnd == std::string::npos) {
        dataEnd = body.length();
    }
    
    // Remove trailing CRLF
    while (dataEnd > dataStart && (body[dataEnd - 1] == '\n' || body[dataEnd - 1] == '\r')) {
        dataEnd--;
    }
    
    if (dataEnd <= dataStart) {
        return "{\"error\":\"No file data found\"}";
    }
    
    // Save to temporary file
    std::string tempFile = generateTempFileName();
    std::ofstream outFile(tempFile, std::ios::binary);
    if (!outFile.is_open()) {
        return "{\"error\":\"Failed to create temporary file\"}";
    }
    
    outFile.write(body.data() + dataStart, dataEnd - dataStart);
    outFile.close();
    
    // Parse ZIP file
    ZipParser parser;
    auto tree = parser.parseZip(tempFile);
    
    if (!tree) {
        std::remove(tempFile.c_str());
        return "{\"error\":\"Failed to parse ZIP file - invalid or corrupted ZIP\"}";
    }
    
    // Convert to JSON
    std::string json = parser.treeToJson(tree);
    
    // Clean up temp file
    std::remove(tempFile.c_str());
    
    return json;
}

int main() {
    HttpServer server(8080);
    
    // Register routes
    server.registerRoute("/api/upload", handleUpload);
    
    // Serve static files
    std::string buildDir = "build";
    if (access((buildDir + "/frontend").c_str(), F_OK) == 0) {
        server.serveStaticFile("/", buildDir + "/frontend/index.html");
        server.serveStaticFile("/index.html", buildDir + "/frontend/index.html");
        server.serveStaticFile("/style.css", buildDir + "/frontend/style.css");
        server.serveStaticFile("/app.js", buildDir + "/frontend/app.js");
    } else {
        // Fallback to source directory
        server.serveStaticFile("/", "frontend/index.html");
        server.serveStaticFile("/index.html", "frontend/index.html");
        server.serveStaticFile("/style.css", "frontend/style.css");
        server.serveStaticFile("/app.js", "frontend/app.js");
    }
    
    std::cout << "Starting ZIP Tree Visualizer Server..." << std::endl;
    std::cout << "Open http://localhost:8080 in your browser" << std::endl;
    
    server.start();
    
    return 0;
}

