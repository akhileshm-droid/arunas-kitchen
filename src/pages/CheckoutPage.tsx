import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  })

  if (items.length === 0) {
    navigate('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (isSupabaseConfigured()) {
        const { error: dbError } = await supabase.from('orders').insert({
          customer_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          items: items.map(item => ({
            menu_item_id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total_price: total,
          status: 'pending',
        })

        if (dbError) throw dbError
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      clearCart()
      navigate('/success')
    } catch (err) {
      setError('Failed to place order. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/cart" className="p-2 hover:bg-gray-50 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="section-title mb-0">Checkout</h1>
      </div>

      <div className="premium-card p-4 mb-6">
        <h2 className="font-serif text-lg text-gray-800 mb-4">Order Summary</h2>
        <div className="space-y-2 mb-4">
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.name} x{item.quantity}
              </span>
              <span className="text-gray-800">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-gray-100 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-[#4a6741]">₹{total}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            required
            className="input-field"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            required
            className="input-field"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Your phone number"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Full Address
          </label>
          <textarea
            id="address"
            required
            rows={3}
            className="input-field resize-none"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            placeholder="Your delivery address"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Placing Order...
            </>
          ) : (
            `Place Order - ₹${total}`
          )}
        </button>
      </form>

      <div className="bg-[#4a6741]/5 border border-[#4a6741]/20 rounded-lg p-3 mb-6">
        <p className="text-center text-sm text-[#4a6741]">
          📦 Orders must be placed 1 day in advance
        </p>
      </div>
    </div>
  )
}
