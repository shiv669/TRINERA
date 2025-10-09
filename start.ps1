# Quick Start Script for Trinera Project
# This script starts both backend and frontend

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     Trinera Pest Detection System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

if (-not $FrontendOnly) {
    Write-Host "📦 Starting Backend Server..." -ForegroundColor Yellow
    Write-Host ""
    
    # Start backend in a new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; .\start.ps1"
    
    Write-Host "✓ Backend starting in new window" -ForegroundColor Green
    Write-Host "  URL: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "  Docs: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host ""
    
    Start-Sleep -Seconds 3
}

if (-not $BackendOnly) {
    Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check if node_modules exists
    if (-not (Test-Path "$rootDir\node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        Set-Location $rootDir
        npm install
        Write-Host "✓ Dependencies installed" -ForegroundColor Green
    }
    
    # Start frontend
    Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
    Set-Location $rootDir
    npm run dev
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Trinera is Running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000/interbot" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
