'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

export default function NewPropertyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    setUploading(true)
    const file = e.target.files[0]
    
    // Use base64 for demo (in production, use Supabase Storage or 阿里云OSS)
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
    
    const supabase = createClient()
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)

    const { error } = await supabase.from('properties').insert({
      owner_id: user.id,
      title: form.title,
      description: form.description,
      address: form.address,
      city: form.city,
      area: parseFloat(form.area) || 0,
      rooms: parseInt(form.rooms) || 1,
      rent: parseFloat(form.rent) || 0,
      deposit: parseFloat(form.deposit) || parseFloat(form.rent) || 0,
      photos: form.photos,
      status: 'available'
    })

    setLoading(false)
    if (error) {
      alert('提交失败: ' + error.message)
    } else {
      router.push('/properties')
    }
  }

  const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '苏州', '重庆']

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">发布新房源</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          {/* Photos */}
          <div>
            <label className="block text-sm font-medium mb-2">房源照片</label>
            <div className="grid grid-cols-3 gap-3">
              {form.photos.map((photo, i) => (
                <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                ) : (
                  <Plus className="w-8 h-8 text-gray-400" />
                )}
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">点击上传房源照片 (最多9张)</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">标题 *</label>
            <input 
              type="text" 
              required 
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg" 
              placeholder="例如: 国贸CBD精装修两居室" 
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea 
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg" 
              rows={3} 
              placeholder="描述房屋特点、配套设施..." 
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1">地址 *</label>
            <input 
              type="text" 
              required 
              value={form.address}
              onChange={e => setForm({...form, address: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg" 
              placeholder="详细地址" 
            />
          </div>

          {/* City & Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">城市 *</label>
              <select 
                value={form.city} 
                onChange={e => setForm({...form, city: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg"
              >
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">面积 (㎡) *</label>
              <input 
                type="number" 
                required 
                value={form.area}
                onChange={e => setForm({...form, area: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg" 
                placeholder="如: 80" 
              />
            </div>
          </div>

          {/* Rooms */}
          <div>
            <label className="block text-sm font-medium mb-1">几室 *</label>
            <input 
              type="number" 
              required 
              value={form.rooms}
              min="1"
              onChange={e => setForm({...form, rooms: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg" 
              placeholder="如: 2" 
            />
          </div>

          {/* Rent & Deposit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">月租金 (¥) *</label>
              <input 
                type="number" 
                required 
                value={form.rent}
                onChange={e => setForm({...form, rent: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg" 
                placeholder="如: 5000" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">押金 (¥)</label>
              <input 
                type="number" 
                value={form.deposit}
                onChange={e => setForm({...form, deposit: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg" 
                placeholder="默认等于月租金" 
              />
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700 transition"
          >
            {loading ? '提交中...' : '发布房源'}
          </button>
        </form>
      </div>
    </div>
  )
}
