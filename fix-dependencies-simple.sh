echo "🔧 Fixing TaazaBazaar dependencies (no package-lock.json detected)..."

# Step 1: Clean node_modules and cache
echo "🧹 Cleaning project..."
rm -rf node_modules .expo

# Step 2: Clear npm cache
echo "🗑️ Clearing npm cache..."
npm cache clean --force

# Step 3: Install dependencies
echo "📦 Installing all dependencies..."
npm install --legacy-peer-deps

# Step 4: Verify installation
echo "✅ Installation complete!"
echo "📱 You can now run: npx expo start --clear"
echo "🔄 Make sure to restart your Expo Go app completely"
