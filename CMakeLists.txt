cmake_minimum_required(VERSION 3.10)
project(ZipTreeVisualizer VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
# Try pkg-config first (Linux/macOS), then fall back to manual search (Windows)
find_package(PkgConfig QUIET)
if(PKG_CONFIG_FOUND)
    pkg_check_modules(LIBZIP libzip)
endif()

# If pkg-config didn't find it, try manual search
if(NOT LIBZIP_FOUND)
    find_path(LIBZIP_INCLUDE_DIR zip.h
        PATHS
        ${CMAKE_SOURCE_DIR}/libs/libzip/include
        "C:/libzip/include"
        "C:/vcpkg/installed/x64-windows/include"
        "C:/vcpkg/installed/x86-windows/include"
        /usr/include
        /usr/local/include
    )
    
    find_library(LIBZIP_LIBRARY
        NAMES zip libzip
        PATHS
        ${CMAKE_SOURCE_DIR}/libs/libzip/lib
        "C:/libzip/lib"
        "C:/vcpkg/installed/x64-windows/lib"
        "C:/vcpkg/installed/x86-windows/lib"
        /usr/lib
        /usr/local/lib
    )
    
    if(LIBZIP_INCLUDE_DIR AND LIBZIP_LIBRARY)
        set(LIBZIP_FOUND TRUE)
        set(LIBZIP_INCLUDE_DIRS ${LIBZIP_INCLUDE_DIR})
        set(LIBZIP_LIBRARIES ${LIBZIP_LIBRARY})
    endif()
endif()

if(NOT LIBZIP_FOUND)
    message(FATAL_ERROR "libzip not found! Please install libzip. See SETUP_REQUIREMENTS.md for instructions.")
endif()

# Include directories
include_directories(${LIBZIP_INCLUDE_DIRS})
include_directories(backend/include)

# Source files
set(BACKEND_SOURCES
    backend/src/main.cpp
    backend/src/zip_parser.cpp
    backend/src/http_server.cpp
)

# Create executable
add_executable(zip-tree-server ${BACKEND_SOURCES})

# Link libraries
target_link_libraries(zip-tree-server ${LIBZIP_LIBRARIES})

# Add compile options if available
if(LIBZIP_CFLAGS_OTHER)
    target_compile_options(zip-tree-server PRIVATE ${LIBZIP_CFLAGS_OTHER})
endif()

# On Windows, link ws2_32 for sockets
if(WIN32)
    target_link_libraries(zip-tree-server ws2_32)
endif()

# Copy frontend files to build directory
file(COPY frontend DESTINATION ${CMAKE_BINARY_DIR})

