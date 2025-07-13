"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl, Dimensions } from "react-native"
import { TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react-native"
import { getOrders, getProducts } from "@/services/supabase"
import type { Order } from "@/services/supabase"

const { width } = Dimensions.get("window")

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  averageOrderValue: number
  recentOrders: Order[]
  topProducts: { name: string; sales: number; revenue: number }[]
  dailyStats: { date: string; orders: number; revenue: number }[]
}

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    recentOrders: [],
    topProducts: [],
    dailyStats: [],
  })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const [orders, products] = await Promise.all([getOrders(), getProducts()])

      const totalRevenue = orders.reduce((sum, order) => sum + order.total_cost, 0)
      const totalOrders = orders.length
      const totalProducts = products.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Get recent orders (last 10)
      const recentOrders = orders.slice(0, 10)

      // Calculate top products
      const productSales: Record<string, { sales: number; revenue: number }> = {}
      orders.forEach((order) => {
        order.items.forEach((item) => {
          if (!productSales[item.product_name]) {
            productSales[item.product_name] = { sales: 0, revenue: 0 }
          }
          productSales[item.product_name].sales += item.quantity
          productSales[item.product_name].revenue += item.price * item.quantity
        })
      })

      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Calculate daily stats for last 7 days
      const dailyStats = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        const dayOrders = orders.filter((order) => order.timestamp.split("T")[0] === dateStr)

        dailyStats.push({
          date: date.toLocaleDateString("en-IN", { weekday: "short" }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, order) => sum + order.total_cost, 0),
        })
      }

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalProducts,
        averageOrderValue,
        recentOrders,
        topProducts,
        dailyStats,
      })
    } catch (error) {
      console.error("Failed to load analytics:", error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadAnalytics()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`
  }

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
    color,
  }: {
    icon: React.ReactNode
    title: string
    value: string
    subtitle: string
    color: string
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>{icon}</View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <Text style={styles.subtitle}>Business insights and metrics</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <StatCard
            icon={<DollarSign size={24} stroke="#22C55E" strokeWidth={2} />}
            title="Total Revenue"
            value={formatCurrency(analytics.totalRevenue)}
            subtitle="All time earnings"
            color="#22C55E"
          />
          <StatCard
            icon={<ShoppingBag size={24} stroke="#3B82F6" strokeWidth={2} />}
            title="Total Orders"
            value={analytics.totalOrders.toString()}
            subtitle="Orders received"
            color="#3B82F6"
          />
          <StatCard
            icon={<Users size={24} stroke="#8B5CF6" strokeWidth={2} />}
            title="Products"
            value={analytics.totalProducts.toString()}
            subtitle="In inventory"
            color="#8B5CF6"
          />
          <StatCard
            icon={<TrendingUp size={24} stroke="#F59E0B" strokeWidth={2} />}
            title="Avg Order"
            value={formatCurrency(analytics.averageOrderValue)}
            subtitle="Per order value"
            color="#F59E0B"
          />
        </View>

        {/* Daily Stats Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Weekly Performance</Text>
          <View style={styles.chartWrapper}>
            <View style={styles.chart}>
              {analytics.dailyStats.map((day, index) => {
                const maxRevenue = Math.max(...analytics.dailyStats.map((d) => d.revenue))
                const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 120 : 0

                return (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(height, 4),
                            backgroundColor: day.revenue > 0 ? "#22C55E" : "#E2E8F0",
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{day.date}</Text>
                    <Text style={styles.barValue}>{day.orders}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.topProductsContainer}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          {analytics.topProducts.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productStats}>
                  {product.sales}kg sold • {formatCurrency(product.revenue)}
                </Text>
              </View>
              <View style={styles.productRevenue}>
                <Text style={styles.revenueText}>{formatCurrency(product.revenue)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Orders */}
        <View style={styles.recentOrdersContainer}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {analytics.recentOrders.slice(0, 5).map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                <Text style={styles.orderDate}>{new Date(order.timestamp).toLocaleDateString("en-IN")}</Text>
              </View>
              <View style={styles.orderStatus}>
                <View
                  style={[styles.statusDot, { backgroundColor: order.status === "delivered" ? "#22C55E" : "#F59E0B" }]}
                />
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
              <Text style={styles.orderAmount}>{formatCurrency(order.total_cost)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: (width - 44) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  chartWrapper: {
    alignItems: "center",
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    height: 160,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
  },
  barContainer: {
    height: 120,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
  },
  barValue: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 2,
  },
  topProductsContainer: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  productStats: {
    fontSize: 14,
    color: "#64748B",
  },
  productRevenue: {
    alignItems: "flex-end",
  },
  revenueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22C55E",
  },
  recentOrdersContainer: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 14,
    color: "#64748B",
  },
  orderStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: "#64748B",
    textTransform: "capitalize",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
})
