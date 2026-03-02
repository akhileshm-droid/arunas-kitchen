import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './hooks/useCart'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { SuccessPage } from './pages/SuccessPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminLayout } from './components/AdminLayout'
import { AdminOrdersPage } from './pages/AdminOrdersPage'
import { AdminCatalogPage } from './pages/AdminCatalogPage'
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage'

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="cart" element={<CartPage />} />
          </Route>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="catalog" element={<AdminCatalogPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
