"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from "react-native"
import { router } from "expo-router"
import { User, Settings, BarChart3, Package, LogOut, Shield } from "lucide-react-native"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminProfileScreen() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout()
          router.replace("/(auth)/welcome")
        },
      },
    ])
  }

  const menuItems = [
    {
      icon: <Package size={24} stroke="#64748B" strokeWidth={2} />,
      title: "Inventory Management",
      subtitle: "Manage products and stock",
      onPress: () => router.push("/(admin)/inventory"),
    },
    {
      icon: <BarChart3 size={24} stroke="#64748B" strokeWidth={2} />,
      title: "Analytics",
      subtitle: "View business insights",
      onPress: () => router.push("/(admin)/analytics"),
    },
    {
      icon: <Settings size={24} stroke="#64748B" strokeWidth={2} />,
      title: "Settings",
      subtitle: "App preferences",
      onPress: () => {},
    },
    {
      icon: <LogOut size={24} stroke="#EF4444" strokeWidth={2} />,
      title: "Logout",
      subtitle: "Sign out of admin panel",
      onPress: handleLogout,
      textColor: "#EF4444",
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Profile</Text>
        <Text style={styles.subtitle}>Manage your admin account</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Shield size={40} stroke="#3B82F6" strokeWidth={2} />
          </View>
          <Text style={styles.userName}>{user?.name || "Admin"}</Text>
          <Text style={styles.userRole}>Administrator</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <User size={20} stroke="#3B82F6" strokeWidth={2} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>anmol</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Shield size={20} stroke="#3B82F6" strokeWidth={2} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>System Administrator</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
              <View style={styles.menuIcon}>{item.icon}</View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: item.textColor || "#1E293B" }]}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.menuArrow}>
                <Text style={styles.arrowText}>›</Text>
              </View>
            </TouchableOpacity>
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
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EBF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#3B82F6",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
  },
  infoSection: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  infoText: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
  },
  menuSection: {
    padding: 16,
    paddingTop: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  menuArrow: {
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 20,
    color: "#94A3B8",
    fontWeight: "300",
  },
})
