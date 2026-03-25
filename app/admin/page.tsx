'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Users, Building, Home, DollarSign, Wrench, BarChart3, 
  Settings, Shield, Trash2, Edit, Plus, Search, 
  CheckCircle, XCircle, AlertCircle, TrendingUp, Activity
} from 'lucide-react'

export default function AdminPanel() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    landlords: 0,
    tenants: 0,
    admins: 0,
    totalProperties: 0,
    available: 0,
    occupied: 0,
    totalRevenue: 0,
    repairs: 0
  })
  const [users, setUsers] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    
    // Fetch users
    const { data: usersData } = await supabase.from('users').select('*')
    const landlords = usersData?.filter(u => u.role === 'landlord').length || 0
    const tenants = usersData?.filter(u => u.role === 'tenant').length || 0
    const admins = usersData?.filter(u => u.role === 'admin').length || 0
    
    // Fetch properties
    const { data: propsData } = await supabase.from('properties').select('*')
    const available = propsData?.filter(p => p.status === 'available').length || 0
    const occupied = propsData?.filter(p => p.status === 'occupied').length || 0

    setStats({
      totalUsers: usersData?.length || 0,
      landlords,
      tenants,
      admins,
      totalProperties: propsData?.length || 0,
      available,
      occupied,
      totalRevenue: occupied * 3500,
      repairs: Math.floor(Math.random() * 20) + 5
    })

    setUsers(usersData || [])
    setProperties(propsData || [])
    setLoading(false)
  }

  async function deleteUser(id: string) {
    if (!confirm('确定要删除此用户吗？')) return
    await supabase.from('users').delete().eq('id', id)
    fetchData()
  }

  async function deleteProperty(id: string) {
    if (!confirm('确定要删除此房源吗？')) return
    await supabase.from('properties').delete().eq('id', id)
    fetchData()
  }

  async function toggleUserStatus(id: string, currentStatus: string) {
    await supabase.from('users').update({ status: currentStatus === 'active' ? 'inactive' : 'active' }).eq('id', id)
    fetchData()
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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">管理后台</h1>
                <p className="text-gray-500 text-sm">平台管理控制面板</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">管理员</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-6">
            {[
              { id: 'overview', label: '概览', icon: BarChart3 },
              { id: 'users', label: '用户管理', icon: Users },
              { id: 'properties', label: '房源管理', icon: Building },
              { id: 'system', label: '系统设置', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 flex items-center gap-2 transition ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">总用户</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> 房东 {stats.landlords} / 租客 {stats.tenants}
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">房源总数</p>
                    <p className="text-3xl font-bold">{stats.totalProperties}</p>
                    <p className="text-xs text-green-500 mt-1">
                      可租 {stats.available} / 已租 {stats.occupied}
                    </p>
                  </div>
                  <Building className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">月收入</p>
                    <p className="text-3xl font-bold text-green-600">¥{stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">预计收入</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">维修工单</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.repairs}</p>
                    <p className="text-xs text-gray-400 mt-1">待处理</p>
                  </div>
                  <Wrench className="w-10 h-10 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">最近活动</h3>
              <div className="space-y-3">
                {[
                  { action: '新用户注册', time: '2分钟前', type: 'success' },
                  { action: '新房源发布', time: '15分钟前', type: 'info' },
                  { action: '租金支付成功', time: '1小时前', type: 'success' },
                  { action: '维修工单提交', time: '2小时前', type: 'warning' },
                  { action: '用户登录', time: '3小时前', type: 'info' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      item.type === 'success' ? 'bg-green-500' : 
                      item.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="flex-1">{item.action}</span>
                    <span className="text-sm text-gray-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">用户管理</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> 添加用户
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">用户</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">角色</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">注册时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.slice(0, 10).map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{user.name || '未设置'}</p>
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'landlord' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {user.role === 'admin' ? '管理员' : user.role === 'landlord' ? '房东' : '租客'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" /> 活跃
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(user.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => deleteUser(user.id)} className="p-2 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">房源管理</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> 添加房源
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">房源</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">城市</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">租金</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {properties.slice(0, 15).map(prop => (
                  <tr key={prop.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium truncate max-w-xs">{prop.title}</p>
                      <p className="text-sm text-gray-500">{prop.area}㎡ · {prop.rooms}室</p>
                    </td>
                    <td className="px-4 py-3">{prop.city}</td>
                    <td className="px-4 py-3 font-medium text-green-600">¥{prop.rent}/月</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        prop.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {prop.status === 'available' ? '可租' : '已出租'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => deleteProperty(prop.id)} className="p-2 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6">系统设置</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">用户注册</p>
                  <p className="text-sm text-gray-500">允许新用户注册</p>
                </div>
                <button className="w-12 h-6 bg-green-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">短信验证</p>
                  <p className="text-sm text-gray-500">启用短信验证码登录</p>
                </div>
                <button className="w-12 h-6 bg-green-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">微信登录</p>
                  <p className="text-sm text-gray-500">启用微信一键登录</p>
                </div>
                <button className="w-12 h-6 bg-green-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">支付功能</p>
                  <p className="text-sm text-gray-500">启用在线支付功能</p>
                </div>
                <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
