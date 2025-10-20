// Mock data for development and testing

export interface Product {
  id: string
  name: string
  type: "fruit" | "vegetable"
  price: number

  image_url?: string
  mandi_price?: number
  created_at?: string
  updated_at?: string
}

export interface Order {
  id: string
  user_id: string
  location: string
  items: OrderItem[]
  total_cost: number
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"
  timestamp: string
  order_type?: "delivery" | "takeaway"
  payment_method?: "cod" | "online"
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
  unit: string
}

// Mock products data with 25+ items
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Fresh Tomatoes",
    type: "vegetable",
    price: 40,
    mandi_price: 35,
  
    image_url: "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg",
  },
  {
    id: "2",
    name: "Green Spinach",
    type: "vegetable",
    price: 25,
    mandi_price: 20,
   
    image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    name: "Fresh Apples",
    type: "fruit",
    price: 120,
    mandi_price: 100,

    image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop",
  },
  {
    id: "4",
    name: "Bananas",
    type: "fruit",
    price: 60,
    mandi_price: 45,

    image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop",
  },
  {
    id: "5",
    name: "Carrots",
    type: "vegetable",
    price: 35,
    mandi_price: 28,

    image_url: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=200&h=200&fit=crop",
  },
  {
    id: "6",
    name: "Bell Peppers",
    type: "vegetable",
    price: 80,
    mandi_price: 65,

    image_url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop",
  },
  {
    id: "7",
    name: "Fresh Oranges",
    type: "fruit",
    price: 90,
    mandi_price: 75,
 
    image_url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=200&h=200&fit=crop",
  },
  {
    id: "8",
    name: "Broccoli",
    type: "vegetable",
    price: 70,
    mandi_price: 55,

    image_url: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=200&h=200&fit=crop",
  },
  {
    id: "9",
    name: "Fresh Grapes",
    type: "fruit",
    price: 150,
    mandi_price: 120,

    image_url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=200&h=200&fit=crop",
  },
  {
    id: "10",
    name: "Onions",
    type: "vegetable",
    price: 30,
    mandi_price: 25,
 
    image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop",
  },
  {
    id: "11",
    name: "Fresh Mangoes",
    type: "fruit",
    price: 200,
    mandi_price: 180,
    
    image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop",
  },
  {
    id: "12",
    name: "Potatoes",
    type: "vegetable",
    price: 25,
    mandi_price: 20,

    image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop",
  },
  {
    id: "13",
    name: "Cauliflower",
    type: "vegetable",
    price: 30,
    mandi_price: 25,

    image_url: "https://images.unsplash.com/photo-1568584711271-61c3b99d6e6d?w=200&h=200&fit=crop",
  },
  {
    id: "14",
    name: "Green Beans",
    type: "vegetable",
    price: 40,
    mandi_price: 35,

    image_url: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=200&h=200&fit=crop",
  },
  {
    id: "15",
    name: "Cucumber",
    type: "vegetable",
    price: 22,
    mandi_price: 18,
  
    image_url: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=200&h=200&fit=crop",
  },
  {
    id: "16",
    name: "Eggplant",
    type: "vegetable",
    price: 35,
    mandi_price: 30,
   
    image_url: "https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=200&h=200&fit=crop",
  },
  {
    id: "17",
    name: "Fresh Lemons",
    type: "fruit",
    price: 60,
    mandi_price: 50,

    image_url: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=200&h=200&fit=crop",
  },
  {
    id: "18",
    name: "Cabbage",
    type: "vegetable",
    price: 18,
    mandi_price: 15,

    image_url: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=200&h=200&fit=crop",
  },
  {
    id: "19",
    name: "Radish",
    type: "vegetable",
    price: 15,
    mandi_price: 12,

    image_url: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200&h=200&fit=crop",
  },
  {
    id: "20",
    name: "Green Peas",
    type: "vegetable",
    price: 50,
    mandi_price: 45,

    image_url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=200&h=200&fit=crop",
  },
  {
    id: "21",
    name: "Sweet Corn",
    type: "vegetable",
    price: 25,
    mandi_price: 22,

    image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&h=200&fit=crop",
  },
  {
    id: "22",
    name: "Pumpkin",
    type: "vegetable",
    price: 20,
    mandi_price: 18,

    image_url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=200&h=200&fit=crop",
  },
  {
    id: "23",
    name: "Fresh Pineapple",
    type: "fruit",
    price: 40,
    mandi_price: 35,
   image_url: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=200&h=200&fit=crop",
  },
  {
    id: "24",
    name: "Watermelon",
    type: "fruit",
    price: 15,
    mandi_price: 12,

    image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop",
  },
  {
    id: "25",
    name: "Papaya",
    type: "fruit",
    price: 30,
    mandi_price: 25,

    image_url: "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=200&h=200&fit=crop",
  },
  {
    id: "26",
    name: "Bottle Gourd",
    type: "vegetable",
    price: 25,
    mandi_price: 20,

    image_url: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=200&h=200&fit=crop",
  },
  {
    id: "27",
    name: "Bitter Gourd",
    type: "vegetable",
    price: 45,
    mandi_price: 40,

    image_url: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=200&h=200&fit=crop",
  },
  {
    id: "28",
    name: "Lady Finger",
    type: "vegetable",
    price: 40,
    mandi_price: 35,
    image_url: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=200&h=200&fit=crop",
  },
]

// Mock orders data
export const mockOrders: Order[] = [
  {
    id: "order_1",
    user_id: "user_1",
    location: "123 Main St, City",
    items: [
      {
        product_id: "1",
        product_name: "Fresh Tomatoes",
        quantity: 2,
        price: 40,
        unit: "kg",
      },
    ],
    total_cost: 80,
    status: "pending",
    timestamp: new Date().toISOString(),
    order_type: "delivery",
    payment_method: "cod",
  },
]

// Simple in-memory storage for development
class MockDatabase {
  private products: Product[] = [...mockProducts]
  private orders: Order[] = [...mockOrders]

  // Product operations
  async getProducts(): Promise<Product[]> {
    return [...this.products]
  }

  async addProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.products.push(newProduct)
    return newProduct
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) return null

    this.products[index] = {
      ...this.products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    return this.products[index]
  }

  async deleteProduct(id: string): Promise<boolean> {
    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) return false

    this.products.splice(index, 1)
    return true
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return [...this.orders].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  
    // Update product stock
    


}
export const mockDB = new MockDatabase();
