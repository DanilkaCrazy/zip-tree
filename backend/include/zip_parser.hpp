#ifndef ZIP_PARSER_HPP
#define ZIP_PARSER_HPP

#include <string>
#include <vector>
#include <memory>

struct TreeNode {
    std::string name;
    std::string path;
    bool is_directory;
    std::vector<std::shared_ptr<TreeNode>> children;
    
    TreeNode(const std::string& n, const std::string& p, bool is_dir)
        : name(n), path(p), is_directory(is_dir) {}
};

class ZipParser {
public:
    ZipParser();
    ~ZipParser();
    
    // Parse ZIP file and return root of tree structure
    std::shared_ptr<TreeNode> parseZip(const std::string& zipPath);
    
    // Convert tree to JSON string
    std::string treeToJson(std::shared_ptr<TreeNode> root);
    
private:
    void addPathToTree(std::shared_ptr<TreeNode> root, const std::string& path);
    std::shared_ptr<TreeNode> findOrCreateNode(std::shared_ptr<TreeNode> parent, 
                                               const std::string& name, 
                                               bool is_dir);
    std::string escapeJson(const std::string& str);
};

#endif // ZIP_PARSER_HPP

