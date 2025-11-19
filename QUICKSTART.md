# Quick Start Guide

## Overview

The ZIP Project Tree Visualizer is a web application that:
1. Accepts ZIP file uploads
2. Parses the ZIP structure
3. Displays a visual tree of the project
4. Allows exporting the tree as JPG or PNG images

## Architecture

### Backend (C++)
- **ZipParser**: Parses ZIP files and builds tree structure
- **HttpServer**: Simple HTTP server for web interface
- **Main**: Connects components and handles requests

### Frontend (Web)
- **HTML**: User interface with upload area
- **CSS**: Modern styling with gradients and animations
- **JavaScript**: File handling, tree rendering, and image export

## How It Works

1. **Upload**: User uploads a ZIP file via web interface
2. **Parse**: C++ backend extracts ZIP structure
3. **Tree**: Structure is converted to JSON and sent to frontend
4. **Visualize**: JavaScript renders tree with proper indentation
5. **Export**: html2canvas converts tree to image (JPG/PNG)

## File Flow

```
User Browser
    ↓ (POST /api/upload)
C++ HTTP Server
    ↓ (multipart parsing)
ZipParser
    ↓ (ZIP reading)
TreeNode Structure
    ↓ (JSON conversion)
Frontend JavaScript
    ↓ (tree rendering)
Visual Tree Display
    ↓ (html2canvas)
Image Export (JPG/PNG)
```

## Key Technologies

- **C++17**: Backend language
- **libzip**: ZIP file parsing library
- **Raw Sockets**: HTTP server implementation
- **HTML5/CSS3/JavaScript**: Frontend
- **html2canvas**: Image export library
- **CMake**: Build system

## Usage Example

1. Build the project (see BUILD.md)
2. Run the server: `./zip-tree-server`
3. Open browser: `http://localhost:8080`
4. Upload a ZIP file
5. View the tree structure
6. Click "Download as JPG" or "Download as PNG"

## Project Structure

```
zip-tree/
├── backend/
│   ├── include/
│   │   ├── zip_parser.hpp
│   │   └── http_server.hpp
│   └── src/
│       ├── main.cpp
│       ├── zip_parser.cpp
│       └── http_server.cpp
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── CMakeLists.txt
├── BUILD.md
├── PROJECT_STEPS.md
└── README.md
```

