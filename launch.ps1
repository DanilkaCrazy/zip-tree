# ZIP Tree Visualizer Launcher Script
# This script helps set up and launch the application

Write-Host "ZIP Tree Visualizer - Setup and Launch" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check for CMake
$cmakePath = Get-Command cmake -ErrorAction SilentlyContinue
if (-not $cmakePath) {
    Write-Host "CMake not found in PATH." -ForegroundColor Yellow
    Write-Host "Please install CMake from: https://cmake.org/download/" -ForegroundColor Yellow
    Write-Host "Or use Visual Studio which includes CMake." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatively, you can:" -ForegroundColor Yellow
    Write-Host "1. Install Visual Studio with C++ development tools" -ForegroundColor Yellow
    Write-Host "2. Install CMake separately" -ForegroundColor Yellow
    Write-Host "3. Install libzip library" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check for build directory
if (-not (Test-Path "build")) {
    Write-Host "Creating build directory..." -ForegroundColor Green
    New-Item -ItemType Directory -Path "build" | Out-Null
}

# Configure with CMake
Write-Host "Configuring project with CMake..." -ForegroundColor Green
Set-Location build
cmake ..

if ($LASTEXITCODE -ne 0) {
    Write-Host "CMake configuration failed!" -ForegroundColor Red
    Write-Host "Make sure libzip is installed. See BUILD.md for instructions." -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

# Build the project
Write-Host "Building project..." -ForegroundColor Green
cmake --build . --config Release

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Find the executable
$exePath = Get-ChildItem -Path . -Filter "zip-tree-server.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $exePath) {
    $exePath = Get-ChildItem -Path . -Filter "zip-tree-server" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
}

if ($exePath) {
    Write-Host ""
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "Starting server..." -ForegroundColor Green
    Write-Host "Open http://localhost:8080 in your browser" -ForegroundColor Cyan
    Write-Host ""
    Set-Location ..
    & $exePath.FullName
} else {
    Write-Host "Executable not found after build!" -ForegroundColor Red
    Write-Host "Check build output for errors." -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

