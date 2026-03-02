import { Link } from 'react-router-dom'
import { CheckCircle, Phone, Home } from 'lucide-react'

export function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-[#4a6741]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#4a6741]" />
        </div>
        
        <h1 className="font-serif text-2xl text-gray-800 mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully.
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
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
