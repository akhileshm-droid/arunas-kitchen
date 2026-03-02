import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2, ArrowLeft } from 'lucide-react'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'aruna123'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true')
      navigate('/admin/orders')
    } else {
      setError('Invalid password')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 pt-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="premium-card p-6">
          <div className="w-16 h-16 bg-[#4a6741]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#4a6741]" />
          </div>
          
          <h1 className="font-serif text-xl text-center text-gray-800 mb-2">
            Admin Login
          </h1>
          <p className="text-gray-500 text-center text-sm mb-6">
            Enter your password to access the admin panel
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field text-center"
                placeholder="Enter password"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
