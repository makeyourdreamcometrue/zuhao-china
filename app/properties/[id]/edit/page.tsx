'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

export default function EditPropertyPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()
  
  const [form, setForm] = useState({
    title: '', 
    description: '', 
    address: '', 
    city: '北京',
    area: '', 
    rooms: '1', 
    rent: '', 
    deposit: '',
    photos: [] as string[]
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (data) {
        setForm({
          title: data.title || '',
          description: data.description || '',
          address: data.address || '',
          city: data.city || '北京',
          area: data.area?.toString() || '',
          rooms: data.rooms?.toString() || '1',
          rent: data.rent?.toString() || '',
          deposit: data.deposit?.toString() || '',
          photos: data.photos || []
        })
      }
    }
    load()
  }, [params.id, supabase])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    setUploading(true)
    const file = e.target.files[0]
    
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      const newPhotos = [...form.photos, base64]
      setForm({ ...form, photos: newPhotos })
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = (index: number) => {
    const newPhotos = form.photos.filter((_, i) => i !== index)
    setForm({ ...form, photos: newPhotos })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)

    const { error } = await supabase.from('properties').update({
      title: form.title,
      description: form.description,
      address: form.address,
      city: form.city,
      area: parseFloat(form.area) || 0,
      rooms: parseInt(form.rooms) || 1,
      rent: parseFloat(form.rent) || 0,
      deposit: parseFloat(form.deposit) || parseFloat(form.rent) || 0,
      photos: form.photos
    }).eq('id', params.id).eq('owner_id', user.id)

    setLoading(false)
    if (error) {
      alert('更新失败: ' + error.message)
    } else {
      router.push('/properties')
    }
  }

  const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '苏州', '重庆']

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/properties" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />返回房源列表
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">编辑房源</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">房源照片</label>
            <div className="grid grid-cols-3 gap-3">
              {form.photos.map((photo, i) => (
                <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {uploading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div> : <Plus className="w-8 h-8 text-gray-400" />}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">标题 *</label>
            <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-3 border rounded-lg" rows={3} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">地址 *</label>
            <input type="text" required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">城市 *</label>
              <select value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-4 py-3 border rounded-lg">
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">面积 (㎡) *</label>
              <input type="number" required value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">几室 *</label>
            <input type="number" required value={form.rooms} min="1" onChange={e => setForm({...form, rooms: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">月租金 (¥) *</label>
              <input type="number" required value={form.rent} onChange={e => setForm({...form, rent: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">押金 (¥)</label>
              <input type="number" value={form.deposit} onChange={e => setForm({...form, deposit: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50">
            {loading ? '保存中...' : '保存修改'}
          </button>
        </form>
      </div>
    </div>
  )
}
