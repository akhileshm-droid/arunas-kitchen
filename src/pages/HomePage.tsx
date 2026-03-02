import { useState } from 'react'
import { MENU_ITEMS, CATEGORIES } from '../lib/menu'
import { MenuItemCard } from '../components/MenuItemCard'

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredItems = selectedCategory
    ? MENU_ITEMS.filter(item => item.category === selectedCategory)
    : MENU_ITEMS

  return (
    <div className="leaf-pattern min-h-screen">
      <div className="px-4 pt-6 pb-4">
        <div className="bg-[#4a6741]/5 border border-[#4a6741]/20 rounded-lg p-3 mb-6">
          <p className="text-center text-sm text-[#4a6741] font-medium">
            📦 Kindly place orders 1 day in advance.
          </p>
        </div>

        <h1 className="section-title text-center">Our Menu</h1>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-[#4a6741] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#4a6741] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredItems.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
