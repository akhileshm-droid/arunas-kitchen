export interface MenuItem {
  id: string
  name: string
  price: number
  unit: string
  category: 'batter' | 'sambar' | 'chutney' | 'powder'
}

export interface CartItem extends MenuItem {
  quantity: number
}

export interface Product {
  id: string
  product_name: string
  product_price: number
  product_quantity: string
  category: 'Batters' | 'Curries' | 'Chutneys' | 'Powders'
  is_in_stock: boolean
  product_image_url: string | null
  created_at: string
}

export interface CartItem extends MenuItem {
  quantity: number
}

export interface Order {
  id: string
  customer_name: string
  phone: string
  address: string
  items: OrderItem[]
  total_price: number
  status: 'pending' | 'delivered'
  payment_verified: boolean
  payment_screenshot_url: string | null
  created_at: string
}

export interface OrderItem {
  menu_item_id: string
  name: string
  price: number
  quantity: number
}

export interface DailyRevenue {
  date: string
  revenue: number
}
