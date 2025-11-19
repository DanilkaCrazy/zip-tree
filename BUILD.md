# Build Instructions

## Prerequisites

### Linux/macOS
```bash
# Install libzip development package
# Ubuntu/Debian:
sudo apt-get install libzip-dev

# Fedora/RHEL:
sudo dnf install libzip-devel

# macOS (using Homebrew):
brew install libzip
```

### Windows
1. Download libzip from: https://libzip.org/download/
2. Extract and set environment variables, or use vcpkg:
```bash
vcpkg install libzip
```

## Building the Project

### Using CMake (Recommended)

```bash
# Create build directory
mkdir build
cd build

# Configure
cmake ..

# Build
cmake --build .

# On Linux/macOS, you can also use:
make

# On Windows with Visual Studio:
cmake --build . --config Release
```

### Running the Server

After building, run the executable:

```bash
# Linux/macOS
./zip-tree-server

# Windows
.\zip-tree-server.exe
```

The server will start on port 8080. Open your browser to:
```
http://localhost:8080
```

## Troubleshooting

### libzip not found
If CMake cannot find libzip, you may need to specify the path:
```bash
cmake -DCMAKE_PREFIX_PATH=/path/to/libzip ..
```

### Socket errors on Windows
Make sure you're running with appropriate permissions. On Windows, you may need to allow the application through the firewall.

### Port already in use
If port 8080 is already in use, you can modify the port in `backend/src/main.cpp`:
```cpp
HttpServer server(8080);  // Change to another port
```

