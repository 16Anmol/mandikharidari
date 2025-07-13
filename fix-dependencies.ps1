# PowerShell script to fix all dependency issues

Write-Host "🔧 Fixing TaazaBazaar dependency issues..." -ForegroundColor Cyan

# Step 1: Clean everything
Write-Host "🧹 Cleaning project..." -ForegroundColor Yellow
if (Test-Path "node_modules") { 
    Write-Host "Removing node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules" 
}
if (Test-Path "package-lock.json") { 
    Write-Host "Removing package-lock.json..." -ForegroundColor Gray
    Remove-Item -Force "package-lock.json" 
}
if (Test-Path ".expo") { 
    Write-Host "Removing .expo cache..." -ForegroundColor Gray
    Remove-Item -Recurse -Force ".expo" 
}

# Step 2: Clear npm cache
Write-Host "🗑️ Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Step 3: Install Expo CLI globally (if not installed)
Write-Host "📦 Checking Expo CLI..." -ForegroundColor Yellow
try {
    $expoVersion = npx expo --version
    Write-Host "Expo CLI found: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing Expo CLI..." -ForegroundColor Yellow
    npm install -g @expo/cli
}

# Step 4: Install dependencies with legacy peer deps
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Step 5: Install specific packages that might conflict
Write-Host "🔧 Installing specific packages..." -ForegroundColor Yellow
npm install --legacy-peer-deps react-native-svg@15.8.0
npm install --legacy-peer-deps lucide-react-native@0.468.0
npm install --legacy-peer-deps @react-native-async-storage/async-storage@1.24.0
npm install --legacy-peer-deps @supabase/supabase-js@2.39.3

# Step 6: Clear Expo cache
Write-Host "🧹 Clearing Expo cache..." -ForegroundColor Yellow
npx expo install --fix

Write-Host "✅ All dependencies fixed!" -ForegroundColor Green
Write-Host "📱 You can now run: npx expo start" -ForegroundColor Cyan
Write-Host "🔄 If you still see SDK mismatch, restart Expo Go app" -ForegroundColor Yellow
