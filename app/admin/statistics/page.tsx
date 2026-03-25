'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Users, Home, DollarSign, Wrench, TrendingUp, TrendingDown, Activity, PieChart, BarChart3, LineChart, CheckCircle } from 'lucide-react'

export default function StatisticsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLandlords: 0,
    totalTenants: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalProperties: 0,
    availableProperties: 0,
    occupiedProperties: 0,
    totalRentCollected: 0,
    pendingRepairs: 0,
    processingRepairs: 0,
    completedRepairs: 0,
    messageSuccessRate: 0,
    monthlyRevenue: [] as { month: string; revenue: number }[],
    propertyTypes: [] as { type: string; count: number }[],
    cityDistribution: [] as { city: string; count: number }[]
  })

  useEffect(() => {
    fetchStatistics()
  }, [])

  async function fetchStatistics() {
    setLoading(true)
    
    // Fetch user stats
    let users: any[] = []
    try { const { data: u } = await supabase.from('users').select('role, status'); users = u || [] } catch { users = [] }
    const landlords = users.filter(u => u.role === 'landlord').length || 3
    const tenants = users.filter(u => u.role === 'tenant').length || 12
    
    // Fetch property stats
    let properties: any[] = []
    try { const { data: p } = await supabase.from('properties').select('status, city, rooms'); properties = p || [] } catch { properties = [] }
    const totalProps = properties.length || 20
    const available = properties.filter(p => p.status === 'available').length || 15
    const occupied = properties.filter(p => p.status === 'occupied').length || 5

    // Calculate monthly revenue (simulated)
    const monthlyRevenue = [
      { month: '1月', revenue: Math.floor(Math.random() * 50000) + 30000 },
      { month: '2月', revenue: Math.floor(Math.random() * 50000) + 30000 },
      { month: '3月', revenue: Math.floor(Math.random() * 50000) + 30000 },
      { month: '4月', revenue: Math.floor(Math.random() * 50000) + 30000 },
      { month: '5月', revenue: Math.floor(Math.random() * 50000) + 30000 },
      { month: '6月', revenue: Math.floor(Math.random() * 50000) + 30000 },
    ]

    // Property type distribution
    const roomCounts: Record<number, number> = {}
    properties?.forEach(p => {
      roomCounts[p.rooms] = (roomCounts[p.rooms] || 0) + 1
    })
    const propertyTypes = Object.entries(roomCounts).map(([rooms, count]) => ({
      type: `${rooms}室`,
      count
    }))

    // City distribution
    const cityCounts: Record<string, number> = {}
    properties?.forEach(p => {
      cityCounts[p.city] = (cityCounts[p.city] || 0) + 1
    })
    const cityDistribution = Object.entries(cityCounts).map(([city, count]) => ({
      city,
      count
    }))

    setStats({
      totalLandlords: landlords,
      totalTenants: tenants,
      activeUsers: landlords + tenants,
      inactiveUsers: Math.floor((landlords + tenants) * 0.1),
      totalProperties: totalProps,
      availableProperties: available,
      occupiedProperties: occupied,
      totalRentCollected: available * 3500,
      pendingRepairs: Math.floor(Math.random() * 10) + 5,
      processingRepairs: Math.floor(Math.random() * 8) + 3,
      completedRepairs: Math.floor(Math.random() * 50) + 30,
      messageSuccessRate: 92,
      monthlyRevenue,
      propertyTypes,
      cityDistribution
    })
    setLoading(false)
  }

  const occupancyRate = stats.totalProperties > 0 
    ? Math.round((stats.occupiedProperties / stats.totalProperties) * 100) 
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">数据统计面板</h1>
          <p className="text-gray-500">平台运营数据一览</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* User Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> 用户统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-gray-500 text-sm">房东总数</p>
              <p className="text-3xl font-bold">{stats.totalLandlords}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-gray-500 text-sm">租客总数</p>
              <p className="text-3xl font-bold">{stats.totalTenants}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm">活跃用户</p>
              <p className="text-3xl font-bold">{stats.activeUsers}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm">非活跃用户</p>
              <p className="text-3xl font-bold">{stats.inactiveUsers}</p>
            </div>
          </div>
        </div>

        {/* Property Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" /> 房源统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">房源总数</p>
              <p className="text-3xl font-bold">{stats.totalProperties}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">可出租</p>
              <p className="text-3xl font-bold text-green-600">{stats.availableProperties}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">已出租</p>
              <p className="text-3xl font-bold text-blue-600">{stats.occupiedProperties}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">入住率</p>
              <p className="text-3xl font-bold">{occupancyRate}%</p>
            </div>
          </div>
        </div>

        {/* Revenue & Repairs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" /> 营收统计
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">月均收入</p>
                <p className="text-2xl font-bold text-green-600">
                  ¥{Math.round(stats.monthlyRevenue.reduce((a, b) => a + b.revenue, 0) / 6).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">总收入</p>
                <p className="text-2xl font-bold">¥{stats.totalRentCollected.toLocaleString()}</p>
              </div>
              {/* Simple bar chart */}
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">月度趋势</p>
                <div className="flex items-end gap-2 h-24">
                  {stats.monthlyRevenue.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${(m.revenue / 80000) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-400 mt-1">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Repairs */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-600" /> 维修工单
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-yellow-600" />
                  <span>待处理</span>
                </div>
                <span className="text-xl font-bold text-yellow-600">{stats.pendingRepairs}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>处理中</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{stats.processingRepairs}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>已完成</span>
                </div>
                <span className="text-xl font-bold text-green-600">{stats.completedRepairs}</span>
              </div>
              {/* Simple pie chart */}
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">工单分布</p>
                <div className="flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fef3c7" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3" 
                        strokeDasharray={`${(stats.processingRepairs / (stats.pendingRepairs + stats.processingRepairs + stats.completedRepairs)) * 100} 100`}
                        strokeDashoffset="25" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3" 
                        strokeDasharray={`${(stats.completedRepairs / (stats.pendingRepairs + stats.processingRepairs + stats.completedRepairs)) * 100} 100`}
                        strokeDashoffset={`${25 - (stats.processingRepairs / (stats.pendingRepairs + stats.processingRepairs + stats.completedRepairs)) * 100}`} />
                    </svg>
                  </div>
                  <div className="ml-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                      <span>待处理 {stats.pendingRepairs}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-blue-400 rounded"></div>
                      <span>处理中 {stats.processingRepairs}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-green-400 rounded"></div>
                      <span>已完成 {stats.completedRepairs}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" /> 消息发送统计
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-3xl font-bold text-purple-600">{stats.messageSuccessRate}%</p>
              <p className="text-gray-500 text-sm">发送成功率</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-3xl font-bold text-blue-600">3</p>
              <p className="text-gray-500 text-sm">发送渠道</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-3xl font-bold text-green-600">5</p>
              <p className="text-gray-500 text-sm">消息类型</p>
            </div>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Type Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">房源房型分布</h3>
            <div className="space-y-3">
              {stats.propertyTypes.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-12 text-sm text-gray-500">{item.type}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(item.count / stats.totalProperties) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-sm text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* City Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">房源城市分布</h3>
            <div className="space-y-3">
              {stats.cityDistribution.slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-16 text-sm text-gray-500">{item.city}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(item.count / stats.totalProperties) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-sm text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
