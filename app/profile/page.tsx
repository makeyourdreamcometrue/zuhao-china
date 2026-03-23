'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User, Phone, Mail, Home, LogOut, Check } from 'lucide-react'

interface User {
  id: string
  phone: string
  name?: string
  role: string
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('tenant')
  const supabase = createClient()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setName(userData.name || '')
      setRole(userData.role || 'tenant')
    } else {
      router.push('/login')
    }
    setLoading(false)
  }, [router])

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    
    // Update in localStorage
    const updatedUser = { ...user, name, role }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    // Update in database
    await supabase
      .from('users')
      .update({ name, role })
      .eq('id', user.id)
    
    setUser(updatedUser)
    setSaving(false)
    alert('保存成功!')
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">个人中心</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Avatar */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{name || '未设置昵称'}</h2>
              <p className="text-gray-500">{user.phone}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h3 className="font-semibold mb-4">基本信息</h3>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">昵称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入昵称"
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* Phone (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-1">手机号</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{user.phone}</span>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-2">身份</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('landlord')}
                  className={`p-4 border rounded-lg flex items-center justify-center gap-2 transition ${
                    role === 'landlord' 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">我是房东</span>
                  {role === 'landlord' && <Check className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('tenant')}
                  className={`p-4 border rounded-lg flex items-center justify-center gap-2 transition ${
                    role === 'tenant' 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">我是租客</span>
                  {role === 'tenant' && <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700 transition"
            >
              {saving ? '保存中...' : '保存修改'}
            </button>
          </div>
        </div>

        {/* My Properties (for landlords) */}
        {role === 'landlord' && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h3 className="font-semibold mb-4">我的房源</h3>
            <button
              onClick={() => router.push('/properties')}
              className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              查看我的房源
            </button>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </button>
      </main>
    </div>
  )
}
