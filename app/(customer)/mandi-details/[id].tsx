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
} from "react-native"
import { ArrowLeft, Search, Filter, TrendingUp, TrendingDown, Minus } from "lucide-react-native"
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mandiProducts = generateMandiProducts()
      setProducts(mandiProducts)
      setFilteredProducts(mandiProducts)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = products

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategory, products])

  const handleBack = () => {
    router.back()
  }

  const renderPriceChange = (change: number, changePercent: number) => {
    if (change > 0) {
      return (
        <View style={[styles.changeContainer, styles.priceUp]}>
          <TrendingUp size={10} color="#EF4444" />
          <Text style={styles.changeTextUp}>+₹{change}</Text>
        </View>
      )
    } else if (change < 0) {
      return (
        <View style={[styles.changeContainer, styles.priceDown]}>
          <TrendingDown size={10} color="#22C55E" />
          <Text style={styles.changeTextDown}>₹{change}</Text>
        </View>
      )
    } else {
      return (
        <View style={[styles.changeContainer, styles.priceStable]}>
          <Minus size={10} color="#64748B" />
          <Text style={styles.changeTextStable}>--</Text>
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
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productQuality}>{item.quality} Quality</Text>
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>₹{item.currentPrice}/kg</Text>
          {renderPriceChange(item.change, item.changePercent)}
        </View>
        <Text style={styles.lastUpdated}>Updated {item.lastUpdated}</Text>
      </View>
    </View>
  )

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, selectedCategory === "all" && styles.filterButtonActive]}
        onPress={() => setSelectedCategory("all")}
      >
        <Text style={[styles.filterText, selectedCategory === "all" && styles.filterTextActive]}>All</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, selectedCategory === "vegetable" && styles.filterButtonActive]}
        onPress={() => setSelectedCategory("vegetable")}
      >
        <Text style={[styles.filterText, selectedCategory === "vegetable" && styles.filterTextActive]}>Vegetables</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, selectedCategory === "fruit" && styles.filterButtonActive]}
        onPress={() => setSelectedCategory("fruit")}
      >
        <Text style={[styles.filterText, selectedCategory === "fruit" && styles.filterTextActive]}>Fruits</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Amritsar Mandi</Text>
        <TouchableOpacity style={styles.filterIcon}>
          <Filter size={20} color="#64748B" />
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

      {renderCategoryFilter()}

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredProducts.length}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>Live</Text>
          <Text style={styles.statLabel}>Prices</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>24/7</Text>
          <Text style={styles.statLabel}>Updates</Text>
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
          numColumns={1}
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
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  filterIcon: {
    padding: 8,
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
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterButtonActive: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  filterText: {
    fontSize: 14,
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
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  productQuality: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22C55E",
    marginRight: 8,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
    marginLeft: 2,
  },
  changeTextDown: {
    fontSize: 10,
    fontWeight: "600",
    color: "#22C55E",
    marginLeft: 2,
  },
  changeTextStable: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 2,
  },
  lastUpdated: {
    fontSize: 11,
    color: "#94A3B8",
    fontStyle: "italic",
  },
})
