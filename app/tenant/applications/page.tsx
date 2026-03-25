'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Home, FileText, Clock, Check, X, Building, User,
  Send, CheckCircle, AlertCircle, MessageSquare, Bell, Shield,
  Calendar, DollarSign, Eye, EyeOff, Phone, Mail, UserCheck,
  Briefcase, CreditCard, Building2, ArrowRight, RefreshCw
} from 'lucide-react'

interface Application {
  id: string
  property_id: string
  tenant_id: string
  status: string
  message: string
  created_at: string
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
    owner_id?: string
  }
}

interface LandlordNotification {
  id: string
  application_id: string
  type: 'new_application' | 'tenant_response' | 'reminder' | 'status_update'
  message: string
  created_at: string
  read: boolean
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: '待审核', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
  reviewing: { label: '审核中', color: 'text-blue-600', bg: 'bg-blue-50', icon: Eye },
  approved: { label: '已通过', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  rejected: { label: '已拒绝', color: 'text-red-600', bg: 'bg-red-50', icon: X },
  withdrawn: { label: '已撤回', color: 'text-gray-600', bg: 'bg-gray-50', icon: ArrowLeft },
}

// Quick response templates
const RESPONSE_TEMPLATES = {
  approve: {
    title: '申请通过',
    message: '恭喜！您的租房申请已通过审核，请尽快与我们联系完成签约。'
  },
  reject: {
    title: '申请未通过',
    message: '抱歉，您的租房申请未通过审核，欢迎查看其他房源。'
  },
  review: {
    title: '补充材料',
    message: '请补充以下材料：身份证、收入证明，以便我们更快审核您的申请。'
  },
  contact: {
    title: '需要沟通',
    message: '我们想与您进一步沟通申请细节，请回复。'
  }
}

export default function MyApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [autoCheckStatus, setAutoCheckStatus] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchMyApplications()
  }, [])

  async function fetchMyApplications() {
    const userStr = localStorage.getItem('auth_user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)

    // Get applications with property details
    const { data: apps } = await supabase
      .from('applications')
      .select('*')
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false })

    // Enrich with property details
    const appsWithDetails = await Promise.all((apps || []).map(async (app) => {
      const { data: property } = await supabase
        .from('properties')
        .select('title, city, address, rent, area, rooms, photos, owner_id')
        .eq('id', app.property_id)
        .single()

      return { ...app, property }
    }))

    setApplications(appsWithDetails)
    setLoading(false)
  }

  // Send message to landlord
  async function sendMessage(appId: string, message: string) {
    setSendingMessage(true)
    
    const userStr = localStorage.getItem('auth_user')
    const user = userStr ? JSON.parse(userStr) : null
    
    // Create notification for landlord
    await supabase.from('notifications').insert({
      user_id: applications.find(a => a.id === appId)?.property?.owner_id,
      title: '租客回复',
      content: `${user?.name || '租客'} 回复了您的房源申请: ${message}`,
      type: 'tenant_response',
      sender_id: user?.id
    })
    
    setSendingMessage(false)
    alert('消息已发送！')
  }

  // Withdraw application
  async function withdrawApplication(appId: string) {
    if (!confirm('确定要撤回此申请吗？')) return
    
    await supabase
      .from('applications')
      .update({ status: 'withdrawn' })
      .eq('id', appId)
    
    fetchMyApplications()
    setShowDetail(false)
  }

  // Auto-check documents (simulated)
  async function checkDocuments(appId: string) {
    setAutoCheckStatus(true)
    
    // Simulate document verification
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    await supabase
      .from('applications')
      .update({ documents_verified: true })
      .eq('id', appId)
    
    fetchMyApplications()
    setAutoCheckStatus(false)
  }

  // Filter applications
  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  const getStatusConfig = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.pending

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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/tenant" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">我的申请</h1>
                <p className="text-gray-500 text-sm">追踪您的租房申请状态</p>
              </div>
            </div>
            <Link href="/properties" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" /> 新建申请
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-6 overflow-x-auto">
            <button onClick={() => setFilter('all')} className={`flex items-center gap-2 whitespace-nowrap pb-2 border-b-2 ${filter === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
              全部 <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{stats.total}</span>
            </button>
            <button onClick={() => setFilter('pending')} className={`flex items-center gap-2 whitespace-nowrap pb-2 border-b-2 ${filter === 'pending' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500'}`}>
              待审核 <span className="bg-yellow-100 px-2 py-0.5 rounded-full text-xs">{stats.pending}</span>
            </button>
            <button onClick={() => setFilter('approved')} className={`flex items-center gap-2 whitespace-nowrap pb-2 border-b-2 ${filter === 'approved' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`}>
              已通过 <span className="bg-green-100 px-2 py-0.5 rounded-full text-xs">{stats.approved}</span>
            </button>
            <button onClick={() => setFilter('rejected')} className={`flex items-center gap-2 whitespace-nowrap pb-2 border-b-2 ${filter === 'rejected' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500'}`}>
              已拒绝 <span className="bg-red-100 px-2 py-0.5 rounded-full text-xs">{stats.rejected}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Timeline View */}
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无申请记录</h3>
            <p className="text-gray-500 mb-6">开始浏览房源，创建您的第一个租房申请</p>
            <Link href="/properties" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
              <Building className="w-5 h-5" /> 浏览房源
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => {
              const statusConfig = getStatusConfig(app.status)
              const StatusIcon = statusConfig.icon
              
              return (
                <div key={app.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6">
                  <div className="flex gap-4">
                    {/* Property Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                      {app.property?.photos?.[0] ? (
                        <img src={app.property.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg truncate">{app.property?.title || '房源'}</h3>
                          <p className="text-gray-500 text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> {app.property?.city} · {app.property?.address}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4" /> {statusConfig.label}
                        </span>
                      </div>
                      
                      {/* Timeline */}
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <div className={`flex items-center gap-1 ${app.status !== 'pending' ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircle className="w-4 h-4" />
                          <span>已提交</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                        <div className={`flex items-center gap-1 ${['reviewing', 'approved', 'rejected'].includes(app.status) ? 'text-blue-600' : 'text-gray-400'}`}>
                          <Eye className="w-4 h-4" />
                          <span>审核中</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                        <div className={`flex items-center gap-1 ${app.status === 'approved' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-gray-400'}`}>
                          {app.status === 'approved' ? <CheckCircle className="w-4 h-4" /> : app.status === 'rejected' ? <X className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          <span>{statusConfig.label}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => { setSelectedApp(app); setShowDetail(true); }}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          查看详情
                        </button>
                        {app.status === 'pending' && (
                          <button 
                            onClick={() => withdrawApplication(app.id)}
                            className="text-gray-500 text-sm hover:text-red-600"
                          >
                            撤回申请
                          </button>
                        )}
                        {app.status === 'approved' && (
                          <Link href={`/leases?application=${app.id}`} className="text-green-600 text-sm hover:underline flex items-center gap-1">
                            签约 <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

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
              {/* Property Info */}
              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedApp.property?.title}</h3>
                  <p className="text-sm text-gray-500">{selectedApp.property?.city} · {selectedApp.property?.address}</p>
                  <p className="text-blue-600 font-semibold mt-1">¥{selectedApp.property?.rent}/月</p>
                </div>
              </div>
              
              {/* Status */}
              <div>
                <label className="text-sm text-gray-500">申请状态</label>
                <div className="mt-2">
                  {(() => {
                    const config = getStatusConfig(selectedApp.status)
                    const Icon = config.icon
                    return (
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${config.bg} ${config.color}`}>
                        <Icon className="w-5 h-5" /> {config.label}
                      </span>
                    )
                  })()}
                </div>
              </div>
              
              {/* Application Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">申请时间</label>
                  <p className="font-medium">{new Date(selectedApp.created_at).toLocaleDateString('zh-CN')}</p>
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
              
              {/* Documents Status */}
              <div>
                <label className="text-sm text-gray-500">材料认证</label>
                <div className="mt-2 flex items-center gap-2">
                  {selectedApp.documents_verified ? (
                    <span className="flex items-center gap-2 text-green-600">
                      <Shield className="w-5 h-5" /> 已认证
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-yellow-600">
                      <AlertCircle className="w-5 h-5" /> 待认证
                    </span>
                  )}
                </div>
              </div>
              
              {/* Message */}
              {selectedApp.message && (
                <div>
                  <label className="text-sm text-gray-500">申请留言</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedApp.message}</p>
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedApp.status === 'pending' && (
                  <button 
                    onClick={() => {
                      const template = RESPONSE_TEMPLATES.review
                      sendMessage(selectedApp.id, template.message)
                    }}
                    disabled={sendingMessage}
                    className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> 补充材料
                  </button>
                )}
                {selectedApp.status === 'approved' && (
                  <Link 
                    href={`/leases?application=${selectedApp.id}`}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> 立即签约
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Plus(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> }
function MapPin(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> }
