'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Home, User, LogOut, Loader2 } from 'lucide-react'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('auth_user')
      const expiryStr = localStorage.getItem('auth_expiry')
      
      if (userStr && expiryStr) {
        const expiry = parseInt(expiryStr)
        if (Date.now() <= expiry) {
          setUser(JSON.parse(userStr))
        }
      }
      setLoading(false)
    }
    
    checkAuth()
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_expiry')
    document.cookie = 'auth_state=;max-age=0;path=/'
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href={user ? (user.role === 'landlord' ? '/dashboard' : '/properties') : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">租好</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/properties" className="text-gray-600 hover:text-gray-900 transition">房源</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition">关于</Link>
            
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                  <User className="w-5 h-5" />
                  <span>{user.name || user.phone}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition">
                  <LogOut className="w-5 h-5" />
                  <span>退出</span>
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                <User className="w-5 h-5" />
                <span>登录</span>
              </Link>
            )}
          </nav>

          <div className="md:hidden flex items-center gap-3">
            {user ? (
              <button onClick={handleLogout} className="text-gray-600"><LogOut className="w-5 h-5" /></button>
            ) : (
              <Link href="/login" className="text-gray-600"><User className="w-5 h-5" /></Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
