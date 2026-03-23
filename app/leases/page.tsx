'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, FileText, Check, X, Calendar, DollarSign } from 'lucide-react'

interface Lease {
  id: string
  property_id: string
  tenant_id: string
  start_date: string
  end_date: string
  rent_amount: number
  deposit_amount: number
  status: string
  created_at: string
  property?: { title: string; city: string }
  tenant?: { phone: string; name: string }
}

export default function LeasesPage() {
  const router = useRouter()
  const [leases, setLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    property_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    rent_amount: '',
    deposit_amount: ''
  })
  const supabase = createClient()

  useEffect(() => {
    fetchLeases()
  }, [])

  async function fetchLeases() {
    const userStr = localStorage.getItem('user')
    if (!userStr) { router.push('/login'); return }
    const user = JSON.parse(userStr)

    const { data } = await supabase
      .from('leases')
      .select('*')
      .eq('landlord_id', user.id)
      .order('created_at', { ascending: false })

    const leasesWithDetails = await Promise.all((data || []).map(async (lease) => {
      const { data: property } = await supabase.from('properties').select('title, city').eq('id', lease.property_id).single()
      const { data: tenant } = await supabase.from('users').select('phone, name').eq('id', lease.tenant_id).single()
      return { ...lease, property, tenant }
    }))

    setLeases(leasesWithDetails)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const userStr = localStorage.getItem('user')
    if (!userStr) return
    const user = JSON.parse(userStr)

    await supabase.from('leases').insert({
      property_id: form.property_id,
      tenant_id: form.tenant_id,
      landlord_id: user.id,
      start_date: form.start_date,
      end_date: form.end_date,
      rent_amount: parseFloat(form.rent_amount),
      deposit_amount: parseFloat(form.deposit_amount),
      status: 'active'
    })

    setShowForm(false)
    fetchLeases()
  }

  // Get properties for dropdown
  const [properties, setProperties] = useState<any[]>([])
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      supabase.from('properties').select('id, title, city').eq('owner_id', user.id).then(({ data }) => {
        setProperties(data || [])
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />返回首页
          </Link>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> 新建租约
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">租约管理</h1>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold mb-4">新建租约</h3>
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
                  <label className="block text-sm font-medium mb-1">开始日期 *</label>
                  <input type="date" required value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">结束日期 *</label>
                  <input type="date" required value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">月租金 *</label>
                  <input type="number" required value={form.rent_amount} onChange={e => setForm({...form, rent_amount: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="¥" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">押金 *</label>
                  <input type="number" required value={form.deposit_amount} onChange={e => setForm({...form, deposit_amount: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="¥" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">创建租约</button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div></div>
        ) : leases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无租约</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leases.map((lease) => (
              <div key={lease.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{lease.property?.title}</h3>
                    <p className="text-gray-500 text-sm">{lease.property?.city}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded ${lease.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {lease.status === 'active' ? '生效中' : lease.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-gray-500">租客:</span> {lease.tenant?.name || lease.tenant?.phone || '-'}</div>
                  <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" /> {lease.start_date} ~ {lease.end_date}</div>
                  <div className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-gray-400" /> ¥{lease.rent_amount}/月</div>
                  <div>押金: ¥{lease.deposit_amount}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
