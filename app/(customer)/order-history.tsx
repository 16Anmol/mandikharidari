"use client"

import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl } from "react-native"
import { router } from "expo-router"
import { ArrowLeft, Package, MapPin, CheckCircle, Truck } from "lucide-react-native"
import { getOrders, subscribeToOrders } from "@/services/supabase"
import type { Order } from "@/services/supabase"
import { useAuth } from "@/contexts/AuthContext"
import DeliveryTracker from "@/components/DeliveryTracker"
// Define LocationCoordinates type locally since it is not exported from googleMaps
type LocationCoordinates = {
  latitude: number
  longitude: number
}

const statusColors: Record<string, string> = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  preparing: "#8B5CF6",
  out_for_delivery: "#10B981",
  delivered: "#22C55E",
  cancelled: "#EF4444",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

// Mock locations for demo
const STORE_LOCATION: LocationCoordinates = {
  latitude: 31.634, // Amritsar store location
  longitude: 74.8723,
}

const CUSTOMER_LOCATION: LocationCoordinates = {
  latitude: 31.626, // Customer location in Amritsar
  longitude: 74.882,
}

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [showTracker, setShowTracker] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadOrders()
    const subscription = subscribeToOrders((updatedOrders: any[]) => {
      // Filter orders for current user
      const userOrders = updatedOrders.filter((order: { user_id: string | undefined }) => order.user_id === user?.id)
      setOrders(userOrders)
    })
    return () => subscription.unsubscribe()
  }, [user])

  const loadOrders = async () => {
    try {
      const data = await getOrders()
      // Filter orders for current user
      const userOrders = data.filter((order: { user_id: string | undefined }) => order.user_id === user?.id)
      setOrders(userOrders)
    } catch (error) {
      console.error("Failed to load orders:", error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
  }

  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowTracker(true)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const canTrackOrder = (status: string) => {
    return ["confirmed", "preparing", "out_for_delivery"].includes(status)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} stroke="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={64} stroke="#CBD5E1" strokeWidth={1} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
                    <Text style={styles.orderDate}>
                      {formatDate(order.timestamp)} at {formatTime(order.timestamp)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] }]}>
                    <Text style={styles.statusText}>{statusLabels[order.status]}</Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <MapPin size={16} stroke="#64748B" strokeWidth={2} />
                    <Text style={styles.detailText} numberOfLines={2}>
                      {order.location}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemsContainer}>
                  <Text style={styles.itemsTitle}>Items ({order.items.length})</Text>
                  {order.items.map((item: { product_name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; quantity: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; unit: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; price: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }, index: Key | null | undefined) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.product_name}</Text>
                      <Text style={styles.itemQuantity}>
                        {item.quantity} {item.unit}
                      </Text>
                      <Text style={styles.itemPrice}>₹{item.price}</Text>
                    </View>
                  ))}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalAmount}>₹{order.total_cost}</Text>
                  </View>
                </View>

                <View style={styles.orderActions}>
                  {canTrackOrder(order.status) && (
                    <TouchableOpacity style={styles.trackButton} onPress={() => handleTrackOrder(order)}>
                      <Truck size={16} stroke="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.trackButtonText}>Track Order</Text>
                    </TouchableOpacity>
                  )}

                  {order.status === "delivered" && (
                    <View style={styles.completedBadge}>
                      <CheckCircle size={16} stroke="#15803D" strokeWidth={2} />
                      <Text style={styles.completedText}>Order Completed</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {selectedOrder && (
        <DeliveryTracker
          visible={showTracker}
          onClose={() => setShowTracker(false)}
          orderId={selectedOrder.id}
          customerLocation={CUSTOMER_LOCATION}
          storeLocation={STORE_LOCATION}
          orderStatus={selectedOrder.status}
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  ordersContainer: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#64748B",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  orderDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detailText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 8,
    flex: 1,
  },
  itemsContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  itemName: {
    fontSize: 14,
    color: "#64748B",
    flex: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#64748B",
    flex: 1,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22C55E",
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22C55E",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  trackButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  completedText: {
    color: "#15803D",
    fontSize: 14,
    fontWeight: "600",
  },
})
