"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { ArrowLeft, Search, TrendingUp, TrendingDown } from "lucide-react-native"
import { router } from "expo-router"
import { getMatchedVendorPrices } from "@/services/supabase"
import type { Product } from "@/services/supabase"
import HamburgerMenu from "@/components/HamburgerMenu"

interface ProductComparison {
  product: Product
  vendorPrice?: number
}

export default function PriceComparisonScreen() {
  const [productComparisons, setProductComparisons] = useState<ProductComparison[]>([])
  const [filteredComparisons, setFilteredComparisons] = useState<ProductComparison[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "vegetable" | "fruit">("all")
  const [userLocation] = useState("amritsar") // Default to Amritsar, can be made dynamic

  useEffect(() => {
    loadPriceComparisons()
  }, [])

  useEffect(() => {
    filterComparisons()
  }, [productComparisons, searchQuery, selectedFilter])

  const loadPriceComparisons = async () => {
    try {
      setLoading(true)
      const comparisons = await getMatchedVendorPrices(userLocation)
      setProductComparisons(comparisons)
    } catch (error) {
      console.error("Failed to load price comparisons:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterComparisons = () => {
    let filtered = productComparisons

    if (selectedFilter !== "all") {
      filtered = filtered.filter((c) => c.product.type === selectedFilter)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((c) => c.product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredComparisons(filtered)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadPriceComparisons()
    setRefreshing(false)
  }

  const getPriceChangeData = () => {
    // Simulate price changes
    const change = Math.floor(Math.random() * 10) - 5 // -5 to +5
    const isPositive = change > 0
    return { change, isPositive }
  }

  const renderComparisonCard = (comparison: ProductComparison) => {
    const { product, vendorPrice } = comparison
    const premium = vendorPrice ? product.price - vendorPrice : 0
    const { change, isPositive } = getPriceChangeData()
    const changePercent = vendorPrice ? ((change / vendorPrice) * 100).toFixed(1) : "0.0"

    return (
      <View key={product.id} style={styles.comparisonCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.productType}>
            <Text style={styles.productTypeText}>{product.type}</Text>
          </View>
        </View>

        <View style={styles.priceComparison}>
          {/* Vendor Price */}
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>Vendor Rate</Text>
            <Text style={styles.vendorPrice}>{vendorPrice ? `₹${vendorPrice}/kg` : "N/A"}</Text>
            {vendorPrice && (
              <View style={styles.priceChangeContainer}>
                {isPositive ? <TrendingUp size={14} color="#22C55E" /> : <TrendingDown size={14} color="#EF4444" />}
                <Text style={[styles.priceChangeText, { color: isPositive ? "#22C55E" : "#EF4444" }]}>
                  {isPositive ? "+" : ""}
                  {change} ({isPositive ? "+" : ""}
                  {changePercent}%)
                </Text>
              </View>
            )}
            <Text style={styles.vendorLocation}>
              Near {userLocation.charAt(0).toUpperCase() + userLocation.slice(1)}
            </Text>
          </View>

          {/* VS Divider */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Our Price */}
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>Our Rate</Text>
            <Text style={styles.ourPrice}>₹{product.price}/kg</Text>
            {vendorPrice && (
              <View style={styles.premiumContainer}>
                <Text style={[styles.premiumText, { color: premium >= 0 ? "#F59E0B" : "#22C55E" }]}>
                  {premium >= 0 ? `+₹${premium}` : `₹${Math.abs(premium)} less`}
                </Text>
                <Text style={styles.premiumLabel}>{premium >= 0 ? "premium" : "savings"}</Text>
              </View>
            )}
            <Text style={styles.ourLocation}>MandiKharidari</Text>
          </View>
        </View>

        {/* Stock Info */}
        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>{product.stock > 0 ? `${product.stock} kg available` : "Out of stock"}</Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} stroke="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Price Comparison</Text>
          <Text style={styles.headerSubtitle}>
            MandiKharidari vs Local Vendors ({userLocation.charAt(0).toUpperCase() + userLocation.slice(1)})
          </Text>
        </View>
        <HamburgerMenu currentScreen="/(customer)/price-comparison" />
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Search size={20} stroke="#94A3B8" strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vegetables & fruits..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94A3B8"
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22C55E" />
            <Text style={styles.loadingText}>Loading price comparison...</Text>
          </View>
        ) : filteredComparisons.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? "Try a different search term" : "No vendor prices available for your location"}
            </Text>
          </View>
        ) : (
          <View style={styles.comparisonList}>{filteredComparisons.map(renderComparisonCard)}</View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#22C55E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
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
  content: {
    flex: 1,
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  comparisonList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  comparisonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  productType: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productTypeText: {
    fontSize: 12,
    color: "#64748B",
    textTransform: "capitalize",
  },
  priceComparison: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  priceColumn: {
    flex: 1,
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  vendorPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 4,
  },
  ourPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#22C55E",
    marginBottom: 4,
  },
  priceChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  priceChangeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  premiumContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: "600",
  },
  premiumLabel: {
    fontSize: 12,
    color: "#A16207",
  },
  vendorLocation: {
    fontSize: 10,
    color: "#94A3B8",
  },
  ourLocation: {
    fontSize: 10,
    color: "#94A3B8",
  },
  vsContainer: {
    width: 40,
    alignItems: "center",
  },
  vsText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748B",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockInfo: {
    alignItems: "center",
  },
  stockText: {
    fontSize: 12,
    color: "#64748B",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
})
