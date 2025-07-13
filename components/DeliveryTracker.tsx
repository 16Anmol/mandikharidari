"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from "react-native"
import MapView, { Marker, Polyline, type Region } from "react-native-maps"
import { X, Phone, MessageCircle, Truck } from "lucide-react-native"
import { googleMapsService, type LocationCoordinates } from "@/services/googleMaps"

interface DeliveryTrackerProps {
  visible: boolean
  onClose: () => void
  orderId: string
  customerLocation: LocationCoordinates
  storeLocation: LocationCoordinates
  deliveryPersonLocation?: LocationCoordinates
  orderStatus: string
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: "📝" },
  { key: "confirmed", label: "Order Confirmed", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
]

export default function DeliveryTracker({
  visible,
  onClose,
  orderId,
  customerLocation,
  storeLocation,
  deliveryPersonLocation,
  orderStatus,
}: DeliveryTrackerProps) {
  const [region, setRegion] = useState<Region>({
    latitude: (customerLocation.latitude + storeLocation.latitude) / 2,
    longitude: (customerLocation.longitude + storeLocation.longitude) / 2,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  })
  const [currentDeliveryLocation, setCurrentDeliveryLocation] = useState<LocationCoordinates>(
    deliveryPersonLocation || storeLocation,
  )
  const [estimatedTime, setEstimatedTime] = useState("25-30 mins")
  const [distance, setDistance] = useState("0 km")
  const mapRef = useRef<MapView>(null)

  useEffect(() => {
    if (visible) {
      calculateRoute()
      // Simulate delivery person movement (in real app, this would come from real-time updates)
      if (orderStatus === "out_for_delivery") {
        simulateDeliveryMovement()
      }
    }
  }, [visible, orderStatus])

  const calculateRoute = () => {
    const dist = googleMapsService.calculateDistance(currentDeliveryLocation, customerLocation)
    setDistance(`${dist.toFixed(1)} km`)

    // Estimate time based on distance (assuming 20 km/h average speed)
    const timeInMinutes = Math.round((dist / 20) * 60)
    setEstimatedTime(`${timeInMinutes}-${timeInMinutes + 5} mins`)

    // Adjust map region to show both points
    const minLat = Math.min(currentDeliveryLocation.latitude, customerLocation.latitude)
    const maxLat = Math.max(currentDeliveryLocation.latitude, customerLocation.latitude)
    const minLng = Math.min(currentDeliveryLocation.longitude, customerLocation.longitude)
    const maxLng = Math.max(currentDeliveryLocation.longitude, customerLocation.longitude)

    const newRegion = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.abs(maxLat - minLat) * 1.5,
      longitudeDelta: Math.abs(maxLng - minLng) * 1.5,
    }
    setRegion(newRegion)
  }

  const simulateDeliveryMovement = () => {
    // Simulate delivery person moving towards customer (for demo purposes)
    const interval = setInterval(() => {
      setCurrentDeliveryLocation((prev: { latitude: number; longitude: number }) => {
        const newLat = prev.latitude + (customerLocation.latitude - prev.latitude) * 0.1
        const newLng = prev.longitude + (customerLocation.longitude - prev.longitude) * 0.1

        const newLocation = { latitude: newLat, longitude: newLng }

        // Update distance and time
        const dist = googleMapsService.calculateDistance(newLocation, customerLocation)
        setDistance(`${dist.toFixed(1)} km`)

        if (dist < 0.1) {
          clearInterval(interval)
          setEstimatedTime("Arriving now!")
        } else {
          const timeInMinutes = Math.round((dist / 20) * 60)
          setEstimatedTime(`${timeInMinutes}-${timeInMinutes + 5} mins`)
        }

        return newLocation
      })
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }

  const handleCallDeliveryPerson = () => {
    Alert.alert("Call Delivery Person", "Would you like to call the delivery person?", [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => Alert.alert("Calling", "Calling delivery person...") },
    ])
  }

  const handleMessageDeliveryPerson = () => {
    Alert.alert("Message", "Send a message to the delivery person?", [
      { text: "Cancel", style: "cancel" },
      { text: "Message", onPress: () => Alert.alert("Message Sent", "Your message has been sent!") },
    ])
  }

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex((step) => step.key === orderStatus)
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Order #{orderId.slice(0, 8)}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.mapContainer}>
          <MapView ref={mapRef} style={styles.map} region={region} onRegionChangeComplete={setRegion}>
            {/* Customer Location Marker */}
            <Marker
              coordinate={customerLocation}
              title="Your Location"
              description="Delivery Address"
              pinColor="#22C55E"
            />

            {/* Store Location Marker */}
            <Marker
              coordinate={storeLocation}
              title="MandiKharidari Store"
              description="Order pickup location"
              pinColor="#3B82F6"
            />

            {/* Delivery Person Location Marker */}
            {orderStatus === "out_for_delivery" && (
              <Marker coordinate={currentDeliveryLocation} title="Delivery Person" description="On the way to you">
                <View style={styles.deliveryMarker}>
                  <Truck size={20} color="#FFFFFF" />
                </View>
              </Marker>
            )}

            {/* Route Line */}
            {orderStatus === "out_for_delivery" && (
              <Polyline
                coordinates={[currentDeliveryLocation, customerLocation]}
                strokeColor="#22C55E"
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
          </MapView>
        </View>

        <View style={styles.infoContainer}>
          {/* Order Status Steps */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Order Status</Text>
            <View style={styles.statusSteps}>
              {statusSteps.map((step, index) => {
                const isCompleted = index <= getCurrentStepIndex()
                const isCurrent = index === getCurrentStepIndex()
                return (
                  <View key={step.key} style={styles.statusStep}>
                    <View style={[styles.statusIcon, isCompleted && styles.statusIconCompleted]}>
                      <Text style={styles.statusEmoji}>{step.icon}</Text>
                    </View>
                    <Text style={[styles.statusLabel, isCurrent && styles.statusLabelCurrent]}>{step.label}</Text>
                    {index < statusSteps.length - 1 && (
                      <View style={[styles.statusLine, isCompleted && styles.statusLineCompleted]} />
                    )}
                  </View>
                )
              })}
            </View>
          </View>

          {/* Delivery Info */}
          {orderStatus === "out_for_delivery" && (
            <View style={styles.deliveryInfo}>
              <View style={styles.deliveryStats}>
                <View style={styles.deliveryStat}>
                  <Text style={styles.deliveryStatValue}>{estimatedTime}</Text>
                  <Text style={styles.deliveryStatLabel}>Estimated Time</Text>
                </View>
                <View style={styles.deliveryStat}>
                  <Text style={styles.deliveryStatValue}>{distance}</Text>
                  <Text style={styles.deliveryStatLabel}>Distance</Text>
                </View>
              </View>

              <View style={styles.deliveryActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleCallDeliveryPerson}>
                  <Phone size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleMessageDeliveryPerson}>
                  <MessageCircle size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
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
    paddingTop: 50,
  },
  closeButton: {
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
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  deliveryMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  infoContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  statusSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusStep: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statusIconCompleted: {
    backgroundColor: "#22C55E",
  },
  statusEmoji: {
    fontSize: 16,
  },
  statusLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  statusLabelCurrent: {
    color: "#22C55E",
    fontWeight: "600",
  },
  statusLine: {
    position: "absolute",
    top: 20,
    left: "50%",
    right: "-50%",
    height: 2,
    backgroundColor: "#E2E8F0",
    zIndex: -1,
  },
  statusLineCompleted: {
    backgroundColor: "#22C55E",
  },
  deliveryInfo: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 20,
  },
  deliveryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  deliveryStat: {
    alignItems: "center",
  },
  deliveryStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#22C55E",
    marginBottom: 4,
  },
  deliveryStatLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  deliveryActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
