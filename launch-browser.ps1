# Launch ZIP Tree Visualizer in Browser (Client-Side Only)
# This opens the HTML file directly in your default browser
# No server needed - works completely offline!

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ZIP Tree Visualizer - Browser Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$htmlPath = Join-Path $PSScriptRoot "frontend\index.html"

if (-not (Test-Path $htmlPath)) {
    Write-Host "ERROR: index.html not found at: $htmlPath" -ForegroundColor Red
    exit 1
}

Write-Host "Opening application in your default browser..." -ForegroundColor Green
Write-Host "File: $htmlPath" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: This is a client-side application." -ForegroundColor Yellow
Write-Host "All processing happens in your browser - no server needed!" -ForegroundColor Yellow
Write-Host ""

# Open in default browser
Start-Process $htmlPath

Write-Host "Application opened!" -ForegroundColor Green
Write-Host ""
Write-Host "Features:" -ForegroundColor Cyan
Write-Host "  ✓ Upload ZIP files" -ForegroundColor White
Write-Host "  ✓ View project tree structure" -ForegroundColor White
Write-Host "  ✓ Export as JPG or PNG" -ForegroundColor White
Write-Host "  ✓ Works completely offline" -ForegroundColor White

