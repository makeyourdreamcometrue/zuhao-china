'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear all auth data
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_expiry')
    localStorage.removeItem('rememberedPhone')
    
    // Clear cookie
    document.cookie = 'auth_state=;max-age=0;path=/'
    
    // Redirect to login after a brief moment
    setTimeout(() => {
      router.push('/login')
    }, 500)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">正在退出登录...</p>
      </div>
    </div>
  )
}
