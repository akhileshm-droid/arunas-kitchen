import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, LogOut, Leaf, Package } from 'lucide-react'

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    navigate('/admin')
  }

  const navItems = [
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/catalog', label: 'Catalog', icon: Package },
    { path: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#4a6741]" />
            <span className="font-serif text-lg text-gray-800">Aruna's Kitchen</span>
            <span className="text-xs bg-[#4a6741]/10 text-[#4a6741] px-2 py-0.5 rounded">
              Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-6">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#4a6741] text-[#4a6741]'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export function requireAdmin() {
  return sessionStorage.getItem('admin_auth') === 'true'
}
