"use client"

import { useState, useEffect, useRef } from "react"
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
import HamburgerMenu from "@/components/HamburgerMenu"

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
  const [headerVisible, setHeaderVisible] = useState(true)
  const scrollY = useRef(0)
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

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y
    const scrollDirection = currentScrollY > scrollY.current ? "down" : "up"

    if (scrollDirection === "down" && currentScrollY > 100) {
      setHeaderVisible(false)
    } else if (scrollDirection === "up" || currentScrollY < 50) {
      setHeaderVisible(true)
    }

    scrollY.current = currentScrollY
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
      // Add the item without quantity first, then update quantity
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: "kg",
        image_url: product.image_url,
        image: ""
      })
      // Update quantity if different from 1
      if (quantity !== 1) {
        updateQuantity(product.id, quantity)
      }
      setQuantities((prev) => ({ ...prev, [product.id]: 0 }))
    }
  }

  const renderProductGrid = () => {
    return filteredProducts.map((product) => (
      <View key={product.id} style={styles.productCard}>
        <Image
          source={{
            uri: product.image_url || `/placeholder.svg?height=120&width=120&text=${product.name}`,
          }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <View style={styles.nameAndPriceRow}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>
          </View>
          <Text style={styles.productPrice}>₹{product.price}/kg</Text>
          <Text style={styles.mandiPrice}>Mandi: ₹{Math.round(product.price * 0.8)}/kg</Text>

          <View style={styles.rowActions}>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(product.id, -0.5)}
                activeOpacity={0.7}
              >
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
                placeholder="0"
              />
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(product.id, 0.5)}
                activeOpacity={0.7}
              >
                <Plus size={16} stroke="#22C55E" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: categoryColors[slug || "all"],
                  opacity: !quantities[product.id] || quantities[product.id] <= 0 ? 0.5 : 1,
                },
              ]}
              onPress={() => handleAddToCart(product)}
              disabled={!quantities[product.id] || quantities[product.id] <= 0}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ))
  }

  return (
    <SafeAreaView style={styles.container}>
      {headerVisible && (
        <>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} stroke="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{categoryTitles[slug || "all"] || "Products"}</Text>
            <HamburgerMenu currentScreen={`/(customer)/category/${slug}`} />
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
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryButtonText, slug === "fruits" && styles.activeCategoryText]}>Fruits</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryButton, slug === "vegetables" && styles.activeCategory]}
              onPress={() => router.push("/category/vegetables")}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryButtonText, slug === "vegetables" && styles.activeCategoryText]}>
                Vegetables
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
    paddingVertical: 14,
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
    fontSize: 18,
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
    marginVertical: 12,
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
  },
  productsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  resultCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 16,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "flex-start",
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    resizeMode: "cover",
    marginRight: 12,
    backgroundColor: "#F1F1F1",
  },
  productInfo: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  nameAndPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    flex: 1,
    marginRight: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#22C55E",
    marginVertical: 2,
  },
  mandiPrice: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  stockText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityInput: {
    width: 40,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: "700",
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
