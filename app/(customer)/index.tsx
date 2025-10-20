"use client"

import { useState, useRef } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
} from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import HamburgerMenu from "@/components/HamburgerMenu"

const { width } = Dimensions.get("window")

// Mock promo data
const promoImages = [
  {
    id: 1,
    image: require("../../assets/tagline.png"),
  },
  {
    id: 2,
    image: require("../../assets/family.png"),
  },
  {
    id: 3,
    image: require("../../assets/promo.png"),
  },
]

// Mock categories data
const categories = [
  { id: 1, name: "Vegetables", icon: "🥬", slug: "vegetables" },
  { id: 2, name: "Fruits", icon: "🍎",  slug: "fruits" },
]

// Featured products with actual vegetable images
const featuredProducts = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    price: 40,
    unit: "per kg",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg",
    rating: 4.5,
    inStock: true,
  },
  {
    id: 2,
    name: "Organic Onions",
    price: 35,
    unit: "per kg",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSh-YViUCvKM3biv4ndaDha0-Ox3taOMxr26w&s",
    rating: 4.2,
    inStock: true,
  },
  
  {
    id: 4,
    name: "Fresh Carrots",
    price: 45,
    unit: "per kg",
    image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=200&h=200&fit=crop",
    rating: 4.3,
    inStock: true,
  },
  {
    id: 5,
    name: "Green Spinach",
    price: 25,
    unit: "per kg",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/af/Green_Magic_Vegetables_Spinach_%2841648196070%29.jpg",
    rating: 4.6,
    inStock: true,
  },
  {
    id: 6,
    name: "Fresh Potatoes",
    price: 30,
    unit: "per kg",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop",
    rating: 4.4,
    inStock: true,
  },
]

export default function CustomerHome() {
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  const promoRef = useRef<FlatList>(null)

  const renderPromoItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.promoSlide}>
      <Image source={item.image} style={styles.promoImage} />
    </View>
  )

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/(customer)/category/${item.slug}`)}
      activeOpacity={0.8}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryEmoji}>{item.icon}</Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
     
    </TouchableOpacity>
  )

  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push("/(customer)/category/vegetables")}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {!item.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productRating}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.productPricing}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          <Text style={styles.productUnit}>{item.unit}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addToCartBtn, !item.inStock && styles.disabledBtn]}
          disabled={!item.inStock}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.addToCartText}>Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const onPromoScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width
    const index = event.nativeEvent.contentOffset.x / slideSize
    const roundIndex = Math.round(index)
    setCurrentPromoIndex(roundIndex)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <HamburgerMenu currentScreen="/(customer)" />
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Mandi Kharidari</Text>
            <Text style={styles.subtitle}>Fresh vegetables at your doorstep</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push("/(customer)/profile")}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={32} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/(customer)/search")}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color="#666" />
          <Text style={styles.searchPlaceholder}>Search for vegetables, fruits...</Text>
        </TouchableOpacity>

        {/* Promo Carousel */}
        <View style={styles.promoSection}>
          <FlatList
            ref={promoRef}
            data={promoImages}
            renderItem={renderPromoItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onPromoScroll}
            scrollEventThrottle={16}
          />
          <View style={styles.promoIndicators}>
            {promoImages.map((_, index) => (
              <View key={index} style={[styles.indicator, index === currentPromoIndex && styles.activeIndicator]} />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/(customer)/mandi-rates")}
            activeOpacity={0.8}
          >
            <Ionicons name="trending-up" size={24} color="#2E7D32" />
            <Text style={styles.actionText}>Mandi Rates</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/(customer)/order-history")}
            activeOpacity={0.8}
          >
            <Ionicons name="time" size={24} color="#2E7D32" />
            <Text style={styles.actionText}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/(customer)/feedback")}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="#2E7D32" />
            <Text style={styles.actionText}>Feedback</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.categoryRow}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push("/(customer)/category/vegetables")} activeOpacity={0.8}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={featuredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12, // Reduced from 15
    backgroundColor: "#22C55E", // Consistent green
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  greeting: {
    fontSize: 20, // Reduced from 24
    fontWeight: "bold",
    color: "#FFFFFF", // Changed to white
  },
  subtitle: {
    fontSize: 12, // Reduced from 14
    color: "rgba(255,255,255,0.8)", // Changed to white with opacity
    marginTop: 2,
  },
  profileBtn: {
    padding: 5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 12, // Reduced from 15
    paddingHorizontal: 15,
    paddingVertical: 10, // Reduced from 12
    borderRadius: 20, // Reduced from 25
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: "#666",
    fontSize: 16,
  },
  promoSection: {
    marginVertical: 10,
  },
  promoSlide: {
    width: width - 40,
    height: 180,
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
  },
  promoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  promoIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#2E7D32",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 16, // Reduced from 20
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 8, // Reduced from 10
    borderRadius: 12, // Reduced from 15
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionBtn: {
    alignItems: "center",
    flex: 1,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAll: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryRow: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  categoryCard: {
    backgroundColor: "white",
    borderRadius: 12, // Reduced from 15
    padding: 16, // Reduced from 20
    alignItems: "center",
    width: (width - 60) / 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  categoryCount: {
    fontSize: 12,
    color: "#666",
  },
  productsContainer: {
    paddingRight: 20,
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: 12, // Reduced from 15
    marginRight: 12, // Reduced from 15
    width: 140, // Reduced from 160
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImageContainer: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 100, // Reduced from 120
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: "cover",
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  outOfStockText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  productInfo: {
    padding: 10, // Reduced from 12
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  productRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
  productPricing: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  productUnit: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  addToCartBtn: {
    backgroundColor: "#2E7D32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledBtn: {
    backgroundColor: "#CCCCCC",
  },
  addToCartText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
})
