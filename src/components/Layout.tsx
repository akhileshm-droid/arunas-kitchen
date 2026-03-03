import { Link } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { ShoppingCart, Home, Leaf } from 'lucide-react'
import { useCart } from '../hooks/useCart'

export function Header() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-[#4a6741]" />
          <span className="font-serif text-lg text-gray-800">Aruna's Culinary Arts</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="relative p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#4a6741] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

export function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-md mx-auto pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

function BottomNav() {
  const { itemCount } = useCart()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="max-w-md mx-auto flex justify-around py-2">
        <Link
          to="/"
          className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-[#4a6741] transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Link>
        <Link
          to="/cart"
          className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
            itemCount > 0 ? 'text-[#4a6741]' : 'text-gray-600'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#4a6741] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-xs">Cart</span>
        </Link>
      </div>
    </nav>
  )
}
