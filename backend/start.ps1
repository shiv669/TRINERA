# Trinera Backend Startup Script
# Run this script to start the FastAPI backend server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Trinera Pest Detection - Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location -Path $PSScriptRoot

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Error: .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created. Please add your HF_TOKEN before starting." -ForegroundColor Green
    Write-Host ""
    Write-Host "Get your Hugging Face token from: https://huggingface.co/settings/tokens" -ForegroundColor Cyan
    pause
    exit
}

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Check if dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
$installed = pip freeze
if ($installed -notmatch "fastapi") {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

# Set Python path
$env:PYTHONPATH = (Get-Location).Path

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Starting FastAPI Server..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "API URL:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
