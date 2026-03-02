import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, Clock, Check, Loader2, Package } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Order } from '../lib/types'
import { requireAdmin } from '../components/AdminLayout'

export function AdminOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!requireAdmin()) {
      navigate('/admin')
      return
    }

    fetchOrders()
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
      setOrders([
        {
          id: '1',
          customer_name: 'Demo User',
          phone: '9876543210',
          address: '123 Demo Street, Demo City',
          items: [
            { menu_item_id: '1', name: 'Idli Dosa Batter', price: 200, quantity: 2 },
            { menu_item_id: '5', name: 'Sambar', price: 250, quantity: 1 },
          ],
          total_price: 650,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
    }

    setIsLoading(false)
  }

  const markAsDelivered = async (orderId: string) => {
    setUpdatingId(orderId)

    if (isSupabaseConfigured()) {
      await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId)
    }

    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: 'delivered' } : order
    ))

    setUpdatingId(null)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a6741]" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No orders yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-xl text-gray-800">Orders</h1>

      {orders.map(order => (
        <div key={order.id} className="premium-card p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-800">{order.customer_name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(order.created_at)} at {formatTime(order.created_at)}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                order.status === 'delivered'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {order.status === 'delivered' ? 'Delivered' : 'Pending'}
            </span>
          </div>

          <div className="space-y-2 mb-3">
            <p className="text-sm text-gray-600 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              {order.address}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              {order.phone}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-3 mb-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} x{item.quantity}
                </span>
                <span className="text-gray-800">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="font-bold text-lg text-[#4a6741]">₹{order.total_price}</span>
          </div>

          {order.status === 'pending' && (
            <button
              onClick={() => markAsDelivered(order.id)}
              disabled={updatingId === order.id}
              className="mt-3 w-full btn-secondary flex items-center justify-center gap-2"
            >
              {updatingId === order.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Mark as Delivered
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
