import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, Check, Loader2, Package, X, Eye, Copy, CheckCircle, Clock, Calendar } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Order } from '../lib/types'
import { requireAdmin } from '../components/AdminLayout'

type FilterType = 'today' | 'tomorrow' | 'all'

export function AdminOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('today')

  useEffect(() => {
    if (!requireAdmin()) {
      navigate('/admin')
      return
    }

    fetchOrders()

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          fetchOrders()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [navigate])

  const fetchOrders = async () => {
    setIsLoading(true)
    
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setOrders(data)
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 500))
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      setOrders([
        { id: '1', customer_name: 'Demo User 1', phone: '9876543210', address: '123 Demo Street, City', items: [{ menu_item_id: '1', name: 'Idli Dosa Batter', price: 200, quantity: 2 }], total_price: 400, status: 'pending', payment_verified: true, payment_screenshot_url: null, created_at: yesterday.toISOString() },
        { id: '2', customer_name: 'Demo User 2', phone: '9876543211', address: '456 Test Ave, City', items: [{ menu_item_id: '2', name: 'Sambar', price: 250, quantity: 1 }], total_price: 250, status: 'pending', payment_verified: true, payment_screenshot_url: 'https://example.com/img.jpg', created_at: today.toISOString() },
        { id: '3', customer_name: 'Demo User 3', phone: '9876543212', address: '789 Sample Rd, City', items: [{ menu_item_id: '3', name: 'Aapam Batter', price: 250, quantity: 1 }], total_price: 250, status: 'pending', payment_verified: false, payment_screenshot_url: null, created_at: today.toISOString() },
      ])
    }

    setIsLoading(false)
  }

  const markAsDelivered = async (orderId: string) => {
    setUpdatingId(orderId)

    if (isSupabaseConfigured()) {
      await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId)
    }

    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: 'delivered' } : order
    ))

    setUpdatingId(null)
  }

  const verifyPayment = async (orderId: string) => {
    setUpdatingId(orderId)

    if (isSupabaseConfigured()) {
      await supabase.from('orders').update({ payment_verified: true }).eq('id', orderId)
    }

    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, payment_verified: true } : order
    ))

    setUpdatingId(null)
  }

  const copyAddress = async (address: string, orderId: string) => {
    await navigator.clipboard.writeText(address)
    setCopiedId(orderId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const getPaymentStatus = (order: Order) => {
    if (order.payment_verified) return { label: 'Paid', className: 'bg-green-100 text-green-700' }
    if (order.payment_screenshot_url) return { label: 'Awaiting Verification', className: 'bg-blue-100 text-blue-700' }
    return { label: 'Payment Pending', className: 'bg-orange-100 text-orange-700' }
  }

  const getDeliveryStatus = (order: Order) => {
    if (order.status === 'delivered') return { label: 'Delivered', className: 'bg-green-100 text-green-700' }
    return { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' }
  }

  const getOrderDate = (dateStr: string) => {
    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)
    return date
  }

  const isToday = (dateStr: string) => {
    const orderDate = getOrderDate(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return orderDate.getTime() === today.getTime()
  }

  const isTomorrow = (dateStr: string) => {
    const orderDate = getOrderDate(dateStr)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return orderDate.getTime() === tomorrow.getTime()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a6741]" />
      </div>
    )
  }

  const todayOrders = orders.filter(o => isToday(o.created_at) && o.status !== 'delivered')
  const tomorrowOrders = orders.filter(o => isTomorrow(o.created_at) && o.status !== 'delivered')
  const allPendingOrders = orders.filter(o => o.status !== 'delivered')

  const filteredOrders = orders.filter(order => {
    if (filter === 'today') return isToday(order.created_at)
    if (filter === 'tomorrow') return isTomorrow(order.created_at)
    return true
  })

  const getFilterCounts = () => {
    return {
      today: todayOrders.length,
      tomorrow: tomorrowOrders.length,
      all: allPendingOrders.length
    }
  }

  const counts = getFilterCounts()
  const todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
  const tomorrowDate = new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-xl text-gray-800">Orders</h1>

      <div className="bg-gradient-to-r from-[#4a6741] to-[#6b7d57] rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">Today's Deliveries</span>
        </div>
        <p className="text-3xl font-bold">{counts.today}</p>
        <p className="text-sm text-white/80 mt-1">{todayDate}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-700">Tomorrow</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{counts.tomorrow}</p>
          <p className="text-xs text-orange-600/70">{tomorrowDate}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">All Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-600">{counts.all}</p>
          <p className="text-xs text-gray-500">Not delivered</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        <button
          onClick={() => setFilter('today')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
            filter === 'today' ? 'bg-[#4a6741] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          📦 Today ({counts.today})
        </button>
        <button
          onClick={() => setFilter('tomorrow')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
            filter === 'tomorrow' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'
          }`}
        >
          📅 Tomorrow ({counts.tomorrow})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
            filter === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          All Orders
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No orders in this category</p>
        </div>
      ) : (
        filteredOrders.map(order => {
          const paymentStatus = getPaymentStatus(order)
          const deliveryStatus = getDeliveryStatus(order)
          const isTodayOrder = isToday(order.created_at)
          const isTomorrowOrder = isTomorrow(order.created_at)

          return (
            <div key={order.id} className="premium-card p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentStatus.className}`}>
                  💰 {paymentStatus.label}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${deliveryStatus.className}`}>
                  🚚 {deliveryStatus.label}
                </span>
                {isTodayOrder && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-[#4a6741]/10 text-[#4a6741]">
                    Today
                  </span>
                )}
                {isTomorrowOrder && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-700">
                    Tomorrow
                  </span>
                )}
              </div>

              <div className="mb-3">
                <h3 className="font-semibold text-gray-800 text-lg">{order.customer_name}</h3>
                <p className="text-sm text-gray-500">{formatDate(order.created_at)} • {formatTime(order.created_at)}</p>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 flex-1 break-words">{order.address}</p>
                  <button onClick={() => copyAddress(order.address, order.id)} className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
                    {copiedId === order.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {order.phone}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">{item.name} × {item.quantity}</span>
                    <span className="text-gray-800">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-xl text-[#4a6741]">₹{order.total_price.toLocaleString()}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {!order.payment_verified && (
                  <button onClick={() => verifyPayment(order.id)} disabled={updatingId === order.id} className="flex-1 min-w-[140px] btn-secondary flex items-center justify-center gap-1.5 text-sm py-2">
                    {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Verify Payment
                  </button>
                )}
                
                {order.payment_screenshot_url && (
                  <button onClick={() => setSelectedOrder(order)} className="flex-1 min-w-[140px] btn-secondary flex items-center justify-center gap-1.5 text-sm py-2">
                    <Eye className="w-4 h-4" />
                    View Screenshot
                  </button>
                )}
                
                {order.status === 'pending' && (
                  <button onClick={() => markAsDelivered(order.id)} disabled={updatingId === order.id} className="flex-1 min-w-[140px] btn-primary flex items-center justify-center gap-1.5 text-sm py-2">
                    {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          )
        })
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Payment Screenshot</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-2">{selectedOrder.customer_name} • ₹{selectedOrder.total_price}</p>
              <img src={selectedOrder.payment_screenshot_url || ''} alt="Payment Screenshot" className="w-full rounded-lg" />
              <div className="mt-4 flex gap-2 flex-wrap">
                {!selectedOrder.payment_verified && (
                  <button onClick={() => { verifyPayment(selectedOrder.id); setSelectedOrder(null) }} className="flex-1 min-w-[140px] btn-primary">
                    Verify Payment
                  </button>
                )}
                <button onClick={() => setSelectedOrder(null)} className="flex-1 min-w-[140px] btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
