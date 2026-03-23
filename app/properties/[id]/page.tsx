'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Home, Square, Check } from 'lucide-react'

interface Property {
  id: string
  title: string
  description: string
  address: string
  city: string
  area: number
  rooms: number
  rent: number
  deposit: number
  photos: string[]
  status: string
  owner_id: string
}

interface User {
  id: string
  phone: string
  name?: string
  role: string
}

export default function PropertyDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applicationSent, setApplicationSent] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchProperty() {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .single()
      
      setProperty(data)
      setLoading(false)
    }
    fetchProperty()
  }, [params.id, supabase])

  const handleApply = async () => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user: User = JSON.parse(userStr)

    if (user.role !== 'tenant') {
      alert('只有租客可以申请租房')
      return
    }

    setApplying(true)

    const { error } = await supabase.from('applications').insert({
      property_id: params.id,
      tenant_id: user.id,
      message: message,
      status: 'pending'
    })

    setApplying(false)

    if (error) {
      alert('申请失败: ' + error.message)
    } else {
      setApplicationSent(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">房源不存在</p>
          <Link href="/properties" className="text-blue-600 hover:underline">
            返回房源列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/properties" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </Link>
        </div>
      </header>

      <div className="relative h-64 bg-gray-100">
        {property.photos && property.photos[0] ? (
          <img src={property.photos[0]} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Home className="w-16 h-16" />
          </div>
        )}
        <div className="absolute bottom-4 left-4">
          <span className={`px-3 py-1 text-sm font-medium rounded ${
            property.status === 'available' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
          }`}>
            {property.status === 'available' ? '可租' : '已出租'}
          </span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{property.title}</h1>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-500">
                ¥{property.rent}<span className="text-sm font-normal text-gray-500">/月</span>
              </div>
              <div className="text-sm text-gray-500">押金 ¥{property.deposit}</div>
            </div>
          </div>

          <div className="flex gap-6 text-gray-600 mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />{property.city} · {property.address}
            </span>
            <span className="flex items-center gap-1">
              <Square className="w-4 h-4" />{property.area}㎡
            </span>
            <span className="flex items-center gap-1">
              <Home className="w-4 h-4" />{property.rooms}室
            </span>
          </div>

          {property.description && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">房屋描述</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{property.description}</p>
            </div>
          )}
        </div>

        {property.status === 'available' && !applicationSent && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">申请租房</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="介绍一下自己"
              className="w-full px-4 py-3 border rounded-lg mb-4"
              rows={3}
            />
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {applying ? '提交中...' : '提交申请'}
            </button>
          </div>
        )}

        {applicationSent && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">申请已提交</h3>
            <p className="text-gray-500">房东将会看到您的申请</p>
          </div>
        )}
      </main>
    </div>
  )
}
