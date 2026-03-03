import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Loader2, Package, X, Image, Check } from 'lucide-react'
import { supabase, uploadProductImage, deleteProductImage, isSupabaseConfigured } from '../lib/supabase'
import type { Product } from '../lib/types'
import { requireAdmin } from '../components/AdminLayout'

const CATEGORIES = ['Batters', 'Curries', 'Chutneys', 'Powders'] as const

interface ProductFormData {
  product_name: string
  product_price: string
  product_quantity: string
  category: typeof CATEGORIES[number]
  product_image_url: string | null
}

const initialFormData: ProductFormData = {
  product_name: '',
  product_price: '',
  product_quantity: '',
  category: 'Batters',
  product_image_url: null,
}

export function AdminCatalogPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!requireAdmin()) {
      navigate('/admin')
      return
    }

    fetchProducts()
  }, [navigate])

  const fetchProducts = async () => {
    setIsLoading(true)
    
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('category', { ascending: true })
        .order('product_name', { ascending: true })

      if (error) {
        console.error('Fetch error:', error)
        alert(`Failed to fetch products: ${error.message}`)
      }
      
      if (data) {
        setProducts(data)
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 500))
      setProducts([
        { id: '1', product_name: 'Idli Dosa Batter', product_price: 200, product_quantity: '1 kg', category: 'Batters', is_in_stock: true, product_image_url: null, created_at: '' },
        { id: '2', product_name: 'Sambar', product_price: 250, product_quantity: '1 L', category: 'Curries', is_in_stock: true, product_image_url: null, created_at: '' },
      ])
    }

    setIsLoading(false)
  }

  const toggleStock = async (productId: string, currentStatus: boolean) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, is_in_stock: !currentStatus } : p
    ))

    if (isSupabaseConfigured()) {
      await supabase
        .from('catalog')
        .update({ is_in_stock: !currentStatus })
        .eq('id', productId)
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData(initialFormData)
    setImageFile(null)
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      product_name: product.product_name,
      product_price: product.product_price.toString(),
      product_quantity: product.product_quantity,
      category: product.category,
      product_image_url: product.product_image_url,
    })
    setImageFile(null)
    setShowModal(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, product_image_url: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let imageUrl = formData.product_image_url

      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile)
      }

      const productData = {
        product_name: formData.product_name,
        product_price: parseInt(formData.product_price),
        product_quantity: formData.product_quantity,
        category: formData.category,
        product_image_url: imageUrl,
        is_in_stock: true,
      }

      if (editingProduct) {
        if (isSupabaseConfigured()) {
          const { error: updateError } = await supabase
            .from('catalog')
            .update(productData)
            .eq('id', editingProduct.id)
          
          if (updateError) {
            console.error('Update error:', updateError)
            alert(`Failed to update: ${updateError.message}`)
            setIsSaving(false)
            return
          }
        }
        setProducts(products.map(p => 
          p.id === editingProduct.id ? { ...p, ...productData } : p
        ))
      } else {
        if (isSupabaseConfigured()) {
          const { data, error: insertError } = await supabase
            .from('catalog')
            .insert(productData)
            .select()
            .single()
          
          if (insertError) {
            console.error('Insert error:', insertError)
            alert(`Failed to add product: ${insertError.message}`)
            setIsSaving(false)
            return
          }
          
          if (data) {
            setProducts([...products, data].sort((a, b) => 
              a.category.localeCompare(b.category) || a.product_name.localeCompare(b.product_name)
            ))
          }
        } else {
          const newProduct = { ...productData, id: Date.now().toString(), is_in_stock: true, created_at: '' }
          setProducts([...products, newProduct].sort((a, b) => 
            a.category.localeCompare(b.category) || a.product_name.localeCompare(b.product_name)
          ))
        }
      }

      setShowModal(false)
      setFormData(initialFormData)
      setImageFile(null)
    } catch (error: any) {
      console.error('Error saving product:', error)
      const message = error?.message || 'Failed to save product'
      alert(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    try {
      if (product.product_image_url && isSupabaseConfigured()) {
        await deleteProductImage(product.product_image_url)
      }

      if (isSupabaseConfigured()) {
        const { error: deleteError } = await supabase.from('catalog').delete().eq('id', productId)
        
        if (deleteError) {
          console.error('Delete error:', deleteError)
          alert(`Failed to delete: ${deleteError.message}`)
          return
        }
      }

      setProducts(products.filter(p => p.id !== productId))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete product')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a6741]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-xl text-gray-800">Catalog</h1>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map(product => (
            <div key={product.id} className="premium-card p-4 flex gap-4">
              <div className="flex-shrink-0">
                {product.product_image_url ? (
                  <img src={product.product_image_url} alt={product.product_name} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-[#4a6741]/10 flex items-center justify-center text-[#4a6741] font-medium text-lg">
                    {product.product_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">{product.product_name}</h3>
                    <p className="text-sm text-gray-500">{product.product_quantity}</p>
                    <p className="text-sm font-medium text-gray-800 mt-1">₹{product.product_price}</p>
                  </div>
                  <button
                    onClick={() => toggleStock(product.id, product.is_in_stock)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                      product.is_in_stock ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      product.is_in_stock ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => openEditModal(product)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-[#4a6741] hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.product_name}
                  onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="e.g., Idli Dosa Batter"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    className="input-field"
                    value={formData.product_price}
                    onChange={e => setFormData({ ...formData, product_price: e.target.value })}
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.product_quantity}
                    onChange={e => setFormData({ ...formData, product_quantity: e.target.value })}
                    placeholder="1 kg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  required
                  className="input-field"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as typeof CATEGORIES[number] })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="product-image"
                />
                <label
                  htmlFor="product-image"
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#4a6741] transition-colors"
                >
                  {formData.product_image_url ? (
                    <div className="relative">
                      <img src={formData.product_image_url} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setFormData({ ...formData, product_image_url: null })
                          setImageFile(null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Image className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Click to upload image</span>
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h3 className="font-semibold text-lg mb-2">Delete Product?</h3>
            <p className="text-gray-600 mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-md font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
