"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  RefreshControl,
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { ArrowLeft, Plus, Minus, Search } from "lucide-react-native"
import { getProducts, subscribeToProducts } from "@/services/supabase"
import type { Product } from "@/services/supabase"
import { useCart } from "@/contexts/CartContext"

const categoryTitles: Record<string, string> = {
  seasonal: "Seasonal Picks",
  fruits: "Fresh Fruits",
  vegetables: "Fresh Vegetables",
  all: "All Products",
}

const categoryColors: Record<string, string> = {
  seasonal: "#F59E0B",
  fruits: "#EF4444",
  vegetables: "#22C55E",
  all: "#8B5CF6",
}

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const { addItem } = useCart()

  useEffect(() => {
    loadProducts()
    const subscription = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, slug, searchQuery])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error("Failed to load products:", error)
    }
  }

  const filterProducts = () => {
    let filtered = products.filter((product) => product.stock > 0)

    // Filter by category
    if (slug === "fruits") {
      filtered = filtered.filter((p) => p.type === "fruit")
    } else if (slug === "vegetables") {
      filtered = filtered.filter((p) => p.type === "vegetable")
    } else if (slug === "seasonal") {
      filtered = filtered.slice(0, 8)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredProducts(filtered)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
  }

  const updateQuantity = (productId: string, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change),
    }))
  }

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 0.5
    if (quantity > 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        unit: "kg",
        image: product.image_url,
      })
      setQuantities((prev) => ({ ...prev, [product.id]: 0 }))
    }
  }

  const renderProductGrid = () => {
    const rows = []
    for (let i = 0; i < filteredProducts.length; i += 2) {
      const rowProducts = filteredProducts.slice(i, i + 2)
      rows.push(
        <View key={i} style={styles.productRow}>
          {rowProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image
                source={{
                  uri: product.image_url || `/placeholder.svg?height=120&width=120&text=${product.name}`,
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>₹{product.price}/kg</Text>
                <Text style={styles.stockText}>Stock: {product.stock}kg</Text>

                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>Quantity (kg):</Text>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => updateQuantity(product.id, -0.5)}>
                      <Minus size={16} stroke="#22C55E" strokeWidth={2} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.quantityInput}
                      value={quantities[product.id] ? quantities[product.id].toString() : ""}
                      onChangeText={(text) => {
                        const value = Number.parseFloat(text) || 0
                        setQuantities((prev) => ({ ...prev, [product.id]: value }))
                      }}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.quantityButton} onPress={() => updateQuantity(product.id, 0.5)}>
                      <Plus size={16} stroke="#22C55E" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: categoryColors[slug || "all"] }]}
                  onPress={() => handleAddToCart(product)}
                  disabled={!quantities[product.id] || quantities[product.id] <= 0}
                >
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {/* Fill empty spaces in the row */}
          {rowProducts.length < 2 &&
            Array.from({ length: 2 - rowProducts.length }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.emptyCard} />
            ))}
        </View>,
      )
    }
    return rows
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} stroke="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryTitles[slug || "all"] || "Products"}</Text>
        <View style={styles.headerSpacer} />
      </View>

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
       <View style={styles.categoryButtonsContainer}>
  <TouchableOpacity
    style={[styles.categoryButton, slug === "fruits" && styles.activeCategory]}
    onPress={() => router.push("/category/fruits")}
  >
    <Text style={[styles.categoryButtonText, slug === "fruits" && styles.activeCategoryText]}>
      Fruits
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.categoryButton, slug === "vegetables" && styles.activeCategory]}
    onPress={() => router.push("/category/vegetables")}
  >
    <Text style={[styles.categoryButtonText, slug === "vegetables" && styles.activeCategoryText]}>
      Vegetables
    </Text>
  </TouchableOpacity>
</View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? "Try a different search term" : "Products will appear here soon"}
            </Text>
          </View>
        ) : (
          <View style={styles.productsContainer}>
            <Text style={styles.resultCount}>{filteredProducts.length} products found</Text>
            {renderProductGrid()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  categoryButtonsContainer: {
  flexDirection: "row",
  justifyContent: "center",
  marginHorizontal: 20,
  marginBottom: 12,
  gap: 12,
},

categoryButton: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  backgroundColor: "#E2E8F0",
  borderRadius: 20,
},

activeCategory: {
  backgroundColor: "#22C55E",
},

categoryButtonText: {
  color: "#334155",
  fontSize: 14,
  fontWeight: "600",
},

activeCategoryText: {
  color: "#FFFFFF",
},

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
  content: {
    flex: 1,
  },
  productsContainer: {
    padding: 20,
  },
  resultCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 16,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  productImage: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    resizeMode: "cover",
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
    minHeight: 32,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#22C55E",
    marginBottom: 4,
  },
  stockText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
  },
  quantityContainer: {
    marginBottom: 8,
  },
  quantityLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityInput: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    minHeight: 24,
  },
  addButton: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
})
