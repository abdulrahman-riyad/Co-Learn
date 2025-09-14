# Path: co-learn/apis/run-tests.ps1
# Role: PowerShell script to run tests on Windows
# Run with: .\run-tests.ps1

Write-Host "🧪 Co-Learn API Test Runner (Windows)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if TypeScript is installed
$tsCheck = npm list typescript 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "📦 Installing TypeScript..." -ForegroundColor Yellow
    npm install --save-dev typescript @types/node @types/mocha @types/chai
}

# Check if PostgreSQL is running
Write-Host "🔍 Checking PostgreSQL..." -ForegroundColor Yellow
docker ps | Select-String "postgres" | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL is not running" -ForegroundColor Red
    Write-Host "   Run: docker start colearn-postgres" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Running Tests..." -ForegroundColor Cyan
Write-Host "----------------" -ForegroundColor Cyan

# Run simple test first
Write-Host ""
Write-Host "1️⃣ Simple Test" -ForegroundColor Yellow
npm run test:simple 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Simple test passed" -ForegroundColor Green
} else {
    Write-Host "❌ Simple test failed" -ForegroundColor Red
}

# Run database tests
Write-Host ""
Write-Host "2️⃣ Database Tests" -ForegroundColor Yellow
npm run test:db 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Database tests failed" -ForegroundColor Red
}

# Run folder tests
Write-Host ""
Write-Host "3️⃣ Folder Tests" -ForegroundColor Yellow
npm run test:folders 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Folder tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Folder tests failed" -ForegroundColor Red
}

# Run classroom tests
Write-Host ""
Write-Host "4️⃣ Classroom Tests" -ForegroundColor Yellow
npm run test:classrooms 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Classroom tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Classroom tests failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✨ Test run complete!" -ForegroundColor Green