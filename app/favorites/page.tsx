'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Heart, Home, MapPin, User, ArrowRight, Trash2, Loader2 } from 'lucide-react'

interface Property {
  id: string
  title: string
  address: string
  city: string
  area: number
  rooms: number
  rent: number
  photos: string[]
}

export default function FavoritesPage() {
  const supabase = createClient()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  async function fetchFavorites() {
    setLoading(true)
    const stored = localStorage.getItem('user_favorites')
    const favoriteIds: string[] = stored ? JSON.parse(stored) : []

    if (favoriteIds.length === 0) {
      setProperties([])
      setLoading(false)
      return
    }

    // Fetch all properties and filter
    const { data: allProperties } = await supabase.from('properties').select('*')
    
    const favorites = (allProperties || []).filter(p => favoriteIds.includes(p.id))
    setProperties(favorites)
    setLoading(false)
  }

  function removeFavorite(id: string) {
    const stored = localStorage.getItem('user_favorites')
    const favorites: string[] = stored ? JSON.parse(stored) : []
    const updated = favorites.filter(fid => fid !== id)
    localStorage.setItem('user_favorites', JSON.stringify(updated))
    setProperties(properties.filter(p => p.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            我的收藏
          </h1>
          <p className="text-gray-500">您收藏的房源</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {properties.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">暂无收藏房源</p>
            <Link href="/properties" className="text-blue-600 hover:underline">
              去浏览房源 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="relative h-48 bg-gray-200">
                  {property.photos?.[0] ? (
                    <img src={property.photos[0]} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <button
                    onClick={() => removeFavorite(property.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 truncate">{property.title}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{property.city} · {property.area}㎡ · {property.rooms}室</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">¥{property.rent}<span className="text-sm text-gray-400 font-normal">/月</span></span>
                    <Link href={`/properties/${property.id}`} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                      查看 <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
