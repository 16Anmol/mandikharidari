import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  RefreshControl,
  Modal,
  Dimensions,
  FlatList,
} from 'react-native';
import { Search, User, Menu, MapPin, X, LogOut, Phone, Mail, CircleHelp as HelpCircle, TrendingUp, Clock, Star, Truck } from 'lucide-react-native';
import { router } from 'expo-router';
import { getProducts, subscribeToProducts } from '@/services/supabase';
import type { Product } from '@/services/supabase';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import LocationPicker from '@/components/LocationPicker';
import type { LocationDetails } from '@/services/googleMaps';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  {
    id: 1,
    title: 'Fresh Vegetables',
    icon: '🥬',
    color: '#22C55E',
    onPress: () => router.push('/category/vegetables'),
  },
  {
    id: 2,
    title: 'Fresh Fruits',
    icon: '🍎',
    color: '#EF4444',
    onPress: () => router.push('/category/fruits'),
  },
  {
    id: 3,
    title: 'Seasonal Picks',
    icon: '🌟',
    color: '#F59E0B',
    onPress: () => router.push('/category/seasonal'),
  },
  {
    id: 4,
    title: 'All Products',
    icon: '🛒',
    color: '#8B5CF6',
    onPress: () => router.push('/category/all'),
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationDetails | null>(null);
  const { addItem } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    loadProducts();
    const subscription = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image_url,
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMandiRatesPress = () => {
    router.push('/mandi-rates');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  const handleLocationSelect = (location: LocationDetails) => {
    setUserLocation(location);
  };

  const renderQuickAction = (action: any) => (
    <TouchableOpacity
      key={action.id}
      style={[styles.quickActionCard, { borderColor: action.color }]}
      onPress={action.onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.quickActionIcon}>{action.icon}</Text>
      <Text style={styles.quickActionTitle}>{action.title}</Text>
    </TouchableOpacity>
  );

  const renderProductGrid = (productList: Product[], title: string, viewAllRoute: string) => {
    const rows = [];
    for (let i = 0; i < productList.length; i += 2) {
      const rowProducts = productList.slice(i, i + 2);
      rows.push(
        <View key={i} style={styles.productRow}>
          {rowProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image
                source={{
                  uri: product.image_url || `https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400`,
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>₹{product.price}/{product.unit}</Text>
                <Text style={styles.mandiPrice}>Mandi: ₹{Math.round(product.price * 0.8)}/{product.unit}</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(product)}>
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {/* Fill empty space if odd number of products */}
          {rowProducts.length === 1 && <View style={styles.emptyCard} />}
        </View>
      );
    }

    return (
      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => router.push(viewAllRoute)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {rows}
      </View>
    );
  };

  const menuItems = [
    {
      icon: <MapPin size={20} color="#64748B" />,
      title: 'Change Location',
      onPress: () => setShowLocationPicker(true),
    },
    {
      icon: <TrendingUp size={20} color="#64748B" />,
      title: 'All Mandi Rates',
      onPress: handleMandiRatesPress,
    },
    { icon: <User size={20} color="#64748B" />, title: 'Profile', onPress: () => router.push('/profile') },
    {
      icon: <Clock size={20} color="#64748B" />,
      title: 'Order History',
      onPress: () => router.push('/order-history'),
    },
    {
      icon: <Search size={20} color="#64748B" />,
      title: 'View All Products',
      onPress: () => router.push('/category/all'),
    },
    { icon: <Phone size={20} color="#64748B" />, title: 'Contact', onPress: () => {} },
    { icon: <HelpCircle size={20} color="#64748B" />, title: 'FAQ', onPress: () => {} },
    { icon: <Mail size={20} color="#64748B" />, title: 'About', onPress: () => {} },
    { icon: <LogOut size={20} color="#EF4444" />, title: 'Logout', onPress: handleLogout, textColor: '#EF4444' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(true)}>
          <Menu size={24} stroke="#22C55E" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Search size={18} stroke="#94A3B8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vegetables, fruits..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholderTextColor="#94A3B8"
          />
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
          <User size={20} stroke="#22C55E" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Location Bar */}
      <TouchableOpacity style={styles.locationBar} onPress={() => setShowLocationPicker(true)}>
        <MapPin size={16} color="#22C55E" />
        <Text style={styles.locationText}>
          {userLocation
            ? `${userLocation.city}, ${userLocation.state}`
            : `${user?.city || 'Amritsar'}, ${user?.state || 'Punjab'}`}
        </Text>
        <Text style={styles.changeLocationText}>Change</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.appName}>MandiKharidari</Text>
          <Text style={styles.tagline}>Fresh • Fast • Fair Prices</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Star size={16} color="#F59E0B" />
              <Text style={styles.statText}>4.8 Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Truck size={16} color="#22C55E" />
              <Text style={styles.statText}>30min Delivery</Text>
            </View>
          </View>
        </View>

        {/* Promo Image */}
        <View style={styles.promoImageWrapper}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.promoImage}
            resizeMode="cover"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>{QUICK_ACTIONS.map(renderQuickAction)}</View>
        </View>

        {/* Product Grids - 2 columns */}
        {renderProductGrid(
          products.filter((p) => p.type === 'vegetable').slice(0, 6),
          'Fresh Vegetables',
          '/category/vegetables'
        )}

        {renderProductGrid(
          products.filter((p) => p.type === 'fruit').slice(0, 6),
          'Fresh Fruits',
          '/category/fruits'
        )}

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Hamburger Menu Modal */}
      <Modal visible={showMenu} animationType="slide" transparent>
        <View style={styles.menuOverlay}>
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <User size={24} color="#22C55E" />
                </View>
                <View>
                  <Text style={styles.userName}>{user?.name || 'User'}</Text>
                  <Text style={styles.userLocation}>
                    {userLocation
                      ? `${userLocation.city}, ${userLocation.state}`
                      : `${user?.city || 'Amritsar'}, ${user?.state || 'Punjab'}`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    item.onPress();
                  }}
                >
                  {item.icon}
                  <Text style={[styles.menuItemText, { color: item.textColor || '#1E293B' }]}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.menuFooter}>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Picker */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={userLocation?.coordinates}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1E293B',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    marginLeft: 8,
  },
  changeLocationText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  promoImageWrapper: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  promoImage: {
    width: '100%',
    height: 180,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 64) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  productsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  viewAllText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyCard: {
    flex: 1,
    marginHorizontal: 6,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
    minHeight: 36,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 2,
  },
  mandiPrice: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 100,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  userLocation: {
    fontSize: 12,
    color: '#64748B',
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
  },
  menuFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});