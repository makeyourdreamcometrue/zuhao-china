'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Wrench, Check, Clock, AlertCircle } from 'lucide-react'

interface Maintenance {
  id: string
  property_id: string
  description: string
  status: string
  created_at: string
  property?: { title: string }
}

export default function MaintenancePage() {
  const router = useRouter()
  const [requests, setRequests] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [form, setForm] = useState({ property_id: '', description: '' })
  const supabase = createClient()

  useEffect(() => { fetchRequests(); fetchProperties(); }, [])

  async function fetchRequests() {
    const userStr = localStorage.getItem('user')
    if (!userStr) { router.push('/login'); return }
    const user = JSON.parse(userStr)

    // For landlords, show all maintenance requests for their properties
    const { data: myProperties } = await supabase.from('properties').select('id').eq('owner_id', user.id)
    const propIds = myProperties?.map(p => p.id) || []

    if (propIds.length === 0) {
      setRequests([])
      setLoading(false)
      return
    }

    const { data } = await supabase.from('maintenance').select('*, property:properties(title)').in('property_id', propIds).order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  async function fetchProperties() {
    const userStr = localStorage.getItem('user')
    if (!userStr) return
    const user = JSON.parse(userStr)
    const { data } = await supabase.from('properties').select('id, title').eq('owner_id', user.id)
    setProperties(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const userStr = localStorage.getItem('user')
    if (!userStr) return
    const user = JSON.parse(userStr)

    await supabase.from('maintenance').insert({
      property_id: form.property_id,
      reporter_id: user.id,
      description: form.description,
      status: 'pending'
    })
    setShowForm(false)
    setForm({ property_id: '', description: '' })
    fetchRequests()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('maintenance').update({ status }).eq('id', id)
    fetchRequests()
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900"><ArrowLeft className="w-5 h-5 mr-2" />返回首页</Link>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> 报修</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">维修工单</h1>

        {pendingCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">有 {pendingCount} 个待处理维修请求</span>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold mb-4">提交报修</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">房源 *</label>
                <select required value={form.property_id} onChange={e => setForm({...form, property_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">选择房源</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">问题描述 *</label>
                <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" rows={3} placeholder="请描述需要维修的问题..." />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">提交</button>
            </form>
          </div>
        )}

        {loading ? <div className="text-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div></div> : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center"><Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">暂无维修工单</p></div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{req.property?.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{req.description}</div>
                    <div className="text-xs text-gray-400 mt-2">{new Date(req.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded ${
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {req.status === 'pending' ? '待处理' : req.status === 'in_progress' ? '处理中' : '已完成'}
                  </span>
                </div>
                {req.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => updateStatus(req.id, 'in_progress')} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm">开始处理</button>
                    <button onClick={() => updateStatus(req.id, 'completed')} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm">完成</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
