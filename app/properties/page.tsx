'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Search, MapPin, Home, Filter, Square } from 'lucide-react'

interface Property {
  id: string
  title: string
  address: string
  city: string
  area: number
  rooms: number
  rent: number
  photos: string[]
  status: string
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProperties() {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
      
      setProperties(data || [])
      setLoading(false)
    }
    fetchProperties()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">租好 - 房源</h1>
          <Link 
            href="/properties/new" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> 发布房源
          </Link>
        </div>
      </header>

      {/* Search */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索城市、区域、小区..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
            <Filter className="w-4 h-4" /> 筛选
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-3">加载中...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-10">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">暂无房源</p>
            <Link href="/properties/new" className="text-blue-600 hover:underline">
              发布第一个房源
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`} className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {property.photos && property.photos[0] ? (
                    <img 
                      src={property.photos[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Home className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      property.status === 'available' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {property.status === 'available' ? '可租' : '已出租'}
                    </span>
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                  
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="line-clamp-1">{property.city} · {property.address}</span>
                  </div>
                  
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Square className="w-4 h-4 mr-1" />
                      {property.area}㎡
                    </span>
                    <span className="flex items-center">
                      <Home className="w-4 h-4 mr-1" />
                      {property.rooms}室
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-xl font-bold text-red-500">
                      ¥{property.rent}
                      <span className="text-sm font-normal text-gray-500">/月</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
