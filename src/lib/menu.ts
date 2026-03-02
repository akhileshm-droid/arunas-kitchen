import type { MenuItem } from './types'

export const MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Idli Dosa Batter', price: 200, unit: '1kg', category: 'batter' },
  { id: '2', name: 'Aapam Batter', price: 250, unit: '1kg', category: 'batter' },
  { id: '3', name: 'Adai Batter', price: 250, unit: '1kg', category: 'batter' },
  { id: '4', name: 'Ragi Batter', price: 200, unit: '1kg', category: 'batter' },
  { id: '5', name: 'Sambar', price: 250, unit: '1lt', category: 'sambar' },
  { id: '6', name: 'Coconut Chutney', price: 100, unit: '250ml', category: 'chutney' },
  { id: '7', name: 'Tomato/Onion Chutney', price: 100, unit: '250ml', category: 'chutney' },
  { id: '8', name: 'Gun Powder', price: 200, unit: '200g', category: 'powder' },
  { id: '9', name: 'Sambar Powder', price: 150, unit: '100g', category: 'powder' },
]

export const CATEGORIES = [
  { id: 'batter', name: 'Batters', icon: '🥣' },
  { id: 'sambar', name: 'Sambar', icon: '🍲' },
  { id: 'chutney', name: 'Chutneys', icon: '🥄' },
  { id: 'powder', name: 'Powders', icon: '🌶️' },
]
