#ifndef HTTP_SERVER_HPP
#define HTTP_SERVER_HPP

#include <string>
#include <functional>
#include <map>

class HttpServer {
public:
    using Handler = std::function<std::string(const std::string&, const std::map<std::string, std::string>&)>;
    
    HttpServer(int port = 8080);
    ~HttpServer();
    
    void start();
    void stop();
    
    void registerRoute(const std::string& path, Handler handler);
    void serveStaticFile(const std::string& path, const std::string& filePath);
    
private:
    int port_;
    bool running_;
    std::map<std::string, Handler> routes_;
    std::map<std::string, std::string> staticFiles_;
    
    void handleRequest(int clientSocket);
    std::string readRequest(int clientSocket);
    void sendResponse(int clientSocket, const std::string& response);
    std::string getMimeType(const std::string& filePath);
    std::map<std::string, std::string> parseHeaders(const std::string& request);
    std::string parseMultipartFormData(const std::string& body, const std::string& boundary);
};

#endif // HTTP_SERVER_HPP

