"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView, ScrollView, Dimensions } from "react-native"
import { Menu, X, Home, ShoppingCart, User, Settings, HelpCircle, LogOut } from "lucide-react-native"
import { router } from "expo-router"

interface HamburgerMenuProps {
  currentScreen?: string
}

const { width } = Dimensions.get("window")

export default function HamburgerMenu({ currentScreen }: HamburgerMenuProps) {
  const [isVisible, setIsVisible] = useState(false)

  const menuItems = [
    {
      icon: Home,
      label: "Home",
      route: "/(customer)",
      isActive: currentScreen === "/(customer)" || currentScreen === "/(customer)/index",
    },
    {
      icon: ShoppingCart,
      label: "Cart",
      route: "/(customer)/cart",
      isActive: currentScreen === "/(customer)/cart",
    },
    {
      icon: User,
      label: "Profile",
      route: "/(customer)/profile",
      isActive: currentScreen === "/(customer)/profile",
    },
    {
      icon: Settings,
      label: "Settings",
      route: "/(customer)/settings",
      isActive: currentScreen === "/(customer)/settings",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      route: "/(customer)/feedback",
      isActive: currentScreen === "/(customer)/feedback",
    },
  ]

  const handleNavigation = (route: string) => {
    setIsVisible(false)
    router.push(route as any)
  }

  const handleLogout = () => {
    setIsVisible(false)
    router.replace("/(auth)/welcome")
  }

  return (
    <>
      <TouchableOpacity style={styles.menuButton} onPress={() => setIsVisible(true)} activeOpacity={0.7}>
        <Menu size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={() => setIsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <SafeAreaView style={styles.safeArea}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Menu</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setIsVisible(false)}>
                  <X size={24} color="#1E293B" />
                </TouchableOpacity>
              </View>

              {/* Menu Items */}
              <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
                {menuItems.map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.menuItem, item.isActive && styles.menuItemActive]}
                      onPress={() => handleNavigation(item.route)}
                      activeOpacity={0.7}
                    >
                      <IconComponent size={20} color={item.isActive ? "#22C55E" : "#64748B"} />
                      <Text style={[styles.menuItemText, item.isActive && styles.menuItemTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}

                {/* Divider */}
                <View style={styles.divider} />

                {/* Logout */}
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
                  <LogOut size={20} color="#EF4444" />
                  <Text style={[styles.menuItemText, { color: "#EF4444" }]}>Logout</Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>MandiKharidari</Text>
                <Text style={styles.footerVersion}>Version 1.0.0</Text>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    width: "100%",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: "#F0FDF4",
  },
  menuItemText: {
    fontSize: 16,
    color: "#64748B",
    marginLeft: 16,
    fontWeight: "500",
  },
  menuItemTextActive: {
    color: "#22C55E",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  footerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22C55E",
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: "#94A3B8",
  },
})
