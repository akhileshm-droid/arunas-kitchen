import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader2, TrendingUp, Calendar, DollarSign, Package, Clock } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { DailyRevenue, OrderItem } from '../lib/types'
import { requireAdmin } from '../components/AdminLayout'

interface PopularItem {
  name: string
  quantity: number
}

export function AdminAnalyticsPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [dailyTotal, setDailyTotal] = useState(0)
  const [monthlyVolume, setMonthlyVolume] = useState(0)
  const [confirmedRevenue, setConfirmedRevenue] = useState(0)
  const [pendingRevenue, setPendingRevenue] = useState(0)
  const [popularItems, setPopularItems] = useState<PopularItem[]>([])
  const [chartData, setChartData] = useState<DailyRevenue[]>([])

  useEffect(() => {
    if (!requireAdmin()) {
      navigate('/admin')
      return
    }

    fetchAnalytics()

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('analytics')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          fetchAnalytics()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [navigate])

  const fetchAnalytics = async () => {
    setIsLoading(true)

    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })

    if (isSupabaseConfigured()) {
      const { data: orders } = await supabase
        .from('orders')
        .select('*')

      if (orders) {
        const todayStr = today.toISOString().split('T')[0]
        const todayOrders = orders.filter(
          o => o.created_at.startsWith(todayStr)
        )
        setDailyTotal(todayOrders.reduce((sum, o) => sum + (o.total_price || 0), 0))

        const monthOrders = orders.filter(
          o => new Date(o.created_at) >= startOfMonth
        )
        setMonthlyVolume(monthOrders.length)

        const confirmed = monthOrders
          .filter(o => o.payment_verified)
          .reduce((sum, o) => sum + (o.total_price || 0), 0)
        const pending = monthOrders
          .filter(o => !o.payment_verified)
          .reduce((sum, o) => sum + (o.total_price || 0), 0)
        setConfirmedRevenue(confirmed)
        setPendingRevenue(pending)

        const itemCounts: Record<string, number> = {}
        monthOrders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: OrderItem) => {
              itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity
            })
          }
        })
        const sortedItems = Object.entries(itemCounts)
          .map(([name, quantity]) => ({ name, quantity }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5)
        setPopularItems(sortedItems)

        const dailyRev: Record<string, number> = {}
        last7Days.forEach(day => {
          dailyRev[day] = 0
        })
        orders.forEach(order => {
          const day = order.created_at.split('T')[0]
          if (dailyRev[day] !== undefined) {
            dailyRev[day] += order.total_price || 0
          }
        })

        setChartData(last7Days.map(day => ({
          date: new Date(day).toLocaleDateString('en-IN', { weekday: 'short' }),
          revenue: dailyRev[day],
        })))
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setDailyTotal(1250)
      setMonthlyVolume(45)
      setConfirmedRevenue(8500)
      setPendingRevenue(3200)
      setPopularItems([
        { name: 'Idli Dosa Batter', quantity: 28 },
        { name: 'Sambar', quantity: 22 },
        { name: 'Aapam Batter', quantity: 18 },
        { name: 'Coconut Chutney', quantity: 15 },
        { name: 'Gun Powder', quantity: 12 },
      ])
      
      setChartData(last7Days.map((day) => ({
        date: new Date(day).toLocaleDateString('en-IN', { weekday: 'short' }),
        revenue: 800 + Math.random() * 1200,
      })))
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a6741]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-xl text-gray-800">Analytics</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-[#4a6741]" />
            <span className="text-sm text-gray-500">Today's Total</span>
          </div>
          <p className="text-2xl font-bold text-[#4a6741]">₹{dailyTotal.toLocaleString()}</p>
        </div>

        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[#4a6741]" />
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <p className="text-2xl font-bold text-[#4a6741]">{monthlyVolume} orders</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-500">Confirmed Revenue</span>
          </div>
          <p className="text-2xl font-bold text-green-600">₹{confirmedRevenue.toLocaleString()}</p>
        </div>

        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-gray-500">Pending Revenue</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">₹{pendingRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="premium-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#4a6741]" />
          <h2 className="font-semibold text-gray-800">Daily Revenue (Last 7 Days)</h2>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={value => `₹${value}`}
              />
              <Tooltip
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <Bar
                dataKey="revenue"
                fill="#4a6741"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="premium-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-[#4a6741]" />
          <h2 className="font-semibold text-gray-800">Most Popular Items (This Month)</h2>
        </div>
        
        <div className="space-y-3">
          {popularItems.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#4a6741]/10 text-[#4a6741] text-sm flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <span className="text-gray-800">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-600">{item.quantity} sold</span>
            </div>
          ))}
          {popularItems.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No orders this month</p>
          )}
        </div>
      </div>
    </div>
  )
}
