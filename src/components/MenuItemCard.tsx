import { Plus, Minus } from 'lucide-react'
import type { MenuItem, CartItem } from '../lib/types'
import { useCart } from '../hooks/useCart'

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart()
  const cartItem = items.find(i => i.id === item.id) as CartItem | undefined
  const quantity = cartItem?.quantity || 0

  return (
    <div className="premium-card p-4 floral-border">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-serif text-lg text-gray-800 mb-1">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.unit}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-800">₹{item.price}</p>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        {quantity === 0 ? (
          <button
            onClick={() => addItem(item)}
            className="btn-primary flex items-center gap-1 text-sm py-2 px-4"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (quantity === 1) {
                  removeItem(item.id)
                } else {
                  updateQuantity(item.id, quantity - 1)
                }
              }}
              className="w-8 h-8 rounded-full border border-[#4a6741] text-[#4a6741] flex items-center justify-center hover:bg-[#4a6741] hover:text-white transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-medium text-lg w-8 text-center">{quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, quantity + 1)}
              className="w-8 h-8 rounded-full bg-[#4a6741] text-white flex items-center justify-center hover:bg-[#6b7d57] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
        {quantity > 0 && (
          <p className="font-semibold text-[#4a6741]">
            ₹{item.price * quantity}
          </p>
        )}
      </div>
    </div>
  )
}
