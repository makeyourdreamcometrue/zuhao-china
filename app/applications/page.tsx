'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Home, FileText, Clock, Check, X, Building, User,
  Send, CheckCircle, AlertCircle, MessageSquare, Bell, Shield,
  Calendar, DollarSign, Eye, Phone, Mail, UserCheck, Search,
  Filter, MoreVertical, RefreshCw, CheckSquare, XSquare, MailPlus,
  MessageCircle, Clock3, TrendingUp, AlertTriangle, ArrowRight
} from 'lucide-react'

interface Application {
  id: string
  property_id: string
  tenant_id: string
  status: string
  message: string
  created_at: string
  updated_at?: string
  tenant_name?: string
  tenant_phone?: string
  move_in_date?: string
  lease_duration?: number
  employment_status?: string
  income?: number
  documents_verified?: boolean
  property?: {
    title: string
    city: string
    address: string
    rent: number
    area: number
    rooms: number
    photos: string[]
  }
  tenant?: {
    name: string
    phone: string
    wechat_id?: string
  }
}

interface NotificationTemplate {
  id: string
  title: string
  message: string
}

interface Stats {
  total: number
  pending: number
  thisWeek: number
  approved: number
  rejected: number
  avgResponseTime: number
}

// Quick response templates
const TEMPLATES = [
  { id: 'approve', label: '通过申请', color: 'bg-green-600', icon: Check },
  { id: 'reject', label: '拒绝申请', color: 'bg-red-600', icon: X },
  { id: 'review', label: '要求补充材料', color: 'bg-yellow-500', icon: AlertTriangle },
  { id: 'contact', label: '联系租客', color: 'bg-blue-600', icon: Phone },
]

// Auto-notification templates
const AUTO_NOTIFICATIONS = {
  new_application: {
    title: '新租房申请',
    template: '您有一条新的租房申请，申请人: {tenant_name}，请尽快审核。'
  },
  status_approved: {
    title: '申请已通过',
    template: '您的租房申请已通过！房源: {property_title}，月租: ¥{rent}。'
  },
  status_rejected: {
    title: '申请未通过',
    template: '抱歉，您的租房申请未通过。房源: {property_title}。'
  },
  reminder: {
    title: '申请提醒',
    template: '您有 {count} 条待审核的租房申请，请及时处理。'
  }
}

export default function LandlordApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showQuickResponse, setShowQuickResponse] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [sendingNotification, setSendingNotification] = useState(false)
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, thisWeek: 0, approved: 0, rejected: 0, avgResponseTime: 0 })
  const supabase = createClient()

  useEffect(() => {
    fetchApplications()
    fetchStats()
  }, [])

  async function fetchApplications() {
    const userStr = localStorage.getItem('auth_user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)

    // Get properties owned by this landlord
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('owner_id', user.id)
    
    const propertyIds = properties?.map(p => p.id) || []
    
    if (propertyIds.length === 0) {
      setApplications([])
      setLoading(false)
      return
    }

    // Get applications for these properties
    const { data: apps } = await supabase
      .from('applications')
      .select('*')
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false })

    // Enrich with property and tenant details
    const appsWithDetails = await Promise.all((apps || []).map(async (app) => {
      const [propertyRes, tenantRes] = await Promise.all([
        supabase.from('properties').select('title, city, address, rent, area, rooms, photos, owner_id').eq('id', app.property_id).single(),
        supabase.from('users').select('name, phone, wechat_id').eq('id', app.tenant_id).single()
      ])

      return { 
        ...app, 
        property: propertyRes.data,
        tenant: tenantRes.data
      }
    }))

    setApplications(appsWithDetails)
    setLoading(false)
  }

  async function fetchStats() {
    const userStr = localStorage.getItem('auth_user')
    if (!userStr) return
    const user = JSON.parse(userStr)

    const { data: properties } = await supabase.from('properties').select('id').eq('owner_id', user.id)
    const propertyIds = properties?.map(p => p.id) || []

    if (propertyIds.length === 0) {
      setStats({ total: 0, pending: 0, thisWeek: 0, approved: 0, rejected: 0, avgResponseTime: 0 })
      return
    }

    const { data: apps } = await supabase.from('applications').select('*').in('property_id', propertyIds)
    const appList = apps || []

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    setStats({
      total: appList.length,
      pending: appList.filter(a => a.status === 'pending').length,
      thisWeek: appList.filter(a => new Date(a.created_at) > oneWeekAgo).length,
      approved: appList.filter(a => a.status === 'approved').length,
      rejected: appList.filter(a => a.status === 'rejected').length,
      avgResponseTime: 2.5, // Mock data - would calculate from real data
    })
  }

  // Process application (approve/reject)
  async function processApplication(appId: string, newStatus: string, message?: string) {
    setProcessing(true)
    
    const userStr = localStorage.getItem('auth_user')
    const user = userStr ? JSON.parse(userStr) : null
    const app = applications.find(a => a.id === appId)
    
    // Update application status
    await supabase
      .from('applications')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', appId)

    // Send notification to tenant
    const notificationType = newStatus === 'approved' ? 'status_approved' : 'status_rejected'
    const template = AUTO_NOTIFICATIONS[notificationType as keyof typeof AUTO_NOTIFICATIONS]
    
    await supabase.from('notifications').insert({
      user_id: app?.tenant_id,
      title: template.title,
      content: template.template
        .replace('{tenant_name}', app?.tenant?.name || '租客')
        .replace('{property_title}', app?.property?.title || '房源')
        .replace('{rent}', app?.property?.rent?.toString() || '0'),
      type: 'status_update',
      sender_id: user?.id
    })

    // Also create chat message
    await supabase.from('messages').insert({
      sender_id: user?.id,
      receiver_id: app?.tenant_id,
      property_id: app?.property_id,
      content: message || template.template,
      is_system: true
    })

    setProcessing(false)
    setShowQuickResponse(false)
    setShowDetail(false)
    fetchApplications()
    fetchStats()
  }

  // Send reminder to tenant
  async function sendReminder(appId: string) {
    setSendingNotification(true)
    
    const app = applications.find(a => a.id === appId)
    const userStr = localStorage.getItem('auth_user')
    const user = userStr ? JSON.parse(userStr) : null

    await supabase.from('notifications').insert({
      user_id: app?.tenant_id,
      title: '申请审核提醒',
      content: `您申请的房源"${app?.property?.title}"仍在审核中，请耐心等待或联系房东。`,
      type: 'reminder',
      sender_id: user?.id
    })

    setSendingNotification(false)
    alert('提醒已发送！')
  }

  // Filter
  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter
    const matchesSearch = !searchTerm || 
      app.tenant?.name?.includes(searchTerm) ||
      app.property?.title?.includes(searchTerm) ||
      app.tenant?.phone?.includes(searchTerm)
    return matchesFilter && matchesSearch
  })

  // Compliance check
  const pendingApps = applications.filter(a => a.status === 'pending')
  const needsAttention = pendingApps.filter(a => {
    const created = new Date(a.created_at)
    const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
    return daysSince > 3 // Over 3 days = needs attention
  })

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; icon: any }> = {
      pending: { label: '待审核', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
      reviewing: { label: '审核中', color: 'text-blue-600', bg: 'bg-blue-50', icon: Eye },
      approved: { label: '已通过', color: 'text-green-600', bg: 'bg-green-50', icon: Check },
      rejected: { label: '已拒绝', color: 'text-red-600', bg: 'bg-red-50', icon: X },
    }
    return configs[status] || configs.pending
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
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">租房申请管理</h1>
                <p className="text-gray-500 text-sm">处理租客申请 · 自动通知</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { fetchApplications(); fetchStats(); }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-gray-500 text-sm">总申请</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-gray-500 text-sm">待审核</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.thisWeek}</p>
              <p className="text-gray-500 text-sm">本周新增</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-gray-500 text-sm">已通过</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-gray-500 text-sm">已拒绝</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.avgResponseTime}天</p>
              <p className="text-gray-500 text-sm">平均处理</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {needsAttention.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">您有 {needsAttention.length} 条申请超过3天未处理</span>
              <button onClick={() => setFilter('pending')} className="ml-2 text-yellow-700 underline text-sm">查看</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'pending', 'reviewing', 'approved', 'rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    filter === f 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? '全部' : getStatusConfig(f).label}
                </button>
              ))}
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索租客姓名、手机号或房源..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无申请</h3>
            <p className="text-gray-500">当租客申请您的房源时，会显示在这里</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => {
              const statusConfig = getStatusConfig(app.status)
              const StatusIcon = statusConfig.icon
              const daysSince = Math.floor((Date.now() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24))
              const isUrgent = app.status === 'pending' && daysSince > 3
              
              return (
                <div 
                  key={app.id} 
                  className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 ${isUrgent ? 'border-l-4 border-yellow-500' : ''}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Tenant Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{app.tenant?.name || '匿名租客'}</h3>
                          {isUrgent && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              紧急
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-3">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {app.tenant?.phone || '未提供'}</span>
                          {app.tenant?.wechat_id && (
                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {app.tenant.wechat_id}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Property Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {app.property?.photos?.[0] ? (
                          <img src={app.property.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Home className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{app.property?.title}</p>
                        <p className="text-sm text-gray-500">¥{app.property?.rent}/月 · {app.property?.area}㎡</p>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">申请时间</p>
                        <p className="font-medium">{daysSince === 0 ? '今天' : `${daysSince}天前`}</p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4" /> {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setSelectedApp(app); setShowDetail(true); }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => { setSelectedApp(app); setShowQuickResponse(true); }}
                            className="p-2 hover:bg-green-50 rounded-lg"
                          >
                            <Check className="w-5 h-5 text-green-600" />
                          </button>
                          <button 
                            onClick={() => processApplication(app.id, 'rejected')}
                            className="p-2 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-5 h-5 text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Info Bar */}
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm text-gray-500">
                    {app.move_in_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> 期望入住: {new Date(app.move_in_date).toLocaleDateString('zh-CN')}
                      </span>
                    )}
                    {app.lease_duration && (
                      <span className="flex items-center gap-1">
                        <Clock3 className="w-4 h-4" /> 租期: {app.lease_duration}个月
                      </span>
                    )}
                    {app.income && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" /> 收入: ¥{app.income}/月
                      </span>
                    )}
                    {app.employment_status && (
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-4 h-4" /> {app.employment_status}
                      </span>
                    )}
                    {app.documents_verified && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Shield className="w-4 h-4" /> 已认证
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Response Modal */}
      {showQuickResponse && selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">快速处理</h2>
              <p className="text-gray-500 text-sm">选择操作并发送通知给租客</p>
            </div>
            
            <div className="p-6 space-y-3">
              {TEMPLATES.map((template) => {
                const Icon = template.icon
                const isDestructive = template.id === 'reject'
                
                return (
                  <button
                    key={template.id}
                    onClick={() => {
                      const status = template.id === 'approve' ? 'approved' : template.id === 'reject' ? 'rejected' : 'reviewing'
                      processApplication(selectedApp.id, status, 
                        template.id === 'approve' ? '恭喜！您的申请已通过审核。' :
                        template.id === 'reject' ? '抱歉，您的申请未通过。' :
                        '请补充相关材料以便我们更快审核。'
                      )
                    }}
                    disabled={processing}
                    className={`w-full p-4 rounded-xl flex items-center gap-3 ${template.color} text-white hover:opacity-90 disabled:opacity-50`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{template.label}</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </button>
                )
              })}
            </div>
            
            <div className="p-4 border-t">
              <button 
                onClick={() => setShowQuickResponse(false)}
                className="w-full py-3 text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold">申请详情</h2>
              <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Tenant */}
              <div>
                <label className="text-sm text-gray-500">租客信息</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedApp.tenant?.name || '匿名租客'}</p>
                    <p className="text-sm text-gray-500">{selectedApp.tenant?.phone}</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    {selectedApp.tenant?.phone && (
                      <a href={`tel:${selectedApp.tenant.phone}`} className="p-2 bg-green-100 rounded-lg">
                        <Phone className="w-5 h-5 text-green-600" />
                      </a>
                    )}
                    {selectedApp.tenant?.wechat_id && (
                      <button className="p-2 bg-green-50 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Property */}
              <div>
                <label className="text-sm text-gray-500">房源信息</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-xl">
                  <p className="font-medium">{selectedApp.property?.title}</p>
                  <p className="text-sm text-gray-500">{selectedApp.property?.city} · {selectedApp.property?.address}</p>
                  <p className="text-blue-600 font-semibold mt-2">¥{selectedApp.property?.rent}/月</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">申请时间</label>
                  <p className="font-medium">{new Date(selectedApp.created_at).toLocaleString('zh-CN')}</p>
                </div>
                {selectedApp.move_in_date && (
                  <div>
                    <label className="text-sm text-gray-500">期望入住</label>
                    <p className="font-medium">{new Date(selectedApp.move_in_date).toLocaleDateString('zh-CN')}</p>
                  </div>
                )}
                {selectedApp.lease_duration && (
                  <div>
                    <label className="text-sm text-gray-500">租期</label>
                    <p className="font-medium">{selectedApp.lease_duration} 个月</p>
                  </div>
                )}
                {selectedApp.income && (
                  <div>
                    <label className="text-sm text-gray-500">月收入</label>
                    <p className="font-medium">¥{selectedApp.income}</p>
                  </div>
                )}
              </div>

              {/* Message */}
              {selectedApp.message && (
                <div>
                  <label className="text-sm text-gray-500">租客留言</label>
                  <p className="mt-2 p-3 bg-gray-50 rounded-lg">{selectedApp.message}</p>
                </div>
              )}

              {/* Actions */}
              {selectedApp.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    onClick={() => { setShowDetail(false); setShowQuickResponse(true); }}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
                  >
                    快速处理
                  </button>
                  <button 
                    onClick={() => sendReminder(selectedApp.id)}
                    disabled={sendingNotification}
                    className="px-4 py-3 border rounded-xl hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Bell className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
