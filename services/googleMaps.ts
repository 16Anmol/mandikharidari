import { ReactNode } from "react"

export interface LocationCoordinates {
  latitude: number
  longitude: number
}

export interface LocationDetails {
  longitude: any
  latitude: any
  pincode: ReactNode
  coordinates: LocationCoordinates
  address: string
  city: string
  state: string
  country: string
}

export interface PlaceResult {
  id: string
  name: string
  address: string
  coordinates: LocationCoordinates
  rating?: number
  types: string[]
}

class GoogleMapsService {
  reverseGeocode(coordinates: any) {
      throw new Error("Method not implemented.")
  }
  calculateDistance(point1: LocationCoordinates, point2: LocationCoordinates): number {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = this.deg2rad(point2.latitude - point1.latitude)
    const dLon = this.deg2rad(point2.longitude - point1.longitude)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) *
        Math.cos(this.deg2rad(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in kilometers
    return distance
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  async searchPlaces(query: string): Promise<PlaceResult[]> {
    // Mock implementation - in real app, use Google Places API
    const mockResults: PlaceResult[] = [
      {
        id: "1",
        name: "GT Road Market",
        address: "GT Road, Amritsar",
        coordinates: { latitude: 31.634, longitude: 74.8723 },
        rating: 4.2,
        types: ["market", "food"],
      },
      {
        id: "2",
        name: "Mall Road Market",
        address: "Mall Road, Amritsar",
        coordinates: { latitude: 31.626, longitude: 74.882 },
        rating: 4.5,
        types: ["market", "shopping"],
      },
    ]

    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockResults.filter(
          (result) =>
            result.name.toLowerCase().includes(query.toLowerCase()) ||
            result.address.toLowerCase().includes(query.toLowerCase()),
        )
        resolve(filtered)
      }, 500)
    })
  }

  async getCurrentLocation(): Promise<LocationDetails> {
    // Mock implementation - in real app, use device location
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve({
          longitude: 74.8723,
          latitude: 31.634,
          pincode: "12345", // Add a default or appropriate value for pincode
          coordinates: { latitude: 31.634, longitude: 74.8723 },
          address: "Current Location",
          city: "Amritsar",
          state: "Punjab",
          country: "India",
        })
      }, 1000)
    })
  }
}

export const googleMapsService = new GoogleMapsService()

export const searchPlaces = async (query: string): Promise<LocationDetails[]> => {
  // Mock implementation - in real app, use Google Places API
  const mockResults: LocationDetails[] = [
    {
      coordinates: { latitude: 31.634, longitude: 74.8723 },
      address: "GT Road, Amritsar",
      city: "Amritsar",
      state: "Punjab",
      country: "India",
      longitude: undefined,
      latitude: undefined,
      pincode: undefined
    },
    {
      coordinates: { latitude: 31.626, longitude: 74.882 },
      address: "Mall Road, Amritsar",
      city: "Amritsar",
      state: "Punjab",
      country: "India",
      longitude: undefined,
      latitude: undefined,
      pincode: undefined
    },
  ]

  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockResults.filter(
        (result) =>
          result.address.toLowerCase().includes(query.toLowerCase()) ||
          result.city.toLowerCase().includes(query.toLowerCase()),
      )
      resolve(filtered)
    }, 500)
  })
}

export const getCurrentLocation = async (): Promise<LocationDetails> => {
  // Mock implementation - in real app, use device location
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        longitude: 74.8723,
        latitude: 31.634,
        pincode: "",
        coordinates: { latitude: 31.634, longitude: 74.8723 },
        address: "Current Location",
        city: "Amritsar",
        state: "Punjab",
        country: "India",
      })
    }, 1000)
  })
}
