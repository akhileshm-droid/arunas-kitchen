import { useState, useEffect } from 'react'
import { Loader2, Package } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Product } from '../lib/types'

const CATEGORIES = ['All', 'Batters', 'Curries', 'Chutneys', 'Powders'] as const

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('category', { ascending: true })
        .order('product_name', { ascending: true })

      if (!error && data) {
        setProducts(data)
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 500))
      setProducts([
        { id: '1', product_name: 'Idli Dosa Batter', product_price: 200, product_quantity: '1 kg', category: 'Batters', is_in_stock: true, product_image_url: null, created_at: '' },
        { id: '2', product_name: 'Aapam Batter', product_price: 250, product_quantity: '1 kg', category: 'Batters', is_in_stock: true, product_image_url: null, created_at: '' },
        { id: '3', product_name: 'Adai Batter', product_price: 250, product_quantity: '1 kg', category: 'Batters', is_in_stock: true, product_image_url: null, created_at: '' },
        { id: '4', product_name: 'Ragi Batter', product_price: 200, product_quantity: '1 kg', category: 'Batters', is_in_stock: false, product_image_url: null, created_at: '' },
        { id: '5', product_name: 'Sambar', product_price: 250, product_quantity: '1 L', category: 'Curries', is_in_stock: true, product_image_url: null, created_at: '' },
        { id: '6', product_name: 'Coconut Chutney', product_price: 100, product_quantity: '250 ml', category: 'Chutneys', is_in_stock: true, product_image_url: null, created_at: '' },
        { id: '7', product_name: 'Tomato Chutney', product_price: 100, product_quantity: '250 ml', category: 'Chutneys', is_in_stock: true, product_image_url: null, created_at: '' },
        { id: '8', product_name: 'Gun Powder', product_price: 200, product_quantity: '200 g', category: 'Powders', is_in_stock: true, product_image_url: null, created_at: '' },
        { id: '9', product_name: 'Sambar Powder', product_price: 150, product_quantity: '100 g', category: 'Powders', is_in_stock: true, product_image_url: null, created_at: '' },
      ])
    }

    setIsLoading(false)
  }

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory)

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const getPlaceholderColor = (category: string) => {
    const colors: Record<string, string> = {
      'Batters': 'bg-amber-100',
      'Curries': 'bg-orange-100',
      'Chutneys': 'bg-green-100',
      'Powders': 'bg-red-100',
    }
    return colors[category] || 'bg-gray-100'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a6741]" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-center">No products available</p>
      </div>
    )
  }

  return (
    <div className="leaf-pattern min-h-screen">
      <div className="px-4 pt-6 pb-4">
        <div className="bg-[#4a6741]/5 border border-[#4a6741]/20 rounded-lg p-3 mb-6">
          <p className="text-center text-sm text-[#4a6741] font-medium">
            📦 Kindly place orders 1 day in advance.
          </p>
        </div>

        <h1 className="section-title text-center">Our Menu</h1>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide -mx-4 px-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#4a6741] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              getInitials={getInitials}
              getPlaceholderColor={getPlaceholderColor}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

import { useCart } from '../hooks/useCart'
import { Plus, Minus } from 'lucide-react'

interface ProductCardProps {
  product: Product
  getInitials: (name: string) => string
  getPlaceholderColor: (category: string) => string
}

function ProductCard({ product, getInitials, getPlaceholderColor }: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart()
  const cartItem = items.find(i => i.id === product.id)
  const quantity = cartItem?.quantity || 0

  if (!product.is_in_stock) {
    return (
      <div className="relative premium-card overflow-hidden grayscale">
        <div className="aspect-square bg-gray-100">
          {product.product_image_url ? (
            <img
              src={product.product_image_url}
              alt={product.product_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${getPlaceholderColor(product.category)}`}>
              <span className="text-2xl font-serif text-[#4a6741]/50">
                {getInitials(product.product_name)}
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-serif font-bold text-gray-800 text-sm leading-tight">{product.product_name}</h3>
          <p className="text-xs text-gray-500 mt-1">{product.product_quantity}</p>
          <p className="font-semibold text-[#4a6741] mt-2">₹{product.product_price}</p>
        </div>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
            Out of Stock
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="premium-card overflow-hidden">
      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
        {product.product_image_url ? (
          <img
            src={product.product_image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${getPlaceholderColor(product.category)}`}>
            <span className="text-3xl font-serif text-[#4a6741]/60">
              {getInitials(product.product_name)}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-serif font-bold text-gray-800 text-sm leading-tight line-clamp-2">{product.product_name}</h3>
        <p className="text-xs text-gray-500 mt-1">{product.product_quantity}</p>
        <p className="font-semibold text-[#4a6741] mt-2">₹{product.product_price}</p>
        
        {quantity === 0 ? (
          <button
            onClick={() => addItem({
              id: product.id,
              name: product.product_name,
              price: product.product_price,
              unit: product.product_quantity,
              category: product.category.toLowerCase() as 'batter' | 'sambar' | 'chutney' | 'powder'
            })}
            className="w-full mt-3 bg-[#4a6741] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#6b7d57] transition-colors"
          >
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between mt-3 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => {
                if (quantity === 1) {
                  removeItem(product.id)
                } else {
                  updateQuantity(product.id, quantity - 1)
                }
              }}
              className="w-8 h-8 rounded flex items-center justify-center bg-white text-[#4a6741] hover:bg-[#4a6741] hover:text-white transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-medium text-sm">{quantity}</span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="w-8 h-8 rounded flex items-center justify-center bg-[#4a6741] text-white hover:bg-[#6b7d57] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
