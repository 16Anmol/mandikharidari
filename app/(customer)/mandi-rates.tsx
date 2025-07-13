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
} from "react-native"
import { useRouter } from "expo-router"
import { ArrowLeft, Search, TrendingUp, TrendingDown } from "lucide-react-native"
import { getProducts } from "@/services/supabase"
import type { Product } from "@/services/supabase"

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
  Punjab: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
  Haryana: ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
}

const MANDIS_BY_CITY: Record<string, string[]> = {
  Amritsar: ["Amritsar Mandi", "Beas Mandi", "Tarn Taran Mandi"],
  Ludhiana: ["Ludhiana Mandi", "Khanna Mandi", "Samrala Mandi"],
  Jalandhar: ["Jalandhar Mandi", "Phagwara Mandi", "Nakodar Mandi"],
}

type ViewType = "states" | "cities" | "mandis" | "products"

export default function MandiRatesScreen() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<ViewType>("states")
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [selectedMandi, setSelectedMandi] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "vegetable" | "fruit">("all")

  useEffect(() => {
    if (currentView === "products") {
      loadProducts()
    }
  }, [currentView])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedFilter])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error("Failed to load products:", error)
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
    if (currentView === "products") {
      await loadProducts()
    }
    setRefreshing(false)
  }

  const handleBack = () => {
    if (currentView === "products") {
      setCurrentView("mandis")
    } else if (currentView === "mandis") {
      setCurrentView("cities")
    } else if (currentView === "cities") {
      setCurrentView("states")
    } else {
      // Only go back to home from states view
      router.back()
    }
  }

  const getHeaderTitle = () => {
    switch (currentView) {
      case "states":
        return "Select State"
      case "cities":
        return `Cities in ${selectedState}`
      case "mandis":
        return `Mandis in ${selectedCity}`
      case "products":
        return `${selectedMandi} - Live Rates`
      default:
        return "Mandi Rates"
    }
  }

  const getStatsData = () => {
    const totalProducts = filteredProducts.length
    const priceUpCount = filteredProducts.filter((p) => Math.random() > 0.6).length
    const priceDownCount = filteredProducts.filter((p) => Math.random() > 0.7).length

    return { totalProducts, priceUpCount, priceDownCount }
  }

  const renderStates = () => (
    <ScrollView style={styles.listContainer}>
      {INDIAN_STATES.map((state) => (
        <TouchableOpacity
          key={state}
          style={styles.listItem}
          onPress={() => {
            setSelectedState(state)
            setCurrentView("cities")
          }}
        >
          <Text style={styles.listItemText}>{state}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )

  const renderCities = () => {
    const cities = CITIES_BY_STATE[selectedState] || []
    return (
      <ScrollView style={styles.listContainer}>
        {cities.map((city) => (
          <TouchableOpacity
            key={city}
            style={styles.listItem}
            onPress={() => {
              setSelectedCity(city)
              setCurrentView("mandis")
            }}
          >
            <Text style={styles.listItemText}>{city}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )
  }

  const renderMandis = () => {
    const mandis = MANDIS_BY_CITY[selectedCity] || [`${selectedCity} Main Mandi`, `${selectedCity} Vegetable Market`]
    return (
      <ScrollView style={styles.listContainer}>
        {mandis.map((mandi) => (
          <TouchableOpacity
            key={mandi}
            style={styles.listItem}
            onPress={() => {
              setSelectedMandi(mandi)
              setCurrentView("products")
            }}
          >
            <Text style={styles.listItemText}>{mandi}</Text>
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
        </View>

        {filteredProducts.map((product) => {
          const priceChange = Math.floor(Math.random() * 10) - 5
          const isPositive = priceChange > 0

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
                    {isPositive ? "+" : ""}
                    {priceChange}
                  </Text>
                </View>
              </View>
            </View>
          )
        })}
      </ScrollView>
    )
  }

  const renderCurrentView = () => {
    switch (currentView) {
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
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  listItem: {
    backgroundColor: "#FFFFFF",
    padding: 16,
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
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginVertical: 16,
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
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
  },
  productType: {
    fontSize: 12,
    color: "#64748B",
    textTransform: "capitalize",
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
})
