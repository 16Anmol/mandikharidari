"use client"

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Modal,
  Animated,
} from "react-native"
import { Plus, Minus, Trash2, ShoppingBag, MapPin, CheckCircle, Truck, CreditCard, Sparkles } from "lucide-react-native"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { createOrder } from "@/services/supabase"
import { router } from "expo-router"
import * as Location from "expo-location"
import { useState, useRef } from "react"

export default function CartScreen() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart()
  const { user } = useAuth()
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false)
  const [orderType, setOrderType] = useState<"delivery" | "takeaway">("delivery")
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(300)).current

  const handleQuantityChange = (id: string, change: number) => {
    const item = items.find((i) => i.id === id)
    if (item) {
      const newQuantity = item.quantity + change
      if (newQuantity <= 0) {
        removeItem(id)
      } else {
        updateQuantity(id, newQuantity)
      }
    }
  }

  const getCurrentLocation = async (): Promise<string> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        return user?.address || "Address not provided"
      }

      const location = await Location.getCurrentPositionAsync({})
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      if (address.length > 0) {
        const addr = address[0]
        return (
          `${addr.street || ""} ${addr.city || ""} ${addr.region || ""}`.trim() || user?.address || "Current Location"
        )
      }

      return user?.address || "Current Location"
    } catch (error) {
      console.log("Location error:", error)
      return user?.address || "Address not provided"
    }
  }

  const handlePlaceOrderClick = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to place your order", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/(auth)/login") },
      ])
      return
    }

    if (items.length === 0) {
      Alert.alert("Empty Cart", "Please add some items to your cart first")
      return
    }

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    setShowDeliveryOptions(true)
  }

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true)

    try {
      const location = orderType === "delivery" ? await getCurrentLocation() : "Takeaway from Store"
      const orderId = `MK${Date.now()}`

      const orderData = {
        user_id: user?.id ?? "",
        location: location,
        items: items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
        })),
        total_cost: total,
        status: "pending" as const,
        order_type: orderType,
        payment_method: paymentMethod,
      }

      await createOrder(orderData)

      setOrderDetails({
        orderId,
        orderType,
        paymentMethod,
        total,
        estimatedTime: orderType === "delivery" ? "30-45 minutes" : "15-20 minutes",
      })

      setShowDeliveryOptions(false)
      clearCart()

      // Show success animation
      setTimeout(() => {
        setShowConfirmation(true)
        startSuccessAnimation()
      }, 300)
    } catch (error) {
      console.error("Failed to place order:", error)
      Alert.alert("Order Failed", "Failed to place order. Please try again.")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const startSuccessAnimation = () => {
    // Reset animations
    fadeAnim.setValue(0)
    slideAnim.setValue(300)

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleConfirmationClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowConfirmation(false)
      router.push("/(customer)")
    })
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <ShoppingBag size={80} stroke="#CBD5E1" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some fresh vegetables and fruits to get started</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push("/(customer)")}>
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{items.length} items</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.cartItems}>
          {items.map((item, index) => (
            <Animated.View
              key={item.id}
              style={[
                styles.cartItem,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ]}
            >
              <Image source={{ uri: item.image || "/placeholder.svg?height=80&width=80" }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  ₹{item.price}/{item.unit}
                </Text>
                <View style={styles.itemControls}>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.id, -0.5)}
                      activeOpacity={0.7}
                    >
                      <Minus size={16} stroke="#22C55E" strokeWidth={2} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.id, 0.5)}
                      activeOpacity={0.7}
                    >
                      <Plus size={16} stroke="#22C55E" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)} activeOpacity={0.7}>
                    <Trash2 size={16} stroke="#EF4444" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.itemTotal}>
                <Text style={styles.itemTotalPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Fixed Bottom Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalPrice}>₹{total.toFixed(2)}</Text>
        </View>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.checkoutButton, isPlacingOrder && styles.checkoutButtonDisabled]}
            onPress={handlePlaceOrderClick}
            disabled={isPlacingOrder}
            activeOpacity={0.8}
          >
            <Text style={styles.checkoutText}>{isPlacingOrder ? "Placing Order..." : "Place Order"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Delivery Options Modal */}
      <Modal visible={showDeliveryOptions} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Delivery Option</Text>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Order Type</Text>
              <View style={styles.optionButtons}>
                <TouchableOpacity
                  style={[styles.optionButton, orderType === "delivery" && styles.optionButtonActive]}
                  onPress={() => setOrderType("delivery")}
                  activeOpacity={0.8}
                >
                  <Truck size={20} color={orderType === "delivery" ? "#FFFFFF" : "#64748B"} />
                  <Text style={[styles.optionButtonText, orderType === "delivery" && styles.optionButtonTextActive]}>
                    Home Delivery
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, orderType === "takeaway" && styles.optionButtonActive]}
                  onPress={() => setOrderType("takeaway")}
                  activeOpacity={0.8}
                >
                  <ShoppingBag size={20} color={orderType === "takeaway" ? "#FFFFFF" : "#64748B"} />
                  <Text style={[styles.optionButtonText, orderType === "takeaway" && styles.optionButtonTextActive]}>
                    Takeaway
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Payment Method</Text>
              <View style={styles.optionButtons}>
                <TouchableOpacity
                  style={[styles.optionButton, paymentMethod === "cod" && styles.optionButtonActive]}
                  onPress={() => setPaymentMethod("cod")}
                  activeOpacity={0.8}
                >
                  <CreditCard size={20} color={paymentMethod === "cod" ? "#FFFFFF" : "#64748B"} />
                  <Text style={[styles.optionButtonText, paymentMethod === "cod" && styles.optionButtonTextActive]}>
                    Cash on Delivery
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, paymentMethod === "online" && styles.optionButtonActive]}
                  onPress={() => setPaymentMethod("online")}
                  activeOpacity={0.8}
                >
                  <CreditCard size={20} color={paymentMethod === "online" ? "#FFFFFF" : "#64748B"} />
                  <Text style={[styles.optionButtonText, paymentMethod === "online" && styles.optionButtonTextActive]}>
                    Online Payment
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {orderType === "delivery" && (
              <View style={styles.deliveryInfo}>
                <MapPin size={16} stroke="#22C55E" />
                <Text style={styles.deliveryText}>Delivery to: {user?.address || "Current Location"}</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeliveryOptions(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, isPlacingOrder && styles.confirmButtonDisabled]}
                onPress={handlePlaceOrder}
                disabled={isPlacingOrder}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>{isPlacingOrder ? "Placing..." : "Confirm Order"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Order Success Modal */}
      <Modal visible={showConfirmation} animationType="none" transparent>
        <Animated.View style={[styles.confirmationOverlay, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.confirmationContent, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.successIconContainer}>
              <CheckCircle size={80} color="#22C55E" />
              <Sparkles size={24} color="#FFD700" style={styles.sparkle1} />
              <Sparkles size={20} color="#FFD700" style={styles.sparkle2} />
              <Sparkles size={16} color="#FFD700" style={styles.sparkle3} />
            </View>

            <Text style={styles.confirmationTitle}>🎉 Order Placed Successfully!</Text>
            <Text style={styles.confirmationMessage}>
              Yay! Your order has been placed successfully. Thank you for choosing MandiKharidari!
            </Text>

            {orderDetails && (
              <View style={styles.orderDetailsContainer}>
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Order ID:</Text>
                  <Text style={styles.orderDetailValue}>{orderDetails.orderId}</Text>
                </View>
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Order Type:</Text>
                  <Text style={styles.orderDetailValue}>
                    {orderDetails.orderType === "delivery" ? "🚚 Home Delivery" : "🏪 Takeaway"}
                  </Text>
                </View>
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Payment:</Text>
                  <Text style={styles.orderDetailValue}>
                    {orderDetails.paymentMethod === "cod" ? "💵 Cash on Delivery" : "💳 Online Payment"}
                  </Text>
                </View>
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Total Amount:</Text>
                  <Text style={[styles.orderDetailValue, styles.totalAmount]}>₹{orderDetails.total.toFixed(2)}</Text>
                </View>
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Estimated Time:</Text>
                  <Text style={styles.orderDetailValue}>⏰ {orderDetails.estimatedTime}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.confirmationButton} onPress={handleConfirmationClose} activeOpacity={0.8}>
              <Text style={styles.confirmationButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: "#64748B",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  cartItems: {
    gap: 16,
    marginBottom: 24,
  },
  cartItem: {
  flexDirection: "row",
  backgroundColor: "#FFFFFF", // ← Add this
  borderRadius: 16,
  padding: 16,
  shadowColor: "#000",        // ← Add for better elevation on Android
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: "cover",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
  },
  itemControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: "center",
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  itemTotal: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  itemTotalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22C55E",
  },
  footer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: "#22C55E",
  },
  checkoutButton: {
    backgroundColor: "#22C55E",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0.1,
  },
  checkoutText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
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
  optionGroup: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
  },
  optionButtons: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  optionButtonActive: {
    backgroundColor: "#22C55E",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  optionButtonTextActive: {
    color: "#FFFFFF",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: "#15803D",
    marginLeft: 8,
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#22C55E",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  confirmationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmationContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  successIconContainer: {
    position: "relative",
    marginBottom: 20,
  },
  sparkle1: {
    position: "absolute",
    top: -10,
    right: -10,
  },
  sparkle2: {
    position: "absolute",
    bottom: -5,
    left: -15,
  },
  sparkle3: {
    position: "absolute",
    top: 20,
    left: -20,
  },
  confirmationTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    textAlign: "center",
  },
  confirmationMessage: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  orderDetailsContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 24,
  },
  orderDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  orderDetailLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  totalAmount: {
    color: "#22C55E",
    fontSize: 16,
    fontWeight: "700",
  },
  confirmationButton: {
    backgroundColor: "#22C55E",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmationButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
})
