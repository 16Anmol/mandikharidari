"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch, Alert, Modal } from "react-native"
import { useState } from "react"
import { router } from "expo-router"
import {
  ArrowLeft,
  Bell,
  Moon,
  Globe,
  Shield,
  HelpCircle,
  LogIn,
  User,
  Phone,
  Mail,
  MapPin,
  X,
} from "lucide-react-native"
import { useAuth } from "@/contexts/AuthContext"

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const { user, logout } = useAuth()

  const handleSwitchAccount = () => {
    Alert.alert("Switch Account", "You will be logged out and redirected to the login screen. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Continue",
        onPress: async () => {
          await logout()
          router.replace("/(auth)/welcome")
        },
      },
    ])
  }

  const settingsItems = [
    {
      icon: <Bell size={24} stroke="#64748B" strokeWidth={2} />,
      title: "Notifications",
      subtitle: "Push notifications for orders",
      type: "switch",
      value: notifications,
      onToggle: setNotifications,
    },
    {
      icon: <Moon size={24} stroke="#64748B" strokeWidth={2} />,
      title: "Dark Mode",
      subtitle: "Switch to dark theme",
      type: "switch",
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      icon: <Globe size={24} stroke="#64748B" strokeWidth={2} />,
      title: "Language",
      subtitle: "English",
      type: "navigation",
      onPress: () => {},
    },
    {
      icon: <LogIn size={24} stroke="#3B82F6" strokeWidth={2} />,
      title: "Switch Account",
      subtitle: "Login as different user or admin",
      type: "navigation",
      onPress: handleSwitchAccount,
      textColor: "#3B82F6",
    },
    {
      icon: <Shield size={24} stroke="#64748B" strokeWidth={2} />,
      title: "Privacy Policy",
      subtitle: "Read our privacy policy",
      type: "navigation",
      onPress: () => {},
    },
    {
      icon: <HelpCircle size={24} stroke="#64748B" strokeWidth={2} />,
      title: "Help & Support",
      subtitle: "Get help with the app",
      type: "navigation",
      onPress: () => {},
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} stroke="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <TouchableOpacity style={styles.userSection} onPress={() => setShowUserDetails(true)}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <User size={24} stroke="#22C55E" strokeWidth={2} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || "User"}</Text>
              <Text style={styles.userRole}>Customer Account</Text>
            </View>
          </View>
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>

        <View style={styles.settingsContainer}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={item.onPress}
              disabled={item.type === "switch"}
              activeOpacity={0.7}
            >
              <View style={styles.settingIcon}>{item.icon}</View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: item.textColor || "#1E293B" }]}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.settingAction}>
                {item.type === "switch" ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: "#E2E8F0", true: "#22C55E" }}
                    thumbColor="#FFFFFF"
                  />
                ) : (
                  <Text style={styles.arrowText}>›</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appName}>MandiKharidari</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>Fresh vegetables and fruits delivered to your doorstep</Text>
        </View>
      </ScrollView>

      {/* User Details Modal */}
      <Modal visible={showUserDetails} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Details</Text>
              <TouchableOpacity onPress={() => setShowUserDetails(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <User size={20} color="#22C55E" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Full Name</Text>
                    <Text style={styles.detailValue}>{user?.name || "Not provided"}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Phone size={20} color="#22C55E" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text style={styles.detailValue}>{user?.phone || "Not provided"}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Mail size={20} color="#22C55E" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{user?.email || "Not provided"}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <MapPin size={20} color="#22C55E" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>
                      {user?.city}, {user?.state}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <MapPin size={20} color="#22C55E" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{user?.address || "Not provided"}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.editButton} onPress={() => router.push("/(customer)/profile")}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
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
  userSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: "#64748B",
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#22C55E",
    fontWeight: "600",
  },
  settingsContainer: {
    padding: 20,
  },
  settingItem: {
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
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  settingAction: {
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 20,
    color: "#94A3B8",
    fontWeight: "300",
  },
  appInfoSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#22C55E",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  modalBody: {
    padding: 20,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  editButton: {
    backgroundColor: "#22C55E",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
