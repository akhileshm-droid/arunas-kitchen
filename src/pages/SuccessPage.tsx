import { Link } from 'react-router-dom'
import { CheckCircle, Phone, ShoppingBag } from 'lucide-react'

export function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center w-full max-w-sm">
        <div className="w-20 h-20 bg-[#4a6741]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#4a6741]" />
        </div>
        
        <h1 className="font-serif text-2xl text-gray-800 mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully. We'll deliver it soon!
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
