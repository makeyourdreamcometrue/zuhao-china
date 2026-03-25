'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Home, Calendar, DollarSign, Wrench, FileText, Clock, CheckCircle, Building } from 'lucide-react'

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [tenant, setTenant] = useState<any>(null)
  const [property, setProperty] = useState<any>(null)
  const [repairs, setRepairs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
      fetchTenantData(params.id as string, user.id)
    }
  }, [params.id])

  async function fetchTenantData(tenantId: string, currentUserId: string) {
    setLoading(true)
    
    // Fetch tenant info
    const { data: tenantData } = await supabase
      .from('users')
      .select('*')
      .eq('id', tenantId)
      .single()

    if (tenantData) {
      setTenant(tenantData)
      
      // Mock property data (in real app, would link to leases table)
      setProperty({
        title: '天河CBD精装两房，拎包入住',
        address: '天河区天河路385号',
        area: 85,
        rooms: 2,
        rent: 4500,
        checkInDate: '2026-01-15',
        contractEndDate: '2027-01-14',
        deposit: 9000
      })
      
      // Mock payment history
      setRepairs([
        { id: 1, title: '水龙头漏水', status: 'pending', created_at: new Date().toISOString(), description: '厨房水龙头漏水严重' },
        { id: 2, title: '空调不制冷', status: 'completed', created_at: new Date(Date.now() - 86400000 * 7).toISOString(), description: '空调制冷效果差' },
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

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">未找到该租客信息</p>
          <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">返回首页</Link>
        </div>
      </div>
    )
  }

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
              <h1 className="text-2xl font-bold">{tenant.name || '租客'}</h1>
              <p className="text-gray-500 text-sm">租客详情</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" /> 基本信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">手机号</p>
                <p className="font-medium">{tenant.phone || '未设置'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">邮箱</p>
                <p className="font-medium">{tenant.email || '未设置'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">注册时间</p>
                <p className="font-medium">{new Date(tenant.created_at).toLocaleDateString('zh-CN')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">账户状态</p>
                <p className="font-medium text-green-600">活跃</p>
              </div>
            </div>
          </div>
        </div>

        {/* Property Info Card */}
        {property && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Home className="w-5 h-5" /> 当前租房信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-lg mb-2">{property.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{property.address}</p>
                <div className="flex gap-4 text-sm">
                  <span className="bg-gray-100 px-3 py-1 rounded">{property.area}㎡</span>
                  <span className="bg-gray-100 px-3 py-1 rounded">{property.rooms}室</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">月租金</span>
                  <span className="font-semibold text-yellow-600">¥{property.rent}/月</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">押金</span>
                  <span className="font-semibold">¥{property.deposit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">入住日期</span>
                  <span className="font-medium">{property.checkInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">合同到期</span>
                  <span className="font-medium">{property.contractEndDate}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> 缴费记录
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">月份</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">支付方式</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4">2026年3月</td>
                  <td className="px-6 py-4">¥4,500</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">已支付</span></td>
                  <td className="px-6 py-4 text-gray-600">微信支付</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">2026年2月</td>
                  <td className="px-6 py-4">¥4,500</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">已支付</span></td>
                  <td className="px-6 py-4 text-gray-600">支付宝</td>
                </tr>
                <tr>
                  <td className="px-6 py-4">2026年1月</td>
                  <td className="px-6 py-4">¥4,500</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">已支付</span></td>
                  <td className="px-6 py-4 text-gray-600">微信支付</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Repair Orders */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5" /> 维修工单
            </h2>
          </div>
          {repairs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">暂无维修工单</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">工单标题</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {repairs.map((repair) => (
                    <tr key={repair.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{repair.title}</td>
                      <td className="px-6 py-4 text-gray-600">{repair.description}</td>
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
          )}
        </div>

        {/* Check-in/Check-out Records */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" /> 入住/退房记录
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">入住</span>
                </div>
                <p className="text-sm text-gray-600">2026年1月15日</p>
              </div>
              <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">预计退房</span>
                </div>
                <p className="text-sm text-gray-600">2027年1月14日</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
