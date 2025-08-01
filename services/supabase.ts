import { createClient } from "@supabase/supabase-js"

// Use fallback values for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

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

// Mock data for development
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Fresh Tomatoes",
    type: "vegetable",
    price: 40,
    mandi_price: 35,
    stock: 50,
    image_url: "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg",
    unit: ""
  },
  {
    id: "2",
    name: "Green Spinach",
    type: "vegetable",
    price: 25,
    mandi_price: 20,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "3",
    name: "Fresh Apples",
    type: "fruit",
    price: 120,
    mandi_price: 100,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "4",
    name: "Bananas",
    type: "fruit",
    price: 60,
    mandi_price: 45,
    stock: 40,
    image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "5",
    name: "Carrots",
    type: "vegetable",
    price: 35,
    mandi_price: 28,
    stock: 35,
    image_url: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "6",
    name: "Bell Peppers",
    type: "vegetable",
    price: 80,
    mandi_price: 65,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "7",
    name: "Fresh Oranges",
    type: "fruit",
    price: 90,
    mandi_price: 75,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "8",
    name: "Broccoli",
    type: "vegetable",
    price: 70,
    mandi_price: 55,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "9",
    name: "Fresh Grapes",
    type: "fruit",
    price: 150,
    mandi_price: 120,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "10",
    name: "Onions",
    type: "vegetable",
    price: 30,
    mandi_price: 25,
    stock: 45,
    image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "11",
    name: "Fresh Mangoes",
    type: "fruit",
    price: 200,
    mandi_price: 180,
    stock: 12,
    image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "12",
    name: "Potatoes",
    type: "vegetable",
    price: 25,
    mandi_price: 20,
    stock: 60,
    image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "13",
    name: "Cauliflower",
    type: "vegetable",
    price: 30,
    mandi_price: 25,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1568584711271-61c3b99d6e6d?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "14",
    name: "Green Beans",
    type: "vegetable",
    price: 40,
    mandi_price: 35,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "15",
    name: "Cucumber",
    type: "vegetable",
    price: 22,
    mandi_price: 18,
    stock: 40,
    image_url: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "16",
    name: "Eggplant",
    type: "vegetable",
    price: 35,
    mandi_price: 30,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "17",
    name: "Fresh Lemons",
    type: "fruit",
    price: 60,
    mandi_price: 50,
    stock: 35,
    image_url: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "18",
    name: "Cabbage",
    type: "vegetable",
    price: 18,
    mandi_price: 15,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "19",
    name: "Radish",
    type: "vegetable",
    price: 15,
    mandi_price: 12,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "20",
    name: "Green Peas",
    type: "vegetable",
    price: 50,
    mandi_price: 45,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "21",
    name: "Sweet Corn",
    type: "vegetable",
    price: 25,
    mandi_price: 22,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "22",
    name: "Pumpkin",
    type: "vegetable",
    price: 20,
    mandi_price: 18,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "23",
    name: "Fresh Pineapple",
    type: "fruit",
    price: 40,
    mandi_price: 35,
    stock: 18,
    image_url: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "24",
    name: "Watermelon",
    type: "fruit",
    price: 15,
    mandi_price: 12,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "25",
    name: "Papaya",
    type: "fruit",
    price: 30,
    mandi_price: 25,
    stock: 22,
    image_url: "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "26",
    name: "Bottle Gourd",
    type: "vegetable",
    price: 25,
    mandi_price: 20,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "27",
    name: "Bitter Gourd",
    type: "vegetable",
    price: 45,
    mandi_price: 40,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=200&h=200&fit=crop",
    unit: ""
  },
  {
    id: "28",
    name: "Lady Finger",
    type: "vegetable",
    price: 40,
    mandi_price: 35,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=200&h=200&fit=crop",
    unit: ""
  },
]

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
  // In a real app, this would fetch from Supabase
  // const { data, error } = await supabase.from('products').select('*')
  // if (error) throw error
  // return data || []

  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProducts), 500)
  })
}

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  // In a real app, this would set up a real-time subscription
  // return supabase
  //   .channel('products')
  //   .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
  //   .subscribe()

  // Mock subscription
  const interval = setInterval(() => {
    callback(mockProducts)
  }, 30000) // Update every 30 seconds

  return {
    unsubscribe: () => clearInterval(interval),
  }
}

export const createOrder = async (
  orderData: Omit<Order, "id" | "timestamp" | "created_at" | "updated_at">,
): Promise<Order> => {
  // In a real app, this would create an order in Supabase
  // const { data, error } = await supabase.from('orders').insert(orderData).select().single()
  // if (error) throw error
  // return data

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
  // In a real app, this would fetch orders from Supabase
  // const { data, error } = await supabase
  //   .from('orders')
  //   .select('*')
  //   .order('created_at', { ascending: false })
  // if (error) throw error
  // return data || []

  return new Promise((resolve) => {
    setTimeout(() => resolve(mockOrders), 500)
  })
}

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  // Mock subscription for orders
  const interval = setInterval(() => {
    callback(mockOrders)
  }, 10000) // Update every 10 seconds

  return {
    unsubscribe: () => clearInterval(interval),
  }
}

export const updateOrderStatus = async (orderId: string, status: Order["status"]): Promise<void> => {
  // In a real app, this would update the order in Supabase
  // const { error } = await supabase
  //   .from('orders')
  //   .update({ status, updated_at: new Date().toISOString() })
  //   .eq('id', orderId)
  // if (error) throw error

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
