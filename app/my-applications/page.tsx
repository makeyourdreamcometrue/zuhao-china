'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Home, FileText, Clock, Check, X, Building, User } from 'lucide-react'

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
    address: string
    rent: number
    area: number
    rooms: number
    photos: string[]
  }
}

export default function MyApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMyApplications()
  }, [])

  async function fetchMyApplications() {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)

    // Only for tenants
    if (user.role !== 'tenant') {
      alert('此页面仅供租客使用')
      router.push('/dashboard')
      return
    }

    const { data: apps } = await supabase
      .from('applications')
      .select('*')
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false })

    const appsWithDetails = await Promise.all((apps || []).map(async (app) => {
      const { data: property } = await supabase
        .from('properties')
        .select('title, city, address, rent, area, rooms, photos')
        .eq('id', app.property_id)
        .single()

      return { ...app, property }
    }))

    setApplications(appsWithDetails)
    setLoading(false)
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
        <h1 className="text-2xl font-bold mb-6">我的申请</h1>

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
            <FileText className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">暂无申请记录</p>
            <p className="text-gray-400 text-sm mb-4">浏览房源，开始申请租房</p>
            <Link href="/properties" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              浏览房源
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Property Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {app.property?.photos && app.property.photos[0] ? (
                        <img src={app.property.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{app.property?.title}</h3>
                          <p className="text-sm text-gray-500">{app.property?.city} · {app.property?.address}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          app.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {app.status === 'pending' ? '待审核' : app.status === 'approved' ? '已通过' : '已拒绝'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {app.property?.area}㎡ · {app.property?.rooms}室
                        </span>
                        <span className="font-semibold text-red-500">¥{app.property?.rent}/月</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        申请时间: {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Message */}
                  {app.message && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">我的留言:</span> {app.message}
                      </p>
                    </div>
                  )}
                  
                  {/* Status Actions */}
                  {app.status === 'approved' && (
                    <div className="mt-3 pt-3 border-t flex gap-2">
                      <div className="flex-1 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> 申请已通过！请联系房东签约
                      </div>
                    </div>
                  )}
                  
                  {app.status === 'rejected' && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                        <X className="w-4 h-4" /> 很遗憾申请未通过，看看其他房源
                      </div>
                      <Link href="/properties" className="block mt-2 text-center text-sm text-blue-600 hover:underline">
                        浏览更多房源
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
