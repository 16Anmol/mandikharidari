# PowerShell script for Windows users

Write-Host "🚀 Installing TaazaBazaar dependencies..." -ForegroundColor Green

# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }

# Install dependencies with legacy peer deps to resolve conflicts
npm install --legacy-peer-deps

# Install specific packages that might be missing
npm install --legacy-peer-deps lucide-react-native@0.260.0
npm install --legacy-peer-deps "@react-native-async-storage/async-storage"
npm install --legacy-peer-deps "@supabase/supabase-js"

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host "📱 You can now run: npx expo start" -ForegroundColor Yellow
