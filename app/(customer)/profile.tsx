"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Alert } from "react-native"
import { router } from "expo-router"
import { ArrowLeft, MapPin, Phone, Mail, History, Settings, LogOut, LocationEdit as Edit, Plus } from "lucide-react-native"
import { useAuth } from "@/contexts/AuthContext"

export default function ProfileScreen() {
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

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing feature will be available soon!")
  }

  const handleAddAddress = () => {
    Alert.alert("Add Address", "Add new address feature will be available soon!")
  }

  const menuItems = [
    {
      icon: <Edit size={24} stroke="#64748B" strokeWidth={2} />,
      title: "Edit Profile",
      subtitle: "Update your personal information",
      onPress: handleEditProfile,
    },
    {
      icon: <Plus size={24} stroke="#64748B" strokeWidth={2} />,
      title: "Add New Address",
      subtitle: "Add delivery addresses",
      onPress: handleAddAddress,
    },
    {
      icon: <History size={24} stroke="#64748B" strokeWidth={2} />,
      title: "Order History",
      subtitle: "View your past orders",
      onPress: () => router.push("/(customer)/order-history"),
    },
    {
      icon: <Settings size={24} stroke="#64748B" strokeWidth={2} />,
      title: "Settings",
      subtitle: "App preferences",
      onPress: () => router.push("/(customer)/settings"),
    },
    {
      icon: <LogOut size={24} stroke="#EF4444" strokeWidth={2} />,
      title: "Logout",
      subtitle: "Sign out of your account",
      onPress: handleLogout,
      textColor: "#EF4444",
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} stroke="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: "/placeholder.svg?height=100&width=100&text=User" }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
              <Edit size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userRole}>Customer</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Phone size={20} stroke="#22C55E" strokeWidth={2} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{user?.phone || "Not provided"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Mail size={20} stroke="#22C55E" strokeWidth={2} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || "Not provided"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <MapPin size={20} stroke="#22C55E" strokeWidth={2} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {user?.address || "Not provided"}
                </Text>
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
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#22C55E",
    position: "relative",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: "#64748B",
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    padding: 20,
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
