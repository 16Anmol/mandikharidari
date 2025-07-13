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
  Alert,
  Modal,
  Image,
  RefreshControl,
} from "react-native"
import { Plus, Edit3, Trash2, Package, Search } from "lucide-react-native"
import { getProducts, addProduct, updateProduct, deleteProduct, subscribeToProducts } from "@/services/supabase"
import type { Product } from "@/services/supabase"

interface ProductForm {
  name: string
  type: "fruit" | "vegetable"
  price: string
  stock: string
  image_url: string
}

export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    type: "vegetable",
    price: "",
    stock: "",
    image_url: "",
  })

  useEffect(() => {
    loadProducts()
    const subscription = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery])

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
    if (searchQuery.trim()) {
      filtered = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    setFilteredProducts(filtered)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      type: "vegetable",
      price: "",
      stock: "",
      image_url: "",
    })
    setModalVisible(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      type: product.type,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || "",
    })
    setModalVisible(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price || !formData.stock) {
      Alert.alert("Error", "Please fill all required fields")
      return
    }

    const price = Number.parseFloat(formData.price)
    const stock = Number.parseFloat(formData.stock)

    if (isNaN(price) || isNaN(stock) || price <= 0 || stock < 0) {
      Alert.alert("Error", "Please enter valid price and stock values")
      return
    }

    try {
      const productData = {
        name: formData.name.trim(),
        type: formData.type,
        price,
        stock,
        image_url: formData.image_url.trim() || `/placeholder.svg?height=200&width=200&text=${formData.name}`,
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
        Alert.alert("Success", "Product updated successfully")
      } else {
        await addProduct(productData)
        Alert.alert("Success", "Product added successfully")
      }

      setModalVisible(false)
      loadProducts()
    } catch (error) {
      Alert.alert("Error", "Failed to save product")
    }
  }

  const handleDelete = (product: Product) => {
    Alert.alert("Delete Product", `Are you sure you want to delete "${product.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(product.id)
            Alert.alert("Success", "Product deleted successfully")
            loadProducts()
          } catch (error) {
            Alert.alert("Error", "Failed to delete product")
          }
        },
      },
    ])
  }

  const toggleStock = async (product: Product) => {
    try {
      const newStock = product.stock > 0 ? 0 : 10
      await updateProduct(product.id, { stock: newStock })
      Alert.alert("Success", `Product marked as ${newStock > 0 ? "in stock" : "out of stock"}`)
    } catch (error) {
      Alert.alert("Error", "Failed to update stock")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Inventory Management</Text>
            <Text style={styles.subtitle}>Manage products and stock</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Plus size={24} stroke="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
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

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#22C55E" }]}>{products.filter((p) => p.stock > 0).length}</Text>
            <Text style={styles.statLabel}>In Stock</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#EF4444" }]}>
              {products.filter((p) => p.stock === 0).length}
            </Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={64} stroke="#9CA3AF" strokeWidth={1} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? "Try a different search term" : "Add your first product"}
            </Text>
          </View>
        ) : (
          <View style={styles.productsContainer}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <Image
                  source={{
                    uri: product.image_url || `/placeholder.svg?height=80&width=80&text=${product.name}`,
                  }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productType}>{product.type === "fruit" ? "🍎 Fruit" : "🥬 Vegetable"}</Text>
                  <Text style={styles.productPrice}>₹{product.price}/kg</Text>
                  <Text style={[styles.stockText, { color: product.stock > 0 ? "#22C55E" : "#EF4444" }]}>
                    {product.stock > 0 ? `${product.stock}kg in stock` : "Out of stock"}
                  </Text>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={[
                      styles.stockButton,
                      {
                        backgroundColor: product.stock > 0 ? "#FEF2F2" : "#F0FDF4",
                      },
                    ]}
                    onPress={() => toggleStock(product)}
                  >
                    <Text style={[styles.stockButtonText, { color: product.stock > 0 ? "#EF4444" : "#22C55E" }]}>
                      {product.stock > 0 ? "Mark Out" : "Mark In"}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(product)}>
                      <Edit3 size={16} stroke="#3B82F6" strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(product)}>
                      <Trash2 size={16} stroke="#EF4444" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingProduct ? "Edit Product" : "Add New Product"}</Text>

            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, formData.type === "vegetable" && styles.typeButtonActive]}
                onPress={() => setFormData({ ...formData, type: "vegetable" })}
              >
                <Text style={[styles.typeButtonText, formData.type === "vegetable" && styles.typeButtonTextActive]}>
                  🥬 Vegetable
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, formData.type === "fruit" && styles.typeButtonActive]}
                onPress={() => setFormData({ ...formData, type: "fruit" })}
              >
                <Text style={[styles.typeButtonText, formData.type === "fruit" && styles.typeButtonTextActive]}>
                  🍎 Fruit
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Price per kg (₹)"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Stock (kg)"
              value={formData.stock}
              onChangeText={(text) => setFormData({ ...formData, stock: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Image URL (optional)"
              value={formData.image_url}
              onChangeText={(text) => setFormData({ ...formData, image_url: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{editingProduct ? "Update" : "Add"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E2E8F0",
  },
  content: {
    flex: 1,
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
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },
  productsContainer: {
    padding: 20,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
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
  productType: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 4,
  },
  stockText: {
    fontSize: 14,
    fontWeight: "500",
  },
  productActions: {
    alignItems: "flex-end",
  },
  stockButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  stockButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EBF4FF",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1E293B",
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  typeButtonTextActive: {
    color: "#FFFFFF",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
