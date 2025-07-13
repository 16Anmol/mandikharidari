echo "🔧 Fixing TaazaBazaar dependency issues..."

# Step 1: Clean everything
echo "🧹 Cleaning project..."
rm -rf node_modules package-lock.json .expo

# Step 2: Clear npm cache
echo "🗑️ Clearing npm cache..."
npm cache clean --force

# Step 3: Check Expo CLI
echo "📦 Checking Expo CLI..."
if ! command -v expo &> /dev/null; then
    echo "Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Step 4: Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Step 5: Install specific packages
echo "🔧 Installing specific packages..."
npm install --legacy-peer-deps react-native-svg@15.8.0
npm install --legacy-peer-deps lucide-react-native@0.468.0
npm install --legacy-peer-deps @react-native-async-storage/async-storage@1.24.0
npm install --legacy-peer-deps @supabase/supabase-js@2.39.3

# Step 6: Fix Expo dependencies
echo "🧹 Fixing Expo dependencies..."
npx expo install --fix

echo "✅ All dependencies fixed!"
echo "📱 You can now run: npx expo start"
echo "🔄 If you still see SDK mismatch, restart Expo Go app"
