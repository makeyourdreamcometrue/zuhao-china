'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, CheckCircle, Calendar, Clipboard } from 'lucide-react'

interface Inspection {
  id: string
  property_id: string
  inspection_type: string
  status: string
  scheduled_date: string
  notes: string
  property?: { title: string }
}

export default function InspectionsPage() {
  const router = useRouter()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ property_id: '', inspection_type: 'routine', scheduled_date: '', notes: '' })
  const supabase = createClient()

  useEffect(() => { fetchInspections(); fetchProperties(); }, [])

  async function fetchInspections() {
    const userStr = localStorage.getItem('user')
    if (!userStr) { router.push('/login'); return }
    const { data } = await supabase.from('inspections').select('*, property:properties(title)').order('scheduled_date', { ascending: false })
    setInspections(data || [])
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
    await supabase.from('inspections').insert(form)
    setShowForm(false)
    fetchInspections()
  }

  async function completeInspection(id: string) {
    await supabase.from('inspections').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id)
    fetchInspections()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900"><ArrowLeft className="w-5 h-5 mr-2" />返回首页</Link>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> 预约检查</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">房屋检查</h1>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold mb-4">预约检查</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">房源 *</label>
                <select required value={form.property_id} onChange={e => setForm({...form, property_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">选择房源</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">检查类型</label>
                  <select value={form.inspection_type} onChange={e => setForm({...form, inspection_type: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="routine">定期检查</option>
                    <option value="move_in">入住检查</option>
                    <option value="move_out">退房检查</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">预约日期 *</label>
                  <input type="date" required value={form.scheduled_date} onChange={e => setForm({...form, scheduled_date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">预约</button>
            </form>
          </div>
        )}

        {loading ? <div className="text-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div></div> : inspections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center"><Clipboard className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">暂无检查记录</p></div>
        ) : (
          <div className="space-y-3">
            {inspections.map((insp) => (
              <div key={insp.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{insp.property?.title}</div>
                    <div className="text-sm text-gray-500">
                      {insp.inspection_type === 'routine' ? '定期检查' : insp.inspection_type === 'move_in' ? '入住检查' : '退房检查'} · {insp.scheduled_date}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded ${insp.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {insp.status === 'completed' ? '已完成' : '待检查'}
                  </span>
                </div>
                {insp.status !== 'completed' && (
                  <button onClick={() => completeInspection(insp.id)} className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> 完成检查
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
