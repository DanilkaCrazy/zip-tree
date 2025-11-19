#include "http_server.hpp"
#include <fstream>
#include <sstream>
#include <iostream>
#include <algorithm>
#include <cstring>

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")
#define close closesocket
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#endif

HttpServer::HttpServer(int port) : port_(port), running_(false) {}

HttpServer::~HttpServer() {
    stop();
}

void HttpServer::start() {
#ifdef _WIN32
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "WSAStartup failed" << std::endl;
        return;
    }
#endif

    int serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket < 0) {
        std::cerr << "Failed to create socket" << std::endl;
        return;
    }

    int opt = 1;
#ifdef _WIN32
    setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, (char*)&opt, sizeof(opt));
#else
    setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
#endif

    sockaddr_in address;
    memset(&address, 0, sizeof(address));
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port_);

    if (bind(serverSocket, (struct sockaddr*)&address, sizeof(address)) < 0) {
        std::cerr << "Bind failed" << std::endl;
#ifdef _WIN32
        closesocket(serverSocket);
        WSACleanup();
#else
        close(serverSocket);
#endif
        return;
    }

    if (listen(serverSocket, 10) < 0) {
        std::cerr << "Listen failed" << std::endl;
#ifdef _WIN32
        closesocket(serverSocket);
        WSACleanup();
#else
        close(serverSocket);
#endif
        return;
    }

    running_ = true;
    std::cout << "Server started on port " << port_ << std::endl;

    while (running_) {
        sockaddr_in clientAddr;
        socklen_t clientLen = sizeof(clientAddr);
        int clientSocket = accept(serverSocket, (struct sockaddr*)&clientAddr, &clientLen);
        
        if (clientSocket < 0) {
            if (running_) {
                std::cerr << "Accept failed" << std::endl;
            }
            continue;
        }

        handleRequest(clientSocket);

#ifdef _WIN32
        closesocket(clientSocket);
#else
        close(clientSocket);
#endif
    }

#ifdef _WIN32
    closesocket(serverSocket);
    WSACleanup();
#else
    close(serverSocket);
#endif
}

void HttpServer::stop() {
    running_ = false;
}

void HttpServer::registerRoute(const std::string& path, Handler handler) {
    routes_[path] = handler;
}

void HttpServer::serveStaticFile(const std::string& path, const std::string& filePath) {
    staticFiles_[path] = filePath;
}

void HttpServer::handleRequest(int clientSocket) {
    std::string request = readRequest(clientSocket);
    
    if (request.empty()) {
        sendResponse(clientSocket, "HTTP/1.1 400 Bad Request\r\n\r\n");
        return;
    }

    // Parse request line
    std::istringstream requestStream(request);
    std::string method, path, version;
    requestStream >> method >> path >> version;

    // Remove query string
    size_t queryPos = path.find('?');
    if (queryPos != std::string::npos) {
        path = path.substr(0, queryPos);
    }

    // Check static files first
    if (staticFiles_.find(path) != staticFiles_.end()) {
        std::ifstream file(staticFiles_[path], std::ios::binary);
        if (file.is_open()) {
            std::ostringstream content;
            content << file.rdbuf();
            std::string mimeType = getMimeType(path);
            std::ostringstream response;
            response << "HTTP/1.1 200 OK\r\n";
            response << "Content-Type: " << mimeType << "\r\n";
            response << "Content-Length: " << content.str().length() << "\r\n";
            response << "Access-Control-Allow-Origin: *\r\n";
            response << "\r\n";
            response << content.str();
            sendResponse(clientSocket, response.str());
            return;
        }
    }

    // Check routes
    if (routes_.find(path) != routes_.end()) {
        auto headers = parseHeaders(request);
        std::string body = request.substr(request.find("\r\n\r\n") + 4);
        std::string responseBody = routes_[path](body, headers);
        
        std::ostringstream response;
        response << "HTTP/1.1 200 OK\r\n";
        response << "Content-Type: application/json\r\n";
        response << "Access-Control-Allow-Origin: *\r\n";
        response << "Content-Length: " << responseBody.length() << "\r\n";
        response << "\r\n";
        response << responseBody;
        sendResponse(clientSocket, response.str());
        return;
    }

    // 404 Not Found
    sendResponse(clientSocket, "HTTP/1.1 404 Not Found\r\n\r\n");
}

std::string HttpServer::readRequest(int clientSocket) {
    char buffer[4096] = {0};
    int bytesRead = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
    
    if (bytesRead <= 0) {
        return "";
    }
    
    return std::string(buffer, bytesRead);
}

void HttpServer::sendResponse(int clientSocket, const std::string& response) {
    send(clientSocket, response.c_str(), response.length(), 0);
}

std::string HttpServer::getMimeType(const std::string& filePath) {
    size_t dotPos = filePath.find_last_of('.');
    if (dotPos == std::string::npos) {
        return "application/octet-stream";
    }
    
    std::string ext = filePath.substr(dotPos + 1);
    std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);
    
    if (ext == "html") return "text/html";
    if (ext == "css") return "text/css";
    if (ext == "js") return "application/javascript";
    if (ext == "json") return "application/json";
    if (ext == "png") return "image/png";
    if (ext == "jpg" || ext == "jpeg") return "image/jpeg";
    
    return "application/octet-stream";
}

std::map<std::string, std::string> HttpServer::parseHeaders(const std::string& request) {
    std::map<std::string, std::string> headers;
    std::istringstream stream(request);
    std::string line;
    
    // Skip request line
    std::getline(stream, line);
    
    while (std::getline(stream, line) && line != "\r" && !line.empty()) {
        size_t colonPos = line.find(':');
        if (colonPos != std::string::npos) {
            std::string key = line.substr(0, colonPos);
            std::string value = line.substr(colonPos + 1);
            
            // Trim whitespace
            key.erase(0, key.find_first_not_of(" \t"));
            key.erase(key.find_last_not_of(" \t") + 1);
            value.erase(0, value.find_first_not_of(" \t"));
            value.erase(value.find_last_not_of(" \t") + 1);
            
            headers[key] = value;
        }
    }
    
    return headers;
}

std::string HttpServer::parseMultipartFormData(const std::string& body, const std::string& boundary) {
    // Simple multipart parser - extract file content
    size_t pos = body.find("Content-Type:");
    if (pos == std::string::npos) return "";
    
    pos = body.find("\r\n\r\n", pos);
    if (pos == std::string::npos) return "";
    pos += 4;
    
    size_t endPos = body.find(boundary, pos);
    if (endPos == std::string::npos) return "";
    
    // Remove trailing \r\n
    while (endPos > pos && (body[endPos - 1] == '\n' || body[endPos - 1] == '\r')) {
        endPos--;
    }
    
    return body.substr(pos, endPos - pos);
}

