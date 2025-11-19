#include "zip_parser.hpp"
#include <zip.h>
#include <sstream>
#include <algorithm>
#include <iostream>
#include <iomanip>

ZipParser::ZipParser() {}

ZipParser::~ZipParser() {}

std::shared_ptr<TreeNode> ZipParser::parseZip(const std::string& zipPath) {
    int err = 0;
    zip_t* zip = zip_open(zipPath.c_str(), ZIP_RDONLY, &err);
    
    if (!zip) {
        std::cerr << "Failed to open ZIP file: " << zipPath << std::endl;
        return nullptr;
    }
    
    // Create root node
    auto root = std::make_shared<TreeNode>("root", "", true);
    
    // Get number of entries
    zip_int64_t numEntries = zip_get_num_entries(zip, 0);
    
    for (zip_int64_t i = 0; i < numEntries; i++) {
        const char* name = zip_get_name(zip, i, 0);
        if (!name) continue;
        
        std::string path(name);
        
        // Skip if it's just a directory marker (ends with /)
        if (path.back() == '/' && path.length() > 1) {
            path = path.substr(0, path.length() - 1);
        }
        
        // Add path to tree
        addPathToTree(root, path);
    }
    
    zip_close(zip);
    return root;
}

void ZipParser::addPathToTree(std::shared_ptr<TreeNode> root, const std::string& path) {
    if (path.empty()) return;
    
    std::istringstream pathStream(path);
    std::string segment;
    auto current = root;
    
    while (std::getline(pathStream, segment, '/')) {
        if (segment.empty()) continue;
        
        bool isLast = pathStream.eof() || pathStream.peek() == EOF;
        bool isDir = !isLast;
        
        auto node = findOrCreateNode(current, segment, isDir);
        current = node;
    }
}

std::shared_ptr<TreeNode> ZipParser::findOrCreateNode(
    std::shared_ptr<TreeNode> parent, 
    const std::string& name, 
    bool is_dir) {
    
    // Check if node already exists
    for (auto& child : parent->children) {
        if (child->name == name) {
            return child;
        }
    }
    
    // Create new node
    std::string newPath = parent->path.empty() ? name : parent->path + "/" + name;
    auto newNode = std::make_shared<TreeNode>(name, newPath, is_dir);
    parent->children.push_back(newNode);
    
    return newNode;
}

std::string ZipParser::treeToJson(std::shared_ptr<TreeNode> root) {
    if (!root) return "null";
    
    std::ostringstream json;
    json << "{";
    json << "\"name\":\"" << escapeJson(root->name) << "\",";
    json << "\"path\":\"" << escapeJson(root->path) << "\",";
    json << "\"isDirectory\":" << (root->is_directory ? "true" : "false") << ",";
    json << "\"children\":[";
    
    for (size_t i = 0; i < root->children.size(); i++) {
        if (i > 0) json << ",";
        json << treeToJson(root->children[i]);
    }
    
    json << "]}";
    return json.str();
}

std::string ZipParser::escapeJson(const std::string& str) {
    std::ostringstream escaped;
    for (char c : str) {
        switch (c) {
            case '"': escaped << "\\\""; break;
            case '\\': escaped << "\\\\"; break;
            case '\b': escaped << "\\b"; break;
            case '\f': escaped << "\\f"; break;
            case '\n': escaped << "\\n"; break;
            case '\r': escaped << "\\r"; break;
            case '\t': escaped << "\\t"; break;
            default:
                if (static_cast<unsigned char>(c) < 0x20) {
                    escaped << "\\u" << std::hex << std::setw(4) 
                            << std::setfill('0') << static_cast<int>(c);
                } else {
                    escaped << c;
                }
                break;
        }
    }
    return escaped.str();
}

