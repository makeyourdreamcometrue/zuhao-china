'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Plus, DollarSign, Clipboard, Wrench, FileText, MessageSquare, User, LogOut, Search, CheckCircle, Clock, AlertCircle, BarChart3 } from 'lucide-react'

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

interface Application {
  id: string
  status: string
  property_id: string
}

interface Payment {
  id: string
  amount: number
  status: string
  type: string
}

interface Lease {
  id: string
  status: string
  rent_amount: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    properties: 0,
    applications: 0,
    activeLeases: 0,
    pendingPayments: 0,
    totalRevenue: 0
  })
  const supabase = createClient()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      fetchStats(userData.id)
    } else {
      router.push('/login')
    }
    setLoading(false)
  }, [router])

  async function fetchStats(userId: string) {
    // Get properties
    const { data: properties } = await supabase
      .from('properties')
      .select('id, title, city, rent, status')
      .eq('owner_id', userId)
    
    // Get applications for my properties
    const propertyIds = properties?.map(p => p.id) || []
    const { data: applications } = await supabase
      .from('applications')
      .select('*')
      .in('property_id', propertyIds)
      .eq('status', 'pending')
    
    // Get leases
    const { data: leases } = await supabase
      .from('leases')
      .select('*')
      .eq('landlord_id', userId)
      .eq('status', 'active')
    
    // Get pending payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
    
    const totalRevenue = payments?.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0) || 0

    setStats({
      properties: properties?.length || 0,
      applications: applications?.length || 0,
      activeLeases: leases?.length || 0,
      pendingPayments: payments?.length || 0,
      totalRevenue: totalRevenue
    })
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">租好</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-sm text-gray-500 hover:text-gray-900">个人中心</Link>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
          <h2 className="text-2xl font-bold mb-2">房东管理中心</h2>
          <p className="opacity-90">欢迎回来, {user.name || user.phone}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.properties}</div>
                <div className="text-xs text-gray-500">房源</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clipboard className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.applications}</div>
                <div className="text-xs text-gray-500">待处理申请</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.activeLeases}</div>
                <div className="text-xs text-gray-500"> active leases</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                <div className="text-xs text-gray-500">待收租金</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">¥{stats.totalRevenue.toLocaleString()}</div>
                <div className="text-xs text-gray-500">总收入</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link href="/properties" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center block">
            <Search className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium">浏览房源</span>
          </Link>
          <Link href="/properties/new" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center block">
            <Plus className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium">发布房源</span>
          </Link>
          <Link href="/leases" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center block">
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium">租约管理</span>
          </Link>
          <Link href="/payments" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center block">
            <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <span className="text-sm font-medium">租金管理</span>
          </Link>
          <Link href="/applications" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center block">
            <Clipboard className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <span className="text-sm font-medium">申请管理</span>
          </Link>
          <Link href="/inspections" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center block">
            <CheckCircle className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <span className="text-sm font-medium">房屋检查</span>
          </Link>
          <Link href="/maintenance" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center block">
            <Wrench className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <span className="text-sm font-medium">维修工单</span>
          </Link>
          <Link href="/expenses" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-center block">
            <BarChart3 className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
            <span className="text-sm font-medium">费用报表</span>
          </Link>
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 快速开始</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. 发布房源 → 2. 审核申请 → 3. 创建租约 → 4. 收取租金</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
