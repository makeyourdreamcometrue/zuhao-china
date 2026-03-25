'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, User, LogOut, Loader2, Building, ChevronDown, ArrowLeft } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showRoleMenu, setShowRoleMenu] = useState(false)

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

  const switchRole = (role: string) => {
    if (user) {
      const updatedUser = { ...user, current_role: role }
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      // Navigate to the appropriate page
      if (role === 'landlord') {
        router.push('/dashboard')
      } else if (role === 'tenant') {
        router.push('/properties')
      } else if (role === 'admin') {
        router.push('/admin')
      }
    }
    setShowRoleMenu(false)
  }

  const currentRole = user?.current_role || user?.role
  const hasMultipleRoles = user?.roles && user.roles.length > 1

  // Determine home link based on current role
  const getHomeLink = () => {
    if (!user) return '/'
    const role = user.current_role || user.role
    if (role === 'landlord') return '/dashboard'
    if (role === 'admin') return '/admin'
    return '/properties'
  }

  // Get role display info
  const getRoleInfo = () => {
    const role = user?.current_role || user?.role
    if (role === 'landlord') return { label: '房东', icon: Building, color: 'text-emerald-600' }
    if (role === 'admin') return { label: '管理员', icon: Home, color: 'text-purple-600' }
    return { label: '租客', icon: User, color: 'text-blue-600' }
  }

  const roleInfo = user ? getRoleInfo() : null
  const RoleIcon = roleInfo?.icon || User

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href={getHomeLink()} className="flex items-center gap-2">
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
                {/* Role Switcher */}
                {hasMultipleRoles && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowRoleMenu(!showRoleMenu)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                    >
                      <RoleIcon className={`w-4 h-4 ${roleInfo?.color}`} />
                      <span className="text-sm font-medium text-gray-700">{roleInfo?.label}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {showRoleMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                        {user.roles.includes('tenant') && (
                          <button
                            onClick={() => switchRole('tenant')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <User className="w-4 h-4 text-blue-600" />
                            切换为租客
                          </button>
                        )}
                        {user.roles.includes('landlord') && (
                          <button
                            onClick={() => switchRole('landlord')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Building className="w-4 h-4 text-emerald-600" />
                            切换为房东
                          </button>
                        )}
                        {user.roles.includes('admin') && (
                          <button
                            onClick={() => switchRole('admin')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Home className="w-4 h-4 text-purple-600" />
                            切换为管理员
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                  <User className="w-5 h-5" />
                  <span>{user.name || user.email}</span>
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
              <>
                {hasMultipleRoles && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowRoleMenu(!showRoleMenu)}
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      <RoleIcon className={`w-4 h-4 ${roleInfo?.color}`} />
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showRoleMenu && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border py-2 z-50">
                        {user.roles.includes('tenant') && (
                          <button onClick={() => switchRole('tenant')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">租客</button>
                        )}
                        {user.roles.includes('landlord') && (
                          <button onClick={() => switchRole('landlord')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">房东</button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <button onClick={handleLogout} className="text-gray-600"><LogOut className="w-5 h-5" /></button>
              </>
            ) : (
              <Link href="/login" className="text-gray-600"><User className="w-5 h-5" /></Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
