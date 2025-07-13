echo "🚀 Installing TaazaBazaar dependencies..."

# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install dependencies with legacy peer deps to resolve conflicts
npm install --legacy-peer-deps

# Install specific packages that might be missing
npm install --legacy-peer-deps lucide-react-native@^0.260.0
npm install --legacy-peer-deps @react-native-async-storage/async-storage
npm install --legacy-peer-deps @supabase/supabase-js

echo "✅ Dependencies installed successfully!"
echo "📱 You can now run: npx expo start"
