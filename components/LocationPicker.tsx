"use client"

import { useState, useEffect } from "react"
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from "react-native"
import { X, Search, MapPin } from "lucide-react-native"
import { searchPlaces, getCurrentLocation, type LocationDetails } from "@/services/googleMaps"

interface LocationPickerProps {
  visible: boolean
  onClose: () => void
  onLocationSelect: (location: LocationDetails) => void
  initialLocation?: { latitude: number; longitude: number }
}

export default function LocationPicker({ visible, onClose, onLocationSelect, initialLocation }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<LocationDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationDetails | null>(null)

  useEffect(() => {
    if (visible) {
      loadCurrentLocation()
    }
  }, [visible])

  useEffect(() => {
    if (searchQuery.trim()) {
      searchLocations()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const loadCurrentLocation = async () => {
    try {
      setLoading(true)
      const location = await getCurrentLocation()
      setCurrentLocation(location)
    } catch (error) {
      console.error("Failed to get current location:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchLocations = async () => {
    try {
      setLoading(true)
      const results = await searchPlaces(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error("Failed to search locations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = (location: LocationDetails) => {
    onLocationSelect(location)
    onClose()
  }

  const renderLocationItem = ({ item }: { item: LocationDetails }) => (
    <TouchableOpacity style={styles.locationItem} onPress={() => handleLocationSelect(item)}>
      <MapPin size={20} color="#22C55E" />
      <View style={styles.locationInfo}>
        <Text style={styles.locationAddress}>{item.address}</Text>
        <Text style={styles.locationCity}>
          {item.city}, {item.state}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Location</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {currentLocation && (
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={() => handleLocationSelect(currentLocation)}
            >
              <MapPin size={20} color="#22C55E" />
              <View style={styles.locationInfo}>
                <Text style={styles.currentLocationText}>Use Current Location</Text>
                <Text style={styles.locationCity}>
                  {currentLocation.city}, {currentLocation.state}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22C55E" />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderLocationItem}
              keyExtractor={(item, index) => `${item.coordinates.latitude}-${index}`}
              style={styles.resultsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F0FDF4",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22C55E",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  resultsList: {
    flex: 1,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
  },
  locationCity: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
})
