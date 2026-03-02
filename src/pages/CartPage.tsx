import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '../hooks/useCart'

export function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="font-serif text-xl text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-center mb-6">
          Add some delicious South Indian items to your cart
        </p>
        <Link to="/" className="btn-primary">
          Browse Menu
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/" className="p-2 hover:bg-gray-50 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="section-title mb-0">Your Cart</h1>
      </div>

      <div className="space-y-4 mb-6">
        {items.map(item => (
          <div key={item.id} className="premium-card p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-serif text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.unit}</p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (item.quantity === 1) {
                      removeItem(item.id)
                    } else {
                      updateQuantity(item.id, item.quantity - 1)
                    }
                  }}
                  className="w-8 h-8 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center hover:border-[#4a6741] hover:text-[#4a6741] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-medium w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-[#4a6741] text-white flex items-center justify-center hover:bg-[#6b7d57] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="font-semibold text-gray-800">
                ₹{item.price * item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="premium-card p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-800">₹{total}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="font-semibold text-gray-800">Total</span>
          <span className="font-bold text-xl text-[#4a6741]">₹{total}</span>
        </div>
      </div>

      <Link
        to="/checkout"
        className="btn-primary w-full text-center block mb-6"
      >
        Proceed to Checkout
      </Link>
    </div>
  )
}
