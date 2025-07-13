"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { ArrowLeft, Search, ListFilter as Filter, TrendingUp, TrendingDown, Minus, Clock, MapPin } from "lucide-react-native"
import { router, useLocalSearchParams } from "expo-router"
import { mockProducts } from "@/services/mockData"

interface MandiProduct {
  id: string
  name: string
  currentPrice: number
  previousPrice: number
  change: number
  changePercent: number
  image: string
  category: "vegetable" | "fruit"
  quality: "Premium" | "Standard" | "Economy"
  lastUpdated: string
}

const generateMandiProducts = (): MandiProduct[] => {
  return mockProducts.map((product, index) => ({
    id: product.id,
    name: product.name,
    currentPrice: Math.round(product.price * 0.8), // Mandi price is typically lower
    previousPrice: Math.round(product.price * 0.8 * (0.9 + Math.random() * 0.2)),
    change: Math.round((Math.random() - 0.5) * 10),
    changePercent: (Math.random() - 0.5) * 20,
    image: product.image_url || "",
    category: product.type,
    quality: ["Premium", "Standard", "Economy"][index % 3] as "Premium" | "Standard" | "Economy",
    lastUpdated: `${Math.floor(Math.random() * 3) + 1} hours ago`,
  }))
}

export default function MandiDetailsScreen() {
  const { id } = useLocalSearchParams()
  const [products, setProducts] = useState<MandiProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<MandiProduct[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "vegetable" | "fruit">("all")
  const [selectedQuality, setSelectedQuality] = useState<"all" | "Premium" | "Standard" | "Economy">("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, selectedCategory, selectedQuality, products])

  const loadProducts = async () => {
    setLoading(true)
    // Simulate loading
    setTimeout(() => {
      const mandiProducts = generateMandiProducts()
      setProducts(mandiProducts)
      setFilteredProducts(mandiProducts)
      setLoading(false)
    }, 1000)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
  }

  const filterProducts = () => {
    let filtered = products

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Filter by quality
    if (selectedQuality !== "all") {
      filtered = filtered.filter((product) => product.quality === selectedQuality)
    }

    setFilteredProducts(filtered)
  }

  const handleBack = () => {
    router.back()
  }

  const renderPriceChange = (change: number, changePercent: number) => {
    if (change > 0) {
      return (
        <View style={[styles.changeContainer, styles.priceUp]}>
          <TrendingUp size={12} color="#EF4444" />
          <Text style={styles.changeTextUp}>+₹{change} (+{changePercent.toFixed(1)}%)</Text>
        </View>
      )
    } else if (change < 0) {
      return (
        <View style={[styles.changeContainer, styles.priceDown]}>
          <TrendingDown size={12} color="#22C55E" />
          <Text style={styles.changeTextDown}>₹{change} ({changePercent.toFixed(1)}%)</Text>
        </View>
      )
    } else {
      return (
        <View style={[styles.changeContainer, styles.priceStable]}>
          <Minus size={12} color="#64748B" />
          <Text style={styles.changeTextStable}>No change</Text>
        </View>
      )
    }
  }

  const renderProductItem = ({ item }: { item: MandiProduct }) => (
    <View style={styles.productCard}>
      <Image
        source={{
          uri: item.image || `/placeholder.svg?height=60&width=60&text=${item.name}`,
        }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(item.quality) }]}>
            <Text style={styles.qualityText}>{item.quality}</Text>
          </View>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>₹{item.currentPrice}/kg</Text>
          {renderPriceChange(item.change, item.changePercent)}
        </View>
        <View style={styles.productFooter}>
          <Text style={styles.lastUpdated}>Updated {item.lastUpdated}</Text>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </View>
  )

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Premium": return "#22C55E"
      case "Standard": return "#3B82F6"
      case "Economy": return "#F59E0B"
      default: return "#64748B"
    }
  }

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Category:</Text>
        <View style={styles.filterButtons}>
          {["all", "vegetable", "fruit"].map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterButton, selectedCategory === category && styles.filterButtonActive]}
              onPress={() => setSelectedCategory(category as any)}
            >
              <Text style={[styles.filterText, selectedCategory === category && styles.filterTextActive]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Quality:</Text>
        <View style={styles.filterButtons}>
          {["all", "Premium", "Standard", "Economy"].map((quality) => (
            <TouchableOpacity
              key={quality}
              style={[styles.filterButton, selectedQuality === quality && styles.filterButtonActive]}
              onPress={() => setSelectedQuality(quality as any)}
            >
              <Text style={[styles.filterText, selectedQuality === quality && styles.filterTextActive]}>
                {quality}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Amritsar Main Mandi</Text>
          <View style={styles.locationInfo}>
            <MapPin size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.locationText}>Punjab, India</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.filterIcon}>
          <Filter size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94A3B8"
        />
      </View>

      {renderFilters()}

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredProducts.length}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#22C55E" }]}>Live</Text>
          <Text style={styles.statLabel}>Prices</Text>
        </View>
        <View style={styles.statItem}>
          <View style={styles.updateIndicator}>
            <Clock size={16} color="#22C55E" />
            <Text style={[styles.statNumber, { fontSize: 16 }]}>2m</Text>
          </View>
          <Text style={styles.statLabel}>Last Update</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={styles.loadingText}>Loading mandi rates...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#22C55E",
    minHeight: 80,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  filterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  filtersContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterButtonActive: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#22C55E",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  updateIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  productsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: "cover",
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
    marginRight: 8,
  },
  qualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22C55E",
    marginRight: 12,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  priceUp: {
    backgroundColor: "#FEF2F2",
  },
  priceDown: {
    backgroundColor: "#F0FDF4",
  },
  priceStable: {
    backgroundColor: "#F8FAFC",
  },
  changeTextUp: {
    fontSize: 10,
    fontWeight: "600",
    color: "#EF4444",
  },
  changeTextDown: {
    fontSize: 10,
    fontWeight: "600",
    color: "#22C55E",
  },
  changeTextStable: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastUpdated: {
    fontSize: 11,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  categoryText: {
    fontSize: 11,
    color: "#64748B",
    textTransform: "capitalize",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
})