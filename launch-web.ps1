# Launch ZIP Tree Visualizer Web Application
# This script starts the Python web server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ZIP Tree Visualizer - Web Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    $python = Get-Command python3 -ErrorAction SilentlyContinue
}

if (-not $python) {
    Write-Host "ERROR: Python not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python 3 from: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "Make sure to add Python to PATH during installation." -ForegroundColor Yellow
    exit 1
}

Write-Host "Python found: $($python.Source)" -ForegroundColor Green
Write-Host ""

# Check if required Python modules are available
Write-Host "Checking dependencies..." -ForegroundColor Cyan
try {
    $null = python -c "import zipfile" 2>&1
    Write-Host "  zipfile: OK (built-in)" -ForegroundColor Green
} catch {
    Write-Host "  zipfile: ERROR" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting web server..." -ForegroundColor Green
Write-Host ""

# Start the server
python server.py

