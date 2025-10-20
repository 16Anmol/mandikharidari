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
  BackHandler,
} from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { ArrowLeft, Search, TrendingUp, TrendingDown, MapPin, Clock, AlertCircle } from "lucide-react-native"
import { supabase } from "@/services/supabase"
import { useCallback } from "react"
import HamburgerMenu from "@/components/HamburgerMenu"

const INDIAN_STATES = [
  "Punjab",
  "Haryana",
  "Uttar Pradesh",
  "Rajasthan",
  "Gujarat",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Telangana",
  "West Bengal",
  "Bihar",
  "Odisha",
  "Madhya Pradesh",
  "Chhattisgarh",
  "Jharkhand",
]

const CITIES_BY_STATE: Record<string, string[]> = {
  Punjab: ["Amritsar", "Ludhiana", "Patiala", "Jalandhar", "Bathinda"],
  Haryana: ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
}

// Map cities to their mandi IDs and names
const CITY_TO_MANDI: Record<string, { id: string; name: string }> = {
  Amritsar: { id: "amritsar123", name: "Amritsar Main Mandi" },
  Ludhiana: { id: "ludhiana123", name: "Ludhiana Grain Market" },
  Patiala: { id: "patiala123", name: "Patiala Agricultural Market" },
}

// Cities with actual data
const CITIES_WITH_DATA = ["Amritsar", "Ludhiana", "Patiala"]

type ViewType = "states" | "cities" | "mandis" | "products"

interface NavigationState {
  view: ViewType
  selectedState: string
  selectedCity: string
  selectedMandi: string
}

interface MandiProduct {
  id: string
  mandi_id: string
  name: string
  category: "fruits" | "vegetables" | "others"
  price: number
  stock_status: "in_stock" | "out_of_stock"
  image_url?: string
  created_at?: string
  updated_at?: string
  mandi_name?: string
  price_change?: number
  change_percent?: string
}

export default function MandiRatesScreen() {
  const router = useRouter()
  const [navState, setNavState] = useState<NavigationState>({
    view: "states",
    selectedState: "",
    selectedCity: "",
    selectedMandi: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<MandiProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<MandiProduct[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "vegetables" | "fruits" | "others">("all")
  const [hasDataForCity, setHasDataForCity] = useState(true)

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack()
        return true // Prevent default behavior
      }

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress)
      return () => subscription?.remove()
    }, [navState]),
  )

  useEffect(() => {
    if (navState.view === "products") {
      loadMandiProducts()
    }
  }, [navState.view, navState.selectedMandi])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedFilter])

  const loadMandiProducts = async () => {
    try {
      setLoading(true)

      // Check if city has data
      const cityHasData = CITIES_WITH_DATA.includes(navState.selectedCity)
      setHasDataForCity(cityHasData)

      if (!cityHasData) {
        setProducts([])
        setLoading(false)
        return
      }

      // Get the mandi info for the selected city
      const mandiInfo = CITY_TO_MANDI[navState.selectedCity]
      if (!mandiInfo) {
        setProducts([])
        setLoading(false)
        return
      }

      console.log("Loading products for mandi:", mandiInfo.id)

      // Get products for the selected mandi
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("mandi_id", mandiInfo.id)
        .eq("stock_status", "in_stock")

      if (productsError) {
        console.error("Error fetching products:", productsError)
        setProducts([])
        setLoading(false)
        return
      }

      console.log("Fetched products:", productsData?.length || 0)

      // Get recent price changes from rate_history
      const productIds = (productsData || []).map((p) => p.id)
      let rateHistory: any[] = []

      if (productIds.length > 0) {
        const { data: rateData, error: rateError } = await supabase
          .from("rate_history")
          .select("product_id, old_price, new_price, updated_at")
          .in("product_id", productIds)
          .order("updated_at", { ascending: false })

        if (rateError) {
          console.error("Error fetching rate history:", rateError)
        } else {
          rateHistory = rateData || []
          console.log("Fetched rate history:", rateHistory.length)
        }
      }

      // Combine products with price change data
      const enrichedProducts: MandiProduct[] = (productsData || []).map((product) => {
        // Get the most recent price change for this product
        const recentChange = rateHistory.find((r) => r.product_id === product.id)
        let priceChange = 0
        let changePercent = "0.0"

        if (recentChange) {
          priceChange = Number(recentChange.new_price) - Number(recentChange.old_price)
          changePercent = ((priceChange / Number(recentChange.old_price)) * 100).toFixed(1)
        }

        return {
          ...product,
          price: Number(product.price),
          mandi_name: mandiInfo.name,
          price_change: priceChange,
          change_percent: changePercent,
        }
      })

      setProducts(enrichedProducts)
    } catch (error) {
      console.error("Failed to load mandi products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (selectedFilter !== "all") {
      filtered = filtered.filter((p) => p.category === selectedFilter)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredProducts(filtered)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    if (navState.view === "products") {
      await loadMandiProducts()
    }
    setRefreshing(false)
  }

  const handleBack = () => {
    switch (navState.view) {
      case "products":
        setNavState((prev) => ({ ...prev, view: "mandis", selectedMandi: "" }))
        setSearchQuery("")
        break
      case "mandis":
        setNavState((prev) => ({ ...prev, view: "cities", selectedCity: "", selectedMandi: "" }))
        break
      case "cities":
        setNavState((prev) => ({ ...prev, view: "states", selectedState: "", selectedCity: "", selectedMandi: "" }))
        break
      case "states":
      default:
        router.back()
        break
    }
  }

  const handleStateSelect = (state: string) => {
    setNavState((prev) => ({ ...prev, view: "cities", selectedState: state }))
  }

  const handleCitySelect = (city: string) => {
    setNavState((prev) => ({ ...prev, view: "mandis", selectedCity: city }))
  }

  const handleMandiSelect = (mandi: string) => {
    setNavState((prev) => ({ ...prev, view: "products", selectedMandi: mandi }))
  }

  const getHeaderTitle = () => {
    switch (navState.view) {
      case "states":
        return "Select State"
      case "cities":
        return `Cities in ${navState.selectedState}`
      case "mandis":
        return `Mandis in ${navState.selectedCity}`
      case "products":
        return navState.selectedMandi
      default:
        return "Mandi Rates"
    }
  }

  const getBreadcrumb = () => {
    const parts = []
    if (navState.selectedState) parts.push(navState.selectedState)
    if (navState.selectedCity) parts.push(navState.selectedCity)
    if (navState.selectedMandi) parts.push(navState.selectedMandi)
    return parts.join(" › ")
  }

  const getStatsData = () => {
    const totalProducts = filteredProducts.length
    const priceUpCount = filteredProducts.filter((p) => (p.price_change || 0) > 0).length
    const priceDownCount = filteredProducts.filter((p) => (p.price_change || 0) < 0).length
    return { totalProducts, priceUpCount, priceDownCount }
  }

  const renderStates = () => (
    <ScrollView
      style={styles.listContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.infoCard}>
        <MapPin size={20} color="#22C55E" />
        <Text style={styles.infoText}>Select your state to view live mandi rates</Text>
      </View>
      {INDIAN_STATES.map((state) => (
        <TouchableOpacity
          key={state}
          style={styles.listItem}
          onPress={() => handleStateSelect(state)}
          activeOpacity={0.7}
        >
          <Text style={styles.listItemText}>{state}</Text>
          <Text style={styles.listItemArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )

  const renderCities = () => {
    const cities = CITIES_BY_STATE[navState.selectedState] || []
    return (
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoCard}>
          <MapPin size={20} color="#22C55E" />
          <Text style={styles.infoText}>Select city in {navState.selectedState}</Text>
        </View>
        {cities.map((city) => {
          const hasData = CITIES_WITH_DATA.includes(city)
          return (
            <TouchableOpacity
              key={city}
              style={[styles.listItem, !hasData && styles.listItemDisabled]}
              onPress={() => hasData && handleCitySelect(city)}
              activeOpacity={hasData ? 0.7 : 1}
            >
              <View style={styles.listItemContent}>
                <Text style={[styles.listItemText, !hasData && styles.listItemTextDisabled]}>{city}</Text>
                {!hasData && <Text style={styles.comingSoonText}>Data Coming Soon</Text>}
              </View>
              {hasData && <Text style={styles.listItemArrow}>›</Text>}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    )
  }

  const renderMandis = () => {
    if (!hasDataForCity) {
      return (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.noDataContainer}>
            <AlertCircle size={64} color="#94A3B8" />
            <Text style={styles.noDataTitle}>Data Coming Soon</Text>
            <Text style={styles.noDataText}>
              Mandi rates for {navState.selectedCity} will be available soon. We're working to expand our coverage to
              more cities.
            </Text>
            <Text style={styles.availableCitiesText}>Currently available: Amritsar, Ludhiana, Patiala</Text>
          </View>
        </ScrollView>
      )
    }

    // Get mandi info for the selected city
    const mandiInfo = CITY_TO_MANDI[navState.selectedCity]
    if (!mandiInfo) {
      return (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.noDataContainer}>
            <AlertCircle size={48} color="#94A3B8" />
            <Text style={styles.noDataTitle}>No Mandis Found</Text>
            <Text style={styles.noDataText}>No mandis configured for {navState.selectedCity}</Text>
          </View>
        </ScrollView>
      )
    }

    return (
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.infoCard}>
          <MapPin size={20} color="#22C55E" />
          <Text style={styles.infoText}>Select mandi in {navState.selectedCity}</Text>
        </View>
        <TouchableOpacity style={styles.listItem} onPress={() => handleMandiSelect(mandiInfo.name)} activeOpacity={0.7}>
          <Text style={styles.listItemText}>{mandiInfo.name}</Text>
          <Text style={styles.listItemArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  const renderProducts = () => {
    const stats = getStatsData()

    if (!hasDataForCity) {
      return (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.noDataContainer}>
            <AlertCircle size={64} color="#94A3B8" />
            <Text style={styles.noDataTitle}>Data Coming Soon</Text>
            <Text style={styles.noDataText}>
              Mandi rates for {navState.selectedCity} will be available soon. We're working to expand our coverage to
              more cities.
            </Text>
            <Text style={styles.availableCitiesText}>Currently available: Amritsar, Ludhiana, Patiala</Text>
          </View>
        </ScrollView>
      )
    }

    return (
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchContainer}>
          <Search size={20} stroke="#94A3B8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.filterContainer}>
          {["all", "vegetables", "fruits", "others"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
              onPress={() => setSelectedFilter(filter as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterButtonText, selectedFilter === filter && styles.filterButtonTextActive]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#22C55E" }]}>{stats.priceUpCount}</Text>
            <Text style={styles.statLabel}>Price Up</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#EF4444" }]}>{stats.priceDownCount}</Text>
            <Text style={styles.statLabel}>Price Down</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Market Rates</Text>
          <View style={styles.lastUpdated}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.lastUpdatedText}>Updated 2 mins ago</Text>
          </View>
        </View>

        <View style={styles.comparisonBanner}>
          <Text style={styles.comparisonTitle}>📊 Live Mandi Rates - {navState.selectedCity}</Text>
          <Text style={styles.comparisonSubtitle}>Real-time wholesale prices from {navState.selectedMandi}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22C55E" />
            <Text style={styles.loadingText}>Loading market rates...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.noProductsContainer}>
            <Text style={styles.noProductsText}>No products found matching your criteria</Text>
          </View>
        ) : (
          filteredProducts.map((product) => {
            const isPositive = (product.price_change || 0) > 0
            const isNegative = (product.price_change || 0) < 0

            return (
              <View  style={styles.productCard}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>₹{product.price.toFixed(0)}/kg</Text>
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productType}>{product.category}</Text>
                  {(isPositive || isNegative) && (
                    <View style={styles.priceChangeContainer}>
                      {isPositive ? (
                        <TrendingUp size={16} color="#22C55E" />
                      ) : (
                        <TrendingDown size={16} color="#EF4444" />
                      )}
                      <Text style={[styles.priceChangeText, { color: isPositive ? "#22C55E" : "#EF4444" }]}>
                        {isPositive ? "+" : ""}
                        {product.price_change?.toFixed(0)} ({isPositive ? "+" : ""}
                        {product.change_percent}%)
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.productFooter}>
                  <Text style={styles.mandiName}>Mandi: {product.mandi_name}</Text>
                  <Text style={styles.stockStatus}>In Stock</Text>
                </View>
              </View>
            )
          })
        )}
      </ScrollView>
    )
  }

  const renderCurrentView = () => {
    switch (navState.view) {
      case "states":
        return renderStates()
      case "cities":
        return renderCities()
      case "mandis":
        return renderMandis()
      case "products":
        return renderProducts()
      default:
        return renderStates()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} stroke="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          {getBreadcrumb() && (
            <Text style={styles.breadcrumb} numberOfLines={1}>
              {getBreadcrumb()}
            </Text>
          )}
        </View>
        <HamburgerMenu currentScreen="/(customer)/mandi-rates" />
      </View>

      {renderCurrentView()}
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
    minHeight: 70,
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
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  breadcrumb: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
  },
  infoText: {
    fontSize: 14,
    color: "#15803D",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItemDisabled: {
    backgroundColor: "#F8F9FA",
    opacity: 0.7,
  },
  listItemContent: {
    flex: 1,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
  },
  listItemTextDisabled: {
    color: "#94A3B8",
  },
  comingSoonText: {
    fontSize: 12,
    color: "#F59E0B",
    fontStyle: "italic",
    marginTop: 2,
  },
  listItemArrow: {
    fontSize: 20,
    color: "#94A3B8",
    fontWeight: "300",
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
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
  filterContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  filterButtonActive: {
    backgroundColor: "#22C55E",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
  },
  lastUpdated: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: "#64748B",
  },
  comparisonBanner: {
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
  },
  comparisonSubtitle: {
    fontSize: 12,
    color: "#A16207",
    lineHeight: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noDataTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  availableCitiesText: {
    fontSize: 14,
    color: "#22C55E",
    fontWeight: "500",
    textAlign: "center",
  },
  noProductsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noProductsText: {
    fontSize: 16,
    color: "#64748B",
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    padding: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22C55E",
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productType: {
    fontSize: 12,
    color: "#64748B",
    textTransform: "capitalize",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceChangeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  mandiName: {
    fontSize: 14,
    color: "#64748B",
  },
  stockStatus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22C55E",
  },
})
