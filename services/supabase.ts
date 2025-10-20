import { createClient } from "@supabase/supabase-js"

// Use your provided Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://ocmscvjlohoipculwstf.supabase.co"
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jbXNjdmpsb2hvaXBjdWx3c3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDgwNDQsImV4cCI6MjA2ODQyNDA0NH0.eR7lilI2I05rYQqK-zef0DoC9BsbGvR_VqRppkPt1Y8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Product {
  unit: string
  id: string
  name: string
  price: number
  stock: number
  type: "vegetable" | "fruit"
  image_url?: string
  mandi_price?: number
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  role?: "customer" | "admin"
  created_at?: string
}

export interface Order {
  id: string
  user_id: string
  location: string
  items: OrderItem[]
  total_cost: number
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"
  order_type?: "delivery" | "takeaway"
  payment_method?: "cod" | "online"
  timestamp: string
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
  unit: string
}

// Database types for vendor data
export interface VendorProduct {
  id: string
  name: string
  category: "fruits" | "vegetables" | "others"
  price: number
  stock_status: "in_stock" | "out_of_stock"
  vendor_id: string
  image_url?: string
  created_at?: string
  updated_at?: string
}

export interface Vendor {
  id: string
  vendor_id: string
  vendor_name: string
  created_at?: string
}

// Haversine formula to calculate distance between two coordinates
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Location coordinates for major cities
const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  amritsar: { lat: 31.634, lon: 74.8723 },
  ludhiana: { lat: 30.901, lon: 75.8573 },
  patiala: { lat: 30.3398, lon: 76.3869 },
  chandigarh: { lat: 30.7333, lon: 76.7794 },
  jalandhar: { lat: 31.326, lon: 75.5762 },
}

// Mock data for our app (28-29 items as requested)
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Tomatoes",
    type: "vegetable",
    price: 40,
    stock: 50,
    image_url: "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg",
    unit: "kg",
  },
  {
    id: "2",
    name: "Spinach",
    type: "vegetable",
    price: 25,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "3",
    name: "Apple",
    type: "fruit",
    price: 120,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "4",
    name: "Banana",
    type: "fruit",
    price: 60,
    stock: 40,
    image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "5",
    name: "Carrot",
    type: "vegetable",
    price: 35,
    stock: 35,
    image_url: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "6",
    name: "Bell Peppers",
    type: "vegetable",
    price: 80,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "7",
    name: "Orange",
    type: "fruit",
    price: 90,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "8",
    name: "Broccoli",
    type: "vegetable",
    price: 70,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "9",
    name: "Fresh Grapes",
    type: "fruit",
    price: 150,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "10",
    name: "Onions",
    type: "vegetable",
    price: 30,
    stock: 45,
    image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "11",
    name: "Fresh Mangoes",
    type: "fruit",
    price: 200,
    stock: 12,
    image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "12",
    name: "Potatoes",
    type: "vegetable",
    price: 25,
    stock: 60,
    image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "13",
    name: "Cauliflower",
    type: "vegetable",
    price: 30,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1568584711271-61c3b99d6e6d?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "14",
    name: "Green Beans",
    type: "vegetable",
    price: 40,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "15",
    name: "Cucumber",
    type: "vegetable",
    price: 22,
    stock: 40,
    image_url: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "16",
    name: "Eggplant",
    type: "vegetable",
    price: 35,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "17",
    name: "Fresh Lemons",
    type: "fruit",
    price: 60,
    stock: 35,
    image_url: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "18",
    name: "Cabbage",
    type: "vegetable",
    price: 18,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "19",
    name: "Radish",
    type: "vegetable",
    price: 15,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "20",
    name: "Green Peas",
    type: "vegetable",
    price: 50,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "21",
    name: "Sweet Corn",
    type: "vegetable",
    price: 25,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "22",
    name: "Pumpkin",
    type: "vegetable",
    price: 20,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "23",
    name: "Fresh Pineapple",
    type: "fruit",
    price: 40,
    stock: 18,
    image_url: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "24",
    name: "Watermelon",
    type: "fruit",
    price: 15,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "25",
    name: "Papaya",
    type: "fruit",
    price: 30,
    stock: 22,
    image_url: "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "26",
    name: "Bottle Gourd",
    type: "vegetable",
    price: 25,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "27",
    name: "Bitter Gourd",
    type: "vegetable",
    price: 45,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "28",
    name: "Lady Finger",
    type: "vegetable",
    price: 40,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=200&h=200&fit=crop",
    unit: "kg",
  },
  {
    id: "29",
    name: "Green Chili",
    type: "vegetable",
    price: 80,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=200&h=200&fit=crop",
    unit: "kg",
  },
]

// Function to get vendor prices for products near user's location
export const getVendorPricesNearLocation = async (userLocation: string): Promise<Record<string, number>> => {
  try {
    const userCoords = cityCoordinates[userLocation.toLowerCase()]
    if (!userCoords) {
      console.warn(`Location ${userLocation} not found in coordinates`)
      return {}
    }

    // Get all vendors
    const { data: vendors, error: vendorsError } = await supabase.from("vendors").select("vendor_id, vendor_name")

    if (vendorsError) {
      console.error("Error fetching vendors:", vendorsError)
      return {}
    }

    // Filter vendors by proximity (within 100km of user location)
    const nearbyVendors =
      vendors?.filter((vendor) => {
        // Extract location from vendor_id (assuming format like "amritsarvendor123")
        const vendorLocation = vendor.vendor_id.replace(/vendor\d+/g, "").toLowerCase()
        const vendorCoords = cityCoordinates[vendorLocation]

        if (!vendorCoords) return false

        const distance = haversineDistance(userCoords.lat, userCoords.lon, vendorCoords.lat, vendorCoords.lon)

        return distance <= 100 // Within 100km
      }) || []

    if (nearbyVendors.length === 0) {
      console.warn("No nearby vendors found")
      return {}
    }

    const nearbyVendorIds = nearbyVendors.map((v) => v.vendor_id)

    // Get vendor products from nearby vendors
    const { data: vendorProducts, error: productsError } = await supabase
      .from("vendor_products")
      .select("id, name, price, vendor_id")
      .in("vendor_id", nearbyVendorIds)
      .eq("stock_status", "in_stock")

    if (productsError) {
      console.error("Error fetching vendor products:", productsError)
      return {}
    }

    // Calculate average prices for each product name
    const priceMap: Record<string, number[]> = {}

    vendorProducts?.forEach((product) => {
      const normalizedName = normalizeProductName(product.name)
      if (!priceMap[normalizedName]) {
        priceMap[normalizedName] = []
      }
      priceMap[normalizedName].push(Number(product.price))
    })

    // Calculate averages
    const averagePrices: Record<string, number> = {}
    Object.entries(priceMap).forEach(([name, prices]) => {
      if (prices.length > 0) {
        averagePrices[name] = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
      }
    })

    return averagePrices
  } catch (error) {
    console.error("Error in getVendorPricesNearLocation:", error)
    return {}
  }
}

// Function to normalize product names for matching
function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .replace(/fresh\s+/g, "")
    .replace(/green\s+/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// Function to match our products with vendor products
export const getMatchedVendorPrices = async (
  userLocation: string,
): Promise<
  Array<{
    product: Product
    vendorPrice?: number
  }>
> => {
  const vendorPrices = await getVendorPricesNearLocation(userLocation)

  return mockProducts
    .map((product) => {
      const normalizedName = normalizeProductName(product.name)
      const vendorPrice = vendorPrices[normalizedName]

      return {
        product,
        vendorPrice,
      }
    })
    .filter((item) => item.vendorPrice !== undefined) // Only show products that have vendor prices
}

const mockOrders: Order[] = [
  {
    id: "order_1",
    user_id: "user_1",
    location: "Sample Address, Amritsar, Punjab",
    items: [
      { product_id: "1", product_name: "Fresh Tomatoes", quantity: 2, price: 40, unit: "kg" },
      { product_id: "2", product_name: "Green Spinach", quantity: 1, price: 25, unit: "kg" },
    ],
    total_cost: 105,
    status: "pending",
    order_type: "delivery",
    payment_method: "cod",
    timestamp: new Date().toISOString(),
  },
]

export const getProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProducts), 500)
  })
}

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const interval = setInterval(() => {
    callback(mockProducts)
  }, 30000)

  return {
    unsubscribe: () => clearInterval(interval),
  }
}

export const createOrder = async (
  orderData: Omit<Order, "id" | "timestamp" | "created_at" | "updated_at">,
): Promise<Order> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newOrder: Order = {
        id: `order_${Date.now()}`,
        ...orderData,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockOrders.push(newOrder)
      resolve(newOrder)
    }, 1000)
  })
}

export const getOrders = async (): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockOrders), 500)
  })
}

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const interval = setInterval(() => {
    callback(mockOrders)
  }, 10000)

  return {
    unsubscribe: () => clearInterval(interval),
  }
}

export const updateOrderStatus = async (orderId: string, status: Order["status"]): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderIndex = mockOrders.findIndex((order) => order.id === orderId)
      if (orderIndex !== -1) {
        mockOrders[orderIndex].status = status
        mockOrders[orderIndex].updated_at = new Date().toISOString()
      }
      resolve()
    }, 500)
  })
}

export const addProduct = async (productData: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProduct: Product = {
        id: `product_${Date.now()}`,
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockProducts.push(newProduct)
      resolve(newProduct)
    }, 500)
  })
}

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const productIndex = mockProducts.findIndex((p) => p.id === id)
      if (productIndex !== -1) {
        mockProducts[productIndex] = { ...mockProducts[productIndex], ...updates, updated_at: new Date().toISOString() }
      }
      resolve()
    }, 500)
  })
}

export const deleteProduct = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const productIndex = mockProducts.findIndex((p) => p.id === id)
      if (productIndex !== -1) {
        mockProducts.splice(productIndex, 1)
      }
      resolve()
    }, 500)
  })
}
