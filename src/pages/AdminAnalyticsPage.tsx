import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader2, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { DailyRevenue } from '../lib/types'
import { requireAdmin } from '../components/AdminLayout'

export function AdminAnalyticsPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [dailyTotal, setDailyTotal] = useState(0)
  const [monthlyVolume, setMonthlyVolume] = useState(0)
  const [chartData, setChartData] = useState<DailyRevenue[]>([])

  useEffect(() => {
    if (!requireAdmin()) {
      navigate('/admin')
      return
    }

    fetchAnalytics()
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
    </div>
  )
}
