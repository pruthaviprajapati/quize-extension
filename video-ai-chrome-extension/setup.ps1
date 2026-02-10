# Video AI Chrome Extension - Complete Setup Script
# Run this script to install all dependencies

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Video AI Extension - Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js v18+ first." -ForegroundColor Red
    exit 1
}

# Backend Setup
Write-Host ""
Write-Host "Setting up Backend..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
}

# Check .env file
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠ IMPORTANT: Edit backend\.env and add your Gemini API key!" -ForegroundColor Red
}

Set-Location -Path ".."

# Extension Setup
Write-Host ""
Write-Host "Setting up Chrome Extension..." -ForegroundColor Yellow
Set-Location -Path "extension"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Extension dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Extension installation failed" -ForegroundColor Red
}

Write-Host "Building extension..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Extension built successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Extension build failed" -ForegroundColor Red
}

Set-Location -Path ".."

# Dashboard Setup
Write-Host ""
Write-Host "Setting up Dashboard..." -ForegroundColor Yellow
Set-Location -Path "dashboard"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dashboard dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Dashboard installation failed" -ForegroundColor Red
}

Set-Location -Path ".."

# Summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. MongoDB Setup:" -ForegroundColor White
Write-Host "   - Open MongoDB Compass" -ForegroundColor Gray
Write-Host "   - Connect to: mongodb://127.0.0.1:27017" -ForegroundColor Gray
Write-Host "   - Create database: video_ai_extension" -ForegroundColor Gray
Write-Host "   - Create collection: generatedcontents" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configure Gemini API Key:" -ForegroundColor White
Write-Host "   - Edit: backend\.env" -ForegroundColor Gray
Write-Host "   - Add your Gemini API key" -ForegroundColor Gray
Write-Host "   - Get key: https://makersuite.google.com/app/apikey" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start Backend Server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Load Extension in Chrome:" -ForegroundColor White
Write-Host "   - Go to: chrome://extensions/" -ForegroundColor Gray
Write-Host "   - Enable 'Developer mode'" -ForegroundColor Gray
Write-Host "   - Click 'Load unpacked'" -ForegroundColor Gray
Write-Host "   - Select: extension\dist folder" -ForegroundColor Gray
Write-Host ""
Write-Host "5. (Optional) Start Dashboard:" -ForegroundColor White
Write-Host "   cd dashboard" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed instructions, see README.md or QUICKSTART.md" -ForegroundColor Cyan
Write-Host ""
