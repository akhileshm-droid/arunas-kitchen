import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export async function uploadPaymentScreenshot(file: File): Promise<string | null> {
  if (!isSupabaseConfigured()) return null

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `payment-proofs/${fileName}`

  const { error } = await supabase.storage
    .from('payment-proofs')
    .upload(filePath, file)

  if (error) {
    console.error('Upload error:', error)
    throw new Error(`Upload failed: ${error.message}. Please create a 'payment-proofs' bucket in Supabase Storage.`)
  }

  const { data } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function uploadProductImage(file: File): Promise<string | null> {
  if (!isSupabaseConfigured()) return null

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `products/${fileName}`

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file)

  if (error) {
    console.error('Product image upload error:', error)
    throw new Error(`Image upload failed: ${error.message}`)
  }

  const { data } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  if (!isSupabaseConfigured() || !imageUrl) return

  const urlParts = imageUrl.split('/')
  const fileName = urlParts.slice(-2).join('/')

  await supabase.storage
    .from('uploads')
    .remove([fileName])
}
