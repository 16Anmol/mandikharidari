# PowerShell script for fixing dependencies (no package-lock.json)

Write-Host "🔧 Fixing TaazaBazaar dependencies (no package-lock.json detected)..." -ForegroundColor Cyan

# Step 1: Clean node_modules and cache
Write-Host "🧹 Cleaning project..." -ForegroundColor Yellow
if (Test-Path "node_modules") { 
    Write-Host "Removing node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules" 
}
if (Test-Path ".expo") { 
    Write-Host "Removing .expo cache..." -ForegroundColor Gray
    Remove-Item -Recurse -Force ".expo" 
}

# Step 2: Clear npm cache
Write-Host "🗑️ Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Step 3: Install dependencies with legacy peer deps
Write-Host "📦 Installing all dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Step 4: Verify installation
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host "📱 You can now run: npx expo start --clear" -ForegroundColor Cyan
Write-Host "🔄 Make sure to restart your Expo Go app completely" -ForegroundColor Yellow
