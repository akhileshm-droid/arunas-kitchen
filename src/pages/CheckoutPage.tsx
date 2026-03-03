import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Upload, CheckCircle } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { supabase, uploadPaymentScreenshot, isSupabaseConfigured } from '../lib/supabase'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [error, setError] = useState('')
  const [paymentMade, setPaymentMade] = useState(false)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  })

  if (items.length === 0 && !orderSuccess) {
    navigate('/')
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshotFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      let screenshotUrl: string | null = null

      if (paymentMade && screenshotFile) {
        setUploading(true)
        screenshotUrl = await uploadPaymentScreenshot(screenshotFile)
        setUploading(false)
        
        if (!screenshotUrl && isSupabaseConfigured()) {
          throw new Error('Failed to upload payment screenshot')
        }
      }

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
          payment_verified: false,
          payment_screenshot_url: screenshotUrl,
        })

        if (dbError) throw dbError
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      setOrderSuccess(true)
      clearCart()
      navigate('/success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order. Please try again.'
      setError(message)
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

        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={paymentMade}
              onChange={e => {
                setPaymentMade(e.target.checked)
                if (!e.target.checked) {
                  setScreenshotFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }
              }}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-[#4a6741] focus:ring-[#4a6741]"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-800">Payment Made via UPI</span>
              <p className="text-sm text-gray-500 mt-1">
                UPI ID: arunaskitchen@oksbi
              </p>
            </div>
          </label>

          {paymentMade && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Screenshot
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#4a6741] transition-colors"
              >
                {screenshotFile ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">{screenshotFile.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload screenshot</span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || (paymentMade && !screenshotFile)}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting || uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {uploading ? 'Uploading...' : 'Placing Order...'}
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
