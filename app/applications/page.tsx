'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, X, User, Home, Clock, MessageSquare } from 'lucide-react'

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

    // Get my properties
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

    // Get applications for my properties
    const { data: apps } = await supabase
      .from('applications')
      .select('*')
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false })

    // Get property and tenant details
    const appsWithDetails = await Promise.all((apps || []).map(async (app) => {
      const { data: property } = await supabase
        .from('properties')
        .select('title, city, rent')
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

    fetchApplications()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">租房申请</h1>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无租房申请</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{app.property?.title}</h3>
                    <p className="text-gray-500 text-sm">{app.property?.city} · ¥{app.property?.rent}/月</p>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.status === 'pending' ? '待审核' : app.status === 'approved' ? '已通过' : '已拒绝'}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">申请人: {app.tenant?.name || app.tenant?.phone}</span>
                  </div>
                  {app.message && (
                    <div className="flex items-start gap-2 mb-4">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                      <p className="text-sm text-gray-600">{app.message}</p>
                    </div>
                  )}
                  
                  {app.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStatus(app.id, 'approved')}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> 通过
                      </button>
                      <button
                        onClick={() => handleStatus(app.id, 'rejected')}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" /> 拒绝
                      </button>
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
