'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, BarChart3, DollarSign } from 'lucide-react'

interface Expense {
  id: string
  property_id: string
  category: string
  amount: number
  description: string
  expense_date: string
  property?: { title: string }
}

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ property_id: '', category: 'repair', amount: '', description: '', expense_date: '' })
  const supabase = createClient()

  useEffect(() => { fetchExpenses(); fetchProperties(); }, [])

  async function fetchExpenses() {
    const userStr = localStorage.getItem('user')
    if (!userStr) { router.push('/login'); return }
    const user = JSON.parse(userStr)

    const { data: myProperties } = await supabase.from('properties').select('id').eq('owner_id', user.id)
    const propIds = myProperties?.map(p => p.id) || []

    if (propIds.length === 0) {
      setExpenses([])
      setLoading(false)
      return
    }

    const { data } = await supabase.from('expenses').select('*, property:properties(title)').in('property_id', propIds).order('expense_date', { ascending: false })
    setExpenses(data || [])
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
    await supabase.from('expenses').insert({
      property_id: form.property_id,
      category: form.category,
      amount: parseFloat(form.amount),
      description: form.description,
      expense_date: form.expense_date || new Date().toISOString().split('T')[0]
    })
    setShowForm(false)
    setForm({ property_id: '', category: 'repair', amount: '', description: '', expense_date: '' })
    fetchExpenses()
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const categories: Record<string, string> = {
    repair: '维修',
    utility: '水电费',
    cleaning: '清洁',
    insurance: '保险',
    tax: '税费',
    other: '其他'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900"><ArrowLeft className="w-5 h-5 mr-2" />返回首页</Link>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> 添加费用</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">费用报表</h1>

        {/* Summary */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-6 h-6" />
            <span className="opacity-90">总支出</span>
          </div>
          <div className="text-3xl font-bold">¥{totalExpenses.toLocaleString()}</div>
        </div>

        {/* By Category */}
        {Object.keys(byCategory).length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-semibold mb-3">按类别</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(byCategory).map(([cat, amount]) => (
                <div key={cat} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">{categories[cat] || cat}</div>
                  <div className="font-bold">¥{amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold mb-4">添加费用</h3>
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
                  <label className="block text-sm font-medium mb-1">类别</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="repair">维修</option>
                    <option value="utility">水电费</option>
                    <option value="cleaning">清洁</option>
                    <option value="insurance">保险</option>
                    <option value="tax">税费</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">金额 *</label>
                  <input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="¥" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">日期</label>
                <input type="date" value={form.expense_date} onChange={e => setForm({...form, expense_date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="费用说明" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">添加</button>
            </form>
          </div>
        )}

        {loading ? <div className="text-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div></div> : expenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center"><BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">暂无费用记录</p></div>
        ) : (
          <div className="space-y-3">
            {expenses.map((exp) => (
              <div key={exp.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{exp.property?.title}</div>
                  <div className="text-sm text-gray-500">{categories[exp.category] || exp.category} · {exp.description}</div>
                  <div className="text-xs text-gray-400">{exp.expense_date}</div>
                </div>
                <div className="text-lg font-bold text-red-600">-¥{exp.amount}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
