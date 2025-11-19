# Setup Requirements for Launching the Application

## Required Software

To build and run this application, you need:

### 1. C++ Compiler
- **Windows**: Visual Studio 2019 or later with C++ development tools
  - Download: https://visualstudio.microsoft.com/
  - Or install Build Tools for Visual Studio
- **Alternative**: MinGW-w64 or Clang

### 2. CMake (3.10 or later)
- Download: https://cmake.org/download/
- Make sure to add CMake to PATH during installation
- Or use Visual Studio which includes CMake support

### 3. libzip Library
- **Windows**: 
  - Option 1: Use vcpkg: `vcpkg install libzip:x64-windows`
  - Option 2: Download from https://libzip.org/download/ and set environment variables
- **Linux**: `sudo apt-get install libzip-dev` (Ubuntu/Debian)
- **macOS**: `brew install libzip`

## Quick Setup (Windows with Visual Studio)

1. Install Visual Studio 2019/2022 with:
   - Desktop development with C++
   - CMake tools for Windows

2. Install libzip using vcpkg:
   ```powershell
   git clone https://github.com/Microsoft/vcpkg.git
   cd vcpkg
   .\bootstrap-vcpkg.bat
   .\vcpkg install libzip:x64-windows
   ```

3. Open PowerShell in the project directory and run:
   ```powershell
   .\launch.ps1
   ```

## Manual Build Steps

If you prefer to build manually:

```powershell
# Create build directory
mkdir build
cd build

# Configure (adjust paths as needed)
cmake .. -DCMAKE_TOOLCHAIN_FILE=[path-to-vcpkg]/scripts/buildsystems/vcpkg.cmake

# Build
cmake --build . --config Release

# Run
.\Release\zip-tree-server.exe
```

## Troubleshooting

### "CMake not found"
- Install CMake and add it to PATH
- Or use Visual Studio's integrated CMake

### "libzip not found"
- Install libzip library
- For vcpkg, use: `-DCMAKE_TOOLCHAIN_FILE=[vcpkg-path]/scripts/buildsystems/vcpkg.cmake`

### "Compiler not found"
- Install Visual Studio with C++ tools
- Or install MinGW-w64/Clang and add to PATH

### Port 8080 already in use
- Change the port in `backend/src/main.cpp`:
  ```cpp
  HttpServer server(8080);  // Change to another port
  ```

## Alternative: Use Pre-built Binary

If you have access to a pre-built binary, you can run it directly:
```powershell
.\zip-tree-server.exe
```

Then open http://localhost:8080 in your browser.

