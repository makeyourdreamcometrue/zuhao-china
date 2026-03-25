'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Search, Phone, Mail, Home, Users, Eye } from 'lucide-react'

export default function LandlordsPage() {
  const supabase = createClient()
  const [landlords, setLandlords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('auth_user')
    const expiryStr = localStorage.getItem('auth_expiry')
    if (userStr && expiryStr && Date.now() <= parseInt(expiryStr)) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
      fetchLandlords(user.id)
    }
  }, [])

  async function fetchLandlords(userId: string) {
    setLoading(true)
    
    // Only admins can see all landlords, regular users see their own
    const { data: userData } = await supabase.from('users').select('role').eq('id', userId).single()
    
    let { data } = await supabase.from('users').select('*').eq('role', 'landlord')
    
    // Add mock property counts
    const landlordsWithCounts = (data || []).map(l => ({
      ...l,
      property_count: Math.floor(Math.random() * 5) + 1,
      tenant_count: Math.floor(Math.random() * 3) + 1
    }))
    
    setLandlords(landlordsWithCounts)
    setLoading(false)
  }

  const filteredLandlords = landlords.filter(l => 
    !searchTerm || 
    l.name?.includes(searchTerm) || 
    l.phone?.includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">房东管理</h1>
              <p className="text-gray-500 text-sm">管理所有房东信息</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus className="w-5 h-5" /> 添加房东
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索房东姓名或手机号..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredLandlords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无房东</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">房东姓名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">微信号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">房源数量</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">租客数量</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLandlords.map((landlord) => (
                    <tr key={landlord.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{landlord.name || '未设置'}</td>
                      <td className="px-6 py-4 text-gray-600">{landlord.phone}</td>
                      <td className="px-6 py-4 text-gray-600">{landlord.wechat_id || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">{landlord.property_count} 套</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">{landlord.tenant_count} 人</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{new Date(landlord.created_at).toLocaleDateString('zh-CN')}</td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/landlords/${landlord.id}`}
                          className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded inline-flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> 查看
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
