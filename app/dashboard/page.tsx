'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, Plus, DollarSign, Clipboard, Wrench, FileText, 
  MessageSquare, User, LogOut, Search, CheckCircle, 
  Clock, AlertCircle, BarChart3, TrendingUp, Building,
  Calendar, Users, Bell, Settings, Menu, X, ChevronRight,
  ArrowLeft, Heart, MessageCircle
} from 'lucide-react'

interface User {
  id: string
  phone: string
  name?: string
  role: string
}

interface Property {
  id: string
  title: string
  city: string
  rent: number
  status: string
}

// Logout function
const handleLogout = () => {
  localStorage.removeItem('auth_user')
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_expiry')
  document.cookie = 'auth_state=;max-age=0;path=/'
  window.location.href = '/login'
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    properties: 0,
    applications: 0,
    activeLeases: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    const userStr = localStorage.getItem('auth_user')
    const expiryStr = localStorage.getItem('auth_expiry')
    
    if (!userStr || !expiryStr || Date.now() > parseInt(expiryStr)) {
      router.push('/login')
      return
    }
    
    setUser(JSON.parse(userStr))
    
    // Fetch stats
    fetchStats()
  }, [])

  async function fetchStats() {
    const { data: properties } = await createClient().from('properties').select('*')
    const { data: leases } = await createClient().from('leases').select('*')
    
    setStats({
      properties: properties?.length || 0,
      applications: 5,
      activeLeases: leases?.length || 0,
      pendingPayments: 3,
      totalRevenue: 35000,
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">租好</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg">
            <BarChart3 className="w-5 h-5" />
            <span>仪表盘</span>
          </Link>
          <Link href="/properties" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Building className="w-5 h-5" />
            <span>房源管理</span>
          </Link>
          <Link href="/applications" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Clipboard className="w-5 h-5" />
            <span>申请管理</span>
          </Link>
          <Link href="/leases" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <FileText className="w-5 h-5" />
            <span>合同管理</span>
          </Link>
          <Link href="/payments" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <DollarSign className="w-5 h-5" />
            <span>租金管理</span>
          </Link>
          <Link href="/maintenance" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Wrench className="w-5 h-5" />
            <span>维修工单</span>
          </Link>
          <Link href="/notifications" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Bell className="w-5 h-5" />
            <span>消息通知</span>
          </Link>
          <Link href="/chat" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <MessageCircle className="w-5 h-5" />
            <span>在线咨询</span>
          </Link>
          <Link href="/favorites" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Heart className="w-5 h-5" />
            <span>我的收藏</span>
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <User className="w-5 h-5" />
            <span>个人资料</span>
          </Link>
          
          {/* Logout Button in Sidebar */}
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full">
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold">仪表盘</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user?.name || user?.phone}</span>
              <button onClick={handleLogout} className="text-red-600 hover:text-red-700">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">房源总数</p>
                  <p className="text-2xl font-bold">{stats.properties}</p>
                </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">活跃合同</p>
                  <p className="text-2xl font-bold">{stats.activeLeases}</p>
                </div>
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">待收租金</p>
                  <p className="text-2xl font-bold text-yellow-600">¥{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">维修工单</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</p>
                </div>
                <Wrench className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4">快捷操作</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/properties/new" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition">
                <Plus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <span className="text-sm text-blue-600">发布房源</span>
              </Link>
              <Link href="/applications" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition">
                <Clipboard className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <span className="text-sm text-green-600">查看申请</span>
              </Link>
              <Link href="/payments" className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition">
                <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <span className="text-sm text-yellow-600">租金管理</span>
              </Link>
              <Link href="/notifications" className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition">
                <Bell className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <span className="text-sm text-purple-600">发送通知</span>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
