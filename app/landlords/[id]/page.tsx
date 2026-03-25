'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MessageCircle, Home, Users, DollarSign, Wrench, Calendar, Building, Edit, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function LandlordDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [landlord, setLandlord] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [repairs, setRepairs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
      
      // Check permission: only landlord can view, and can only view own details
      if (user.role !== 'landlord' && user.role !== 'admin') {
        router.push('/')
        return
      }
      
      fetchLandlordData(params.id as string, user.id)
    }
  }, [params.id])

  async function fetchLandlordData(landlordId: string, currentUserId: string) {
    // If not admin, can only view own profile
    if (landlordId !== currentUserId) {
      // Check if current user is admin, otherwise redirect
      const { data: userData } = await supabase.from('users').select('role').eq('id', currentUserId).single()
      if (userData?.role !== 'admin') {
        router.push('/')
        return
      }
    }

    setLoading(true)
    
    // Fetch landlord info
    const { data: landlordData } = await supabase
      .from('users')
      .select('*')
      .eq('id', landlordId)
      .single()

    if (landlordData) {
      setLandlord(landlordData)
      
      // Fetch properties owned by this landlord
      const { data: propertyData } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', landlordId)
      
      setProperties(propertyData || [])
      
      // Calculate income
      const occupiedProps = propertyData?.filter(p => p.status === 'occupied') || []
      const totalIncome = occupiedProps.reduce((sum, p) => sum + (p.rent || 0), 0)
      
      // For demo, create mock tenant data
      const mockTenants = occupiedProps.slice(0, 3).map((p, i) => ({
        name: ['张三', '李四', '王五'][i],
        phone: ['18812345601', '18923456702', '18734567803'][i],
        property: p.title,
        rent: p.rent,
        dueDate: new Date(Date.now() + (i + 1) * 86400000 * 5).toLocaleDateString('zh-CN')
      }))
      setTenants(mockTenants)
      
      // Mock repair orders
      setRepairs([
        { id: 1, title: '水龙头漏水', status: 'pending', property: propertyData?.[0]?.title || 'N/A', created_at: new Date().toISOString() },
        { id: 2, title: '空调不制冷', status: 'processing', property: propertyData?.[1]?.title || 'N/A', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, title: '门锁维修', status: 'completed', property: propertyData?.[2]?.title || 'N/A', created_at: new Date(Date.now() - 172800000).toISOString() },
      ])
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!landlord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">未找到该房东信息</p>
          <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">返回首页</Link>
        </div>
      </div>
    )
  }

  const totalIncome = properties.filter(p => p.status === 'occupied').reduce((sum, p) => sum + (p.rent || 0), 0)
  const occupiedCount = properties.filter(p => p.status === 'occupied').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{landlord.name || '房东'}</h1>
              <p className="text-gray-500 text-sm">房东详情</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> 基本信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">手机号</p>
                <p className="font-medium">{landlord.phone || '未设置'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">邮箱</p>
                <p className="font-medium">{landlord.email || '未设置'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">微信号</p>
                <p className="font-medium">{landlord.wechat_id || '未设置'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">注册时间</p>
                <p className="font-medium">{new Date(landlord.created_at).toLocaleDateString('zh-CN')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">房源总数</p>
                <p className="text-3xl font-bold">{properties.length}</p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">已出租</p>
                <p className="text-3xl font-bold text-green-600">{occupiedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">月租金收入</p>
                <p className="text-3xl font-bold text-yellow-600">¥{totalIncome.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">维修工单</p>
                <p className="text-3xl font-bold text-orange-600">{repairs.length}</p>
              </div>
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Home className="w-5 h-5" /> 房源列表 ({properties.length})
            </h2>
          </div>
          {properties.length === 0 ? (
            <div className="p-12 text-center text-gray-500">暂无房源</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">房源标题</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">城市</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">面积</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">租金</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {properties.slice(0, 5).map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/properties/${property.id}`} className="text-blue-600 hover:underline">
                          {property.title?.substring(0, 30)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{property.city}</td>
                      <td className="px-6 py-4 text-gray-600">{property.area}㎡</td>
                      <td className="px-6 py-4 text-gray-600">¥{property.rent}/月</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {property.status === 'available' ? '可出租' : '已出租'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" /> 租客列表 ({tenants.length})
            </h2>
          </div>
          {tenants.length === 0 ? (
            <div className="p-12 text-center text-gray-500">暂无租客</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">租住房源</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">月租金</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">到期日</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tenants.map((tenant, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{tenant.name}</td>
                      <td className="px-6 py-4 text-gray-600">{tenant.phone}</td>
                      <td className="px-6 py-4 text-gray-600">{tenant.property?.substring(0, 20)}...</td>
                      <td className="px-6 py-4 text-gray-600">¥{tenant.rent}</td>
                      <td className="px-6 py-4 text-gray-600">{tenant.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Repairs Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5" /> 维修工单 ({repairs.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">工单标题</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">房源</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {repairs.map((repair) => (
                  <tr key={repair.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{repair.title}</td>
                    <td className="px-6 py-4 text-gray-600">{repair.property?.substring(0, 25)}...</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        repair.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        repair.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {repair.status === 'pending' ? '待处理' : repair.status === 'processing' ? '处理中' : '已完成'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{new Date(repair.created_at).toLocaleDateString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
