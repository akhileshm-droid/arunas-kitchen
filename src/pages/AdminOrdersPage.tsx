import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Check, Loader2, Package, X, Eye, Copy, CheckCircle, Trash2 } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Order } from '../lib/types'
import { requireAdmin } from '../components/AdminLayout'

type DayFilter = 'today' | 'tomorrow' | 'all'
type StatusFilter = 'all' | 'payment_pending' | 'delivery_pending'

export function AdminOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [dayFilter, setDayFilter] = useState<DayFilter>('today')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!requireAdmin()) {
      navigate('/admin', { replace: true })
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
    
    try {
      if (isSupabaseConfigured()) {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
        
        const fetchPromise = supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

        if (error) {
          console.error('Fetch orders error:', error)
        } else if (data) {
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
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setIsLoading(false)
    }
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

  const deleteOrder = async (orderId: string) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('orders').delete().eq('id', orderId)
      if (error) {
        console.error('Delete error:', error)
        alert('Failed to delete order')
        return
      }
    }

    setOrders(orders.filter(order => order.id !== orderId))
    setDeleteConfirm(null)
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

  // Orders placed today are for TOMORROW's delivery
  const getDeliveryDate = (createdAt: string) => {
    const orderDate = new Date(createdAt)
    const deliveryDate = new Date(orderDate)
    deliveryDate.setDate(deliveryDate.getDate() + 1)
    return deliveryDate
  }

  const isDeliveryToday = (createdAt: string) => {
    const deliveryDate = getDeliveryDate(createdAt)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    deliveryDate.setHours(0, 0, 0, 0)
    return deliveryDate.getTime() === today.getTime()
  }

  const isDeliveryTomorrow = (createdAt: string) => {
    const deliveryDate = getDeliveryDate(createdAt)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    deliveryDate.setHours(0, 0, 0, 0)
    return deliveryDate.getTime() === tomorrow.getTime()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a6741]" />
      </div>
    )
  }

  // Count orders by delivery date (not order date)
  const todayDeliveries = orders.filter(o => isDeliveryToday(o.created_at) && o.status !== 'delivered')
  const tomorrowDeliveries = orders.filter(o => isDeliveryTomorrow(o.created_at) && o.status !== 'delivered')
  const allPending = orders.filter(o => o.status !== 'delivered')

  const filteredOrders = orders.filter(order => {
    // Day filter (based on delivery date, not order date)
    if (dayFilter === 'today') return isDeliveryToday(order.created_at)
    if (dayFilter === 'tomorrow') return isDeliveryTomorrow(order.created_at)
    return true
  }).filter(order => {
    // Status filter
    if (statusFilter === 'payment_pending') return !order.payment_verified
    if (statusFilter === 'delivery_pending') return order.status !== 'delivered'
    return true
  })

  const counts = {
    today: todayDeliveries.length,
    tomorrow: tomorrowDeliveries.length,
    all: allPending.length,
    paymentPending: allPending.filter(o => !o.payment_verified).length,
    deliveryPending: allPending.filter(o => o.status !== 'delivered').length
  }

  return (
    <div className="space-y-3">
      <h1 className="font-serif text-xl text-gray-800">Orders</h1>

      <div className="flex gap-2">
        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-2 text-center">
          <p className="text-base font-bold text-green-700">{counts.today}</p>
          <p className="text-xs text-green-600">Today</p>
        </div>
        <div className="flex-1 bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
          <p className="text-base font-bold text-orange-700">{counts.tomorrow}</p>
          <p className="text-xs text-orange-600">Tomorrow</p>
        </div>
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
          <p className="text-base font-bold text-gray-600">{counts.all}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        <button
          onClick={() => setDayFilter('today')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
            dayFilter === 'today' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          📦 Today ({counts.today})
        </button>
        <button
          onClick={() => setDayFilter('tomorrow')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
            dayFilter === 'tomorrow' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'
          }`}
        >
          📅 Tomorrow ({counts.tomorrow})
        </button>
        <button
          onClick={() => setDayFilter('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
            dayFilter === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          All
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
            statusFilter === 'all' ? 'bg-[#4a6741] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          All Status
        </button>
        <button
          onClick={() => setStatusFilter('payment_pending')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
            statusFilter === 'payment_pending' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'
          }`}
        >
          💰 Payment Pending ({counts.paymentPending})
        </button>
        <button
          onClick={() => setStatusFilter('delivery_pending')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
            statusFilter === 'delivery_pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-600'
          }`}
        >
          🚚 Delivery Pending ({counts.deliveryPending})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No orders in this category</p>
        </div>
      ) : (
        filteredOrders.map(order => {
          const paymentStatus = getPaymentStatus(order)
          const deliveryStatus = getDeliveryStatus(order)
          const isTodayDelivery = isDeliveryToday(order.created_at)
          const isTomorrowDelivery = isDeliveryTomorrow(order.created_at)

          return (
            <div key={order.id} className="premium-card p-3">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${paymentStatus.className}`}>
                  {paymentStatus.label}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${deliveryStatus.className}`}>
                  {deliveryStatus.label}
                </span>
                {isTodayDelivery && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                    Today
                  </span>
                )}
                {isTomorrowDelivery && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700">
                    Tomorrow
                  </span>
                )}
              </div>

              <div className="mb-2">
                <h3 className="font-semibold text-gray-800">{order.customer_name}</h3>
                <p className="text-xs text-gray-500">{formatDate(order.created_at)} • {formatTime(order.created_at)}</p>
              </div>

              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 flex-1 break-words">{order.address}</p>
                <button onClick={() => copyAddress(order.address, order.id)} className="p-0.5 hover:bg-gray-100 rounded flex-shrink-0">
                  {copiedId === order.id ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              </div>

              <div className="border-t border-gray-100 pt-2 mb-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-gray-500">{item.name} × {item.quantity}</span>
                    <span className="text-gray-700">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-800">Total</span>
                <span className="font-bold text-[#4a6741]">₹{order.total_price}</span>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {!order.payment_verified && (
                  <button onClick={() => verifyPayment(order.id)} disabled={updatingId === order.id} className="flex-1 min-w-[100px] text-xs py-1.5 px-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 flex items-center justify-center gap-1">
                    {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Verify Pay
                  </button>
                )}
                
                {order.payment_screenshot_url && (
                  <button onClick={() => setSelectedOrder(order)} className="flex-1 min-w-[100px] text-xs py-1.5 px-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3" />
                    Screenshot
                  </button>
                )}
                
                {order.status === 'pending' && (
                  <button onClick={() => markAsDelivered(order.id)} disabled={updatingId === order.id} className="flex-1 min-w-[100px] text-xs py-1.5 px-2 bg-[#4a6741] text-white rounded hover:bg-[#6b7d57] flex items-center justify-center gap-1">
                    {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Delivered
                  </button>
                )}
                
                <button 
                  onClick={() => setDeleteConfirm(order.id)} 
                  className="text-xs py-1.5 px-2 text-gray-400 hover:text-red-500 flex items-center justify-center gap-1"
                  title="Delete order"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          )
        })
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-semibold text-sm">Payment Screenshot</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-600 mb-2">{selectedOrder.customer_name} • ₹{selectedOrder.total_price}</p>
              <img src={selectedOrder.payment_screenshot_url || ''} alt="Payment Screenshot" className="w-full rounded" />
              <div className="mt-3 flex gap-2">
                {!selectedOrder.payment_verified && (
                  <button onClick={() => { verifyPayment(selectedOrder.id); setSelectedOrder(null) }} className="flex-1 text-xs py-2 bg-[#4a6741] text-white rounded">
                    Verify Payment
                  </button>
                )}
                <button onClick={() => setSelectedOrder(null)} className="flex-1 text-xs py-2 bg-gray-100 text-gray-600 rounded">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h3 className="font-semibold text-lg mb-2">Delete Order?</h3>
            <p className="text-gray-600 mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteOrder(deleteConfirm)}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-md font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
