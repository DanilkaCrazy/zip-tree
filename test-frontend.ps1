# Simple test server for frontend (without backend functionality)
# This allows you to see the UI, but ZIP upload won't work without the C++ backend

Write-Host "Starting simple test server for frontend..." -ForegroundColor Cyan
Write-Host "Note: ZIP upload functionality requires the C++ backend to be built." -ForegroundColor Yellow
Write-Host "This is just to preview the UI." -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Check if Python is available
$python = Get-Command python -ErrorAction SilentlyContinue
if ($python) {
    Set-Location $PSScriptRoot
    python -m http.server 8000
} else {
    # Try Python 3
    $python3 = Get-Command python3 -ErrorAction SilentlyContinue
    if ($python3) {
        Set-Location $PSScriptRoot
        python3 -m http.server 8000
    } else {
        Write-Host "Python not found. Please install Python to use this test server." -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternatively, you can:" -ForegroundColor Yellow
        Write-Host "1. Install CMake and build the full application (see SETUP_REQUIREMENTS.md)" -ForegroundColor Yellow
        Write-Host "2. Use any HTTP server to serve the frontend folder" -ForegroundColor Yellow
        Write-Host "3. Open index.html directly in browser (some features may not work)" -ForegroundColor Yellow
    }
}

