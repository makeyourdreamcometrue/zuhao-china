'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Search, MapPin, Home, Filter, X, SlidersHorizontal, Building, DollarSign, User, ArrowRight, Sparkles } from 'lucide-react'

interface Property {
  id: string
  title: string
  address: string
  city: string
  area: number
  rooms: number
  rent: number
  deposit: number
  photos: string[]
  status: string
}

const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '苏州', '重庆']

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [roomsFilter, setRoomsFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    const { data } = await query
    setProperties(data || [])
    setLoading(false)
  }

  const filteredProperties = properties.filter(p => {
    const matchesSearch = !searchTerm || 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.includes(searchTerm)
    
    const matchesCity = !cityFilter || p.city === cityFilter
    const matchesRooms = !roomsFilter || p.rooms >= parseInt(roomsFilter)
    const matchesPriceMin = !priceMin || p.rent >= parseInt(priceMin)
    const matchesPriceMax = !priceMax || p.rent <= parseInt(priceMax)
    
    return matchesSearch && matchesCity && matchesRooms && matchesPriceMin && matchesPriceMax
  })

  const clearFilters = () => {
    setSearchTerm('')
    setCityFilter('')
    setPriceMin('')
    setPriceMax('')
    setRoomsFilter('')
  }

  const hasFilters = searchTerm || cityFilter || priceMin || priceMax || roomsFilter

  // Check if user is logged in
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h1 className="text-xl lg:text-2xl font-bold">房源列表</h1>
            <div className="flex gap-3">
              {user?.role === 'landlord' && (
                <Link 
                  href="/properties/new" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                  <Plus className="w-5 h-5" /> 
                  <span className="hidden sm:inline">发布房源</span>
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索城市、区域、小区..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-xl flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'hover:bg-gray-50'}`}
            >
              <SlidersHorizontal className="w-5 h-5" /> 
              <span className="hidden sm:inline">筛选</span>
              {hasFilters && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">城市</label>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                  >
                    <option value="">全部城市</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最低租金</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="最低"
                      className="w-full pl-8 pr-4 py-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最高租金</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="最高"
                      className="w-full pl-8 pr-4 py-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">几室</label>
                  <select
                    value={roomsFilter}
                    onChange={(e) => setRoomsFilter(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                  >
                    <option value="">不限</option>
                    <option value="1">1室及以上</option>
                    <option value="2">2室及以上</option>
                    <option value="3">3室及以上</option>
                    <option value="4">4室及以上</option>
                  </select>
                </div>
              </div>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> 清除筛选
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-gray-500">
          {loading ? '加载中...' : (
            <>
              找到 <span className="font-semibold text-gray-900">{filteredProperties.length}</span> 个房源
              {hasFilters && <span className="ml-2 text-sm">(筛选结果)</span>}
            </>
          )}
        </p>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">加载中...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            {hasFilters ? (
              <>
                <Search className="w-20 h-20 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">没有找到匹配的房源</p>
                <p className="text-gray-400 text-sm mb-4">试试调整筛选条件</p>
                <button onClick={clearFilters} className="text-blue-600 hover:underline">清除筛选</button>
              </>
            ) : (
              <>
                <Home className="w-20 h-20 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">暂无房源</p>
                <p className="text-gray-400 text-sm mb-4">成为房东，发布您的第一个房源</p>
                {user?.role === 'landlord' ? (
                  <Link href="/properties/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    <Plus className="w-5 h-5" /> 发布房源
                  </Link>
                ) : !user ? (
                  <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    登录成为房东
                  </Link>
                ) : null}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`} className="block bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden group">
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {property.photos && property.photos[0] ? (
                    <img 
                      src={property.photos[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
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
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-500 text-sm mt-2">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{property.city} · {property.address}</span>
                  </div>
                  
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {property.area}㎡
                    </span>
                    <span className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      {property.rooms}室
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold text-red-500">
                        ¥{property.rent.toLocaleString()}
                      </span>
                      <span className="text-sm font-normal text-gray-500">/月</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Tips for users */}
        {!loading && filteredProperties.length > 0 && !user && (
          <div className="mt-8 bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">登录后可以申请租房</p>
              <p className="text-sm text-blue-600">登录后可联系房东、提交申请</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
