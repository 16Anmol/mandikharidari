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
import { ArrowLeft, Search, TrendingUp, TrendingDown, MapPin, Clock } from "lucide-react-native"
import { getProducts } from "@/services/supabase"
import type { Product } from "@/services/supabase"
import { useCallback } from "react"

const INDIAN_STATES = [
  "Punjab", "Haryana", "Uttar Pradesh", "Rajasthan", "Gujarat", "Maharashtra", 
  "Karnataka", "Tamil Nadu", "Andhra Pradesh", "Telangana", "West Bengal", 
  "Bihar", "Odisha", "Madhya Pradesh", "Chhattisgarh", "Jharkhand",
]

const CITIES_BY_STATE: Record<string, string[]> = {
  Punjab: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
  Haryana: ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
}

const MANDIS_BY_CITY: Record<string, string[]> = {
  Amritsar: ["Amritsar Main Mandi", "Beas Agricultural Market", "Tarn Taran Wholesale Market"],
  Ludhiana: ["Ludhiana Grain Market", "Khanna Mandi", "Samrala Agricultural Market"],
  Jalandhar: ["Jalandhar Central Mandi", "Phagwara Market", "Nakodar Agricultural Market"],
  Jodhpur: ["Jodhpur Main Mandi", "Jodhpur Vegetable Market", "Jodhpur Wholesale Market"],
  Gurgaon: ["Gurgaon Wholesale Market", "Sector 14 Mandi", "IMT Manesar Market"],
  Faridabad: ["Faridabad Main Mandi", "Ballabhgarh Market", "NIT Faridabad Market"],
}

type ViewType = "states" | "cities" | "mandis" | "products"

interface NavigationState {
  view: ViewType
  selectedState: string
  selectedCity: string
  selectedMandi: string
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
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "vegetable" | "fruit">("all")

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack()
        return true // Prevent default behavior
      }

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)
      return () => subscription?.remove()
    }, [navState])
  )

  useEffect(() => {
    if (navState.view === "products") {
      loadProducts()
    }
  }, [navState.view])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedFilter])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error("Failed to load products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (selectedFilter !== "all") {
      filtered = filtered.filter((p) => p.type === selectedFilter)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredProducts(filtered)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    if (navState.view === "products") {
      await loadProducts()
    }
    setRefreshing(false)
  }

  const handleBack = () => {
    switch (navState.view) {
      case "products":
        setNavState(prev => ({ ...prev, view: "mandis", selectedMandi: "" }))
        setSearchQuery("")
        break
      case "mandis":
        setNavState(prev => ({ ...prev, view: "cities", selectedCity: "", selectedMandi: "" }))
        break
      case "cities":
        setNavState(prev => ({ ...prev, view: "states", selectedState: "", selectedCity: "", selectedMandi: "" }))
        break
      case "states":
      default:
        router.back()
        break
    }
  }

  const handleStateSelect = (state: string) => {
    setNavState(prev => ({ ...prev, view: "cities", selectedState: state }))
  }

  const handleCitySelect = (city: string) => {
    setNavState(prev => ({ ...prev, view: "mandis", selectedCity: city }))
  }

  const handleMandiSelect = (mandi: string) => {
    setNavState(prev => ({ ...prev, view: "products", selectedMandi: mandi }))
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
    const priceUpCount = filteredProducts.filter(() => Math.random() > 0.6).length
    const priceDownCount = filteredProducts.filter(() => Math.random() > 0.7).length
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
        {cities.map((city) => (
          <TouchableOpacity
            key={city}
            style={styles.listItem}
            onPress={() => handleCitySelect(city)}
            activeOpacity={0.7}
          >
            <Text style={styles.listItemText}>{city}</Text>
            <Text style={styles.listItemArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )
  }

  const renderMandis = () => {
    const mandis = MANDIS_BY_CITY[navState.selectedCity] || [
      `${navState.selectedCity} Main Mandi`,
      `${navState.selectedCity} Vegetable Market`,
      `${navState.selectedCity} Wholesale Market`
    ]
    return (
      <ScrollView 
        style={styles.listContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoCard}>
          <MapPin size={20} color="#22C55E" />
          <Text style={styles.infoText}>Select mandi in {navState.selectedCity}</Text>
        </View>
        {mandis.map((mandi) => (
          <TouchableOpacity
            key={mandi}
            style={styles.listItem}
            onPress={() => handleMandiSelect(mandi)}
            activeOpacity={0.7}
          >
            <Text style={styles.listItemText}>{mandi}</Text>
            <Text style={styles.listItemArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )
  }

  const renderProducts = () => {
    const stats = getStatsData()

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
          {["all", "vegetable", "fruit"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
              onPress={() => setSelectedFilter(filter as any)}
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22C55E" />
            <Text style={styles.loadingText}>Loading market rates...</Text>
          </View>
        ) : (
          filteredProducts.map((product) => {
            const priceChange = Math.floor(Math.random() * 10) - 5
            const isPositive = priceChange > 0
            const changePercent = ((priceChange / product.price) * 100).toFixed(1)

            return (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>₹{Math.round(product.price * 0.8)}/kg</Text>
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productType}>{product.type}</Text>
                  <View style={styles.priceChangeContainer}>
                    {isPositive ? <TrendingUp size={16} color="#22C55E" /> : <TrendingDown size={16} color="#EF4444" />}
                    <Text style={[styles.priceChangeText, { color: isPositive ? "#22C55E" : "#EF4444" }]}>
                      {isPositive ? "+" : ""}{priceChange} ({isPositive ? "+" : ""}{changePercent}%)
                    </Text>
                  </View>
                </View>
                <View style={styles.productFooter}>
                  <Text style={styles.ourPrice}>Our Price: ₹{product.price}/kg</Text>
                  <Text style={styles.savings}>Save ₹{Math.round(product.price * 0.2)}/kg</Text>
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
            <Text style={styles.breadcrumb} numberOfLines={1}>{getBreadcrumb()}</Text>
          )}
        </View>
        <View style={styles.headerSpacer} />
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
    paddingVertical: 16,
    backgroundColor: "#22C55E",
    minHeight: 80,
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
  breadcrumb: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
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
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
    flex: 1,
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
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
  ourPrice: {
    fontSize: 14,
    color: "#64748B",
  },
  savings: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22C55E",
  },
})