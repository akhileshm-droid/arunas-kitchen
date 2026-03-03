import { Link } from 'react-router-dom'
import { CheckCircle, Phone, ShoppingBag, Truck } from 'lucide-react'

export function SuccessPage() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const tomorrowDate = tomorrow.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center w-full max-w-sm">
        <div className="w-20 h-20 bg-[#4a6741]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#4a6741]" />
        </div>
        
        <h1 className="font-serif text-2xl text-gray-800 mb-2">Order Placed!</h1>
        
        <div className="bg-[#4a6741]/5 border border-[#4a6741]/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-[#4a6741] mb-2">
            <Truck className="w-5 h-5" />
            <span className="font-medium">Expected Delivery</span>
          </div>
          <p className="text-xl font-bold text-[#4a6741]">{tomorrowDate}</p>
          <p className="text-sm text-gray-500 mt-1">(Tomorrow)</p>
        </div>

        <p className="text-gray-600 mb-6">
          Thank you for your order! We'll deliver it to your address tomorrow.
        </p>

        <div className="premium-card p-4 mb-6">
          <p className="text-sm text-gray-500 mb-2">For any queries, contact:</p>
          <a
            href="tel:+9181304444776"
            className="flex items-center justify-center gap-2 text-[#4a6741] font-medium"
          >
            <Phone className="w-4 h-4" />
            +91 81304444776
          </a>
        </div>

        <Link
          to="/"
          className="btn-primary inline-flex items-center justify-center gap-2 w-full py-3"
        >
          <ShoppingBag className="w-5 h-5" />
          Place Another Order
        </Link>
      </div>
    </div>
  )
}
