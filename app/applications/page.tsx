'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, FileText, Check, X, Calendar, DollarSign, User, Home, Clock, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react'

interface Application {
  id: string
  property_id: string
  tenant_id: string
  status: string
  message: string
  created_at: string
  property?: {
    title: string
    city: string
    rent: number
    address: string
  }
  tenant?: {
    phone: string
    name: string
  }
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)

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

    const { data: apps } = await supabase
      .from('applications')
      .select('*')
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false })

    const appsWithDetails = await Promise.all((apps || []).map(async (app) => {
      const { data: property } = await supabase
        .from('properties')
        .select('title, city, rent, address')
        .eq('id', app.property_id)
        .single()
      
      const { data: tenant } = await supabase
        .from('users')
        .select('phone, name')
        .eq('id', app.tenant_id)
        .single()

      return { ...app, property, tenant }
    }))

    setApplications(appsWithDetails)
    setLoading(false)
  }

  async function handleStatus(applicationId: string, newStatus: 'approved' | 'rejected') {
    await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId)

    // If approved, create a lease
    if (newStatus === 'approved') {
      const app = applications.find(a => a.id === applicationId)
      if (app) {
        const startDate = new Date()
        const endDate = new Date()
        endDate.setFullYear(endDate.getFullYear() + 1)
        
        await supabase.from('leases').insert({
          property_id: app.property_id,
          tenant_id: app.tenant_id,
          landlord_id: JSON.parse(localStorage.getItem('user') || '{}').id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          rent_amount: app.property?.rent || 0,
          deposit_amount: app.property?.rent || 0,
          status: 'active'
        })
        
        // Update property status
        await supabase.from('properties').update({ status: 'rented' }).eq('id', app.property_id)
      }
    }

    fetchApplications()
    setShowDetail(false)
    setSelectedApp(null)
  }

  const pendingApps = applications.filter(a => a.status === 'pending')
  const approvedApps = applications.filter(a => a.status === 'approved')
  const rejectedApps = applications.filter(a => a.status === 'rejected')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">租房申请</h1>
          <div className="text-sm text-gray-500">
            {pendingApps.length} 条待处理
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingApps.length}</div>
            <div className="text-sm text-yellow-600">待审核</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{approvedApps.length}</div>
            <div className="text-sm text-green-600">已通过</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{rejectedApps.length}</div>
            <div className="text-sm text-red-600">已拒绝</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <User className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">暂无租房申请</p>
            <p className="text-gray-400 text-sm">发布房源后，租客将在这里申请</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending First */}
            {[...pendingApps, ...approvedApps, ...rejectedApps].map((app) => (
              <div 
                key={app.id} 
                onClick={() => { setSelectedApp(app); setShowDetail(true); }}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{app.property?.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {app.status === 'pending' ? '待审核' : app.status === 'approved' ? '已通过' : '已拒绝'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">{app.property?.city} · {app.property?.address}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {app.tenant?.name || app.tenant?.phone || '未设置'}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ¥{app.property?.rent}/月
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-500">¥{app.property?.rent}</div>
                    <div className="text-xs text-gray-400">/月</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {showDetail && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">申请详情</h2>
                <button onClick={() => { setShowDetail(false); setSelectedApp(null); }}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium mb-2">房源信息</h3>
                  <p className="text-gray-600">{selectedApp.property?.title}</p>
                  <p className="text-sm text-gray-500">{selectedApp.property?.city} · {selectedApp.property?.address}</p>
                  <p className="text-lg font-bold text-red-500 mt-2">¥{selectedApp.property?.rent}/月</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium mb-2">租客信息</h3>
                  <p className="text-gray-600">姓名: {selectedApp.tenant?.name || '未设置'}</p>
                  <p className="text-gray-600">手机: {selectedApp.tenant?.phone}</p>
                </div>

                {selectedApp.message && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-medium mb-2">租客留言</h3>
                    <p className="text-gray-600">{selectedApp.message}</p>
                  </div>
                )}

                {selectedApp.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleStatus(selectedApp.id, 'approved')}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" /> 通过并创建租约
                    </button>
                    <button
                      onClick={() => handleStatus(selectedApp.id, 'rejected')}
                      className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" /> 拒绝
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
