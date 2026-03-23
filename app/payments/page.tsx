'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, DollarSign, Check, Clock, AlertCircle } from 'lucide-react'

interface Payment {
  id: string
  lease_id: string
  amount: number
  type: string
  status: string
  due_date: string
  paid_at: string
  description: string
  lease?: { property?: { title: string } }
}

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [leases, setLeases] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ lease_id: '', amount: '', type: 'rent', due_date: '', description: '' })
  const supabase = createClient()

  useEffect(() => {
    fetchPayments()
    fetchLeases()
  }, [])

  async function fetchPayments() {
    const userStr = localStorage.getItem('user')
    if (!userStr) { router.push('/login'); return }
    const user = JSON.parse(userStr)

    const { data } = await supabase.from('leases').select('id, property_id, property:properties(title)').eq('landlord_id', user.id)
    const leaseIds = data?.map(l => l.id) || []
    
    if (leaseIds.length === 0) {
      setPayments([])
      setLoading(false)
      return
    }

    const { data: pays } = await supabase.from('payments').select('*, lease:leases(property:properties(title))').in('lease_id', leaseIds).order('due_date', { ascending: false })
    setPayments(pays || [])
    setLoading(false)
  }

  async function fetchLeases() {
    const userStr = localStorage.getItem('user')
    if (!userStr) return
    const user = JSON.parse(userStr)
    const { data } = await supabase.from('leases').select('id, property:properties(title)').eq('landlord_id', user.id).eq('status', 'active')
    setLeases(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('payments').insert(form)
    setShowForm(false)
    fetchPayments()
  }

  async function markAsPaid(paymentId: string) {
    await supabase.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', paymentId)
    fetchPayments()
  }

  const pendingTotal = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  const paidTotal = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900"><ArrowLeft className="w-5 h-5 mr-2" />返回首页</Link>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> 添加账单</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">租金管理</h1>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1"><Clock className="w-5 h-5 text-yellow-600" /><span className="text-yellow-800">待收租金</span></div>
            <div className="text-2xl font-bold text-yellow-800">¥{pendingTotal.toLocaleString()}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1"><Check className="w-5 h-5 text-green-600" /><span className="text-green-800">已收租金</span></div>
            <div className="text-2xl font-bold text-green-800">¥{paidTotal.toLocaleString()}</div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold mb-4">添加账单</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">租约 *</label>
                <select required value={form.lease_id} onChange={e => setForm({...form, lease_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">选择租约</option>
                  {leases.map(l => <option key={l.id} value={l.id}>{l.property?.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">金额 *</label>
                  <input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">类型</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="rent">租金</option>
                    <option value="deposit">押金</option>
                    <option value="utility">水电费</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">到期日期 *</label>
                <input type="date" required value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">添加</button>
            </form>
          </div>
        )}

        {loading ? <div className="text-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div></div> : payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center"><DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">暂无账单</p></div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{payment.lease?.property?.title}</div>
                  <div className="text-sm text-gray-500">{payment.type === 'rent' ? '租金' : payment.type === 'deposit' ? '押金' : payment.type === 'utility' ? '水电费' : '其他'} · 到期: {payment.due_date}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">¥{payment.amount}</div>
                  {payment.status === 'pending' ? (
                    <button onClick={() => markAsPaid(payment.id)} className="text-sm text-blue-600 hover:underline">确认收款</button>
                  ) : (
                    <div className="text-sm text-green-600">已收</div>
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
