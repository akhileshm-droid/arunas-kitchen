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
