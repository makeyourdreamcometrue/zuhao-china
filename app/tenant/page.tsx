'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, Plus, FileText, MessageSquare, User, LogOut, Search,
  CheckCircle, Clock, AlertCircle, Building, Calendar, Bell,
  Settings, Menu, X, ChevronRight, ArrowLeft, DollarSign,
  Clipboard, Heart, MessageCircle, MapPin, Key
} from 'lucide-react'

interface User {
  id: string
  phone: string
  name?: string
  role: string
  roles?: string[]
}

interface Application {
  id: string
  property_id: string
  status: string
  created_at: string
  property?: {
    title: string
    city: string
    address: string
    rent: number
    area: number
    rooms: number
    photos: string[]
  }
}

interface Lease {
  id: string
  property_id: string
  status: string
  start_date: string
  end_date: string
  rent_amount: number
  property?: {
    title: string
    city: string
    address: string
  }
}

const handleLogout = () => {
  localStorage.removeItem('auth_user')
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_expiry')
  document.cookie = 'auth_state=;max-age=0;path=/'
  window.location.href = '/login'
}

export default function TenantDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    applications: 0,
    activeLeases: 0,
    pendingPayments: 0,
    favorited: 0,
  })
  const [applications, setApplications] = useState<Application[]>([])
  const [leases, setLeases] = useState<Lease[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const userStr = localStorage.getItem('auth_user')
    const expiryStr = localStorage.getItem('auth_expiry')
    
    if (!userStr || !expiryStr || Date.now() > parseInt(expiryStr)) {
      router.push('/login')
      return
    }
    
    const userData = JSON.parse(userStr)
    setUser(userData)
    
    // Check if user has tenant role
    const roles = userData.roles || [userData.role]
    if (!roles.includes('tenant') && userData.current_role !== 'tenant') {
      router.push('/dashboard')
      return
    }
    
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()
    
    // Get user from auth
    const userStr = localStorage.getItem('auth_user')
    const userData = userStr ? JSON.parse(userStr) : null
    
    // Fetch applications
    const { data: appsData } = await supabase
      .from('applications')
      .select('*')
      .eq('tenant_id', userData?.id || '')
    
    // Fetch leases
    const { data: leasesData } = await supabase
      .from('leases')
      .select('*')
      .eq('tenant_id', userData?.id || '')
    
    // Get favorites count
    const favoritesStr = localStorage.getItem('favorites')
    const favorites = favoritesStr ? JSON.parse(favoritesStr) : []
    
    setStats({
      applications: appsData?.length || 0,
      activeLeases: leasesData?.filter(l => l.status === 'active').length || 0,
      pendingPayments: 2,
      favorited: favorites.length || 0,
    })
    
    setApplications(appsData || [])
    setLeases(leasesData || [])
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      active: 'bg-green-100 text-green-700',
      expired: 'bg-gray-100 text-gray-700',
    }
    const labels: any = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已拒绝',
      active: '生效中',
      expired: '已过期',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">租好</span>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{user?.name || '租客'}</p>
                  <p className="text-xs text-gray-500">{user?.phone}</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Home className="w-5 h-5" />
                <span>概览</span>
              </button>
              <button onClick={() => router.push('/tenant/applications')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-600 hover:bg-gray-50">
                <Clipboard className="w-5 h-5" />
                <span>我的申请</span>
                {stats.applications > 0 && <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{stats.applications}</span>}
              </button>
              <button onClick={() => setActiveTab('leases')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${activeTab === 'leases' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <FileText className="w-5 h-5" />
                <span>我的租约</span>
              </button>
              <button onClick={() => router.push('/payments')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-600 hover:bg-gray-50">
                <DollarSign className="w-5 h-5" />
                <span>租金缴纳</span>
              </button>
              <button onClick={() => router.push('/favorites')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-600 hover:bg-gray-50">
                <Heart className="w-5 h-5" />
                <span>收藏房源</span>
                {stats.favorited > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.favorited}</span>}
              </button>
              <button onClick={() => router.push('/chat')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-600 hover:bg-gray-50">
                <MessageSquare className="w-5 h-5" />
                <span>消息</span>
              </button>
              <button onClick={() => router.push('/profile')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-600 hover:bg-gray-50">
                <Settings className="w-5 h-5" />
                <span>设置</span>
              </button>
            </nav>
            
            <div className="p-4 border-t">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50">
                <LogOut className="w-5 h-5" />
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold">欢迎回来，{user?.name || '租客'} 👋</h1>
            <p className="text-gray-500">管理您的租房事务</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Clipboard className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{stats.applications}</p>
              <p className="text-gray-500 text-sm">租房申请</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold">{stats.activeLeases}</p>
              <p className="text-gray-500 text-sm">有效租约</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              <p className="text-gray-500 text-sm">待付租金</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold">{stats.favorited}</p>
              <p className="text-gray-500 text-sm">收藏房源</p>
            </div>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-2xl shadow-sm mb-8">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">最新申请</h2>
              <button onClick={() => setActiveTab('applications')} className="text-blue-600 text-sm hover:underline">查看全部</button>
            </div>
            <div className="p-6">
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <Clipboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无租房申请</p>
                  <Link href="/properties" className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    浏览房源
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center gap-4 p-4 border rounded-xl">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Home className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{app.property?.title || '房源'}</p>
                        <p className="text-sm text-gray-500">{app.property?.city} · {app.property?.address}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Leases */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">我的租约</h2>
              <button onClick={() => setActiveTab('leases')} className="text-blue-600 text-sm hover:underline">查看全部</button>
            </div>
            <div className="p-6">
              {leases.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无租约</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leases.slice(0, 3).map((lease) => (
                    <div key={lease.id} className="flex items-center gap-4 p-4 border rounded-xl">
                      <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{lease.property?.title || '房源'}</p>
                        <p className="text-sm text-gray-500">租期: {lease.start_date?.split('T')[0]} - {lease.end_date?.split('T')[0]}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">¥{lease.rent_amount}/月</p>
                        {getStatusBadge(lease.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
