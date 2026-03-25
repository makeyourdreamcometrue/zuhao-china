'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, MapPin, Home, Building, User, Shield, CreditCard, FileText, 
  ArrowRight, Menu, X, ChevronDown, Check, Train, Ruler, Home as HomeIcon,
  Calculator, Clipboard, Users, Star, Heart, Phone, Clock, Verified,
  ArrowLeft, ArrowRight as ArrowRightIcon
} from 'lucide-react'

// Mock data
const FEATURED_LISTINGS = [
  { id: 1, title: '天河CBD精装两房', price: 4500, area: 85, rooms: 2, halls: 1, address: '天河区珠江新城', tags: ['近地铁', '精装', '首次出租'], image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop' },
  { id: 2, title: '海珠区南向三房', price: 5200, area: 120, rooms: 3, halls: 2, address: '海珠区江南西', tags: ['南向', '电梯', '配套齐全'], image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop' },
  { id: 3, title: '越秀区学区房出租', price: 3800, area: 65, rooms: 2, halls: 1, address: '越秀区东山口', tags: ['学区房', '近学校', '交通便利'], image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop' },
  { id: 4, title: '番禺广场地铁口公寓', price: 2800, area: 45, rooms: 1, halls: 1, address: '番禺区番禺广场', tags: ['地铁口', '单间', '拎包入住'], image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&h=300&fit=crop' },
  { id: 5, title: '荔湾区老城区步梯', price: 2200, area: 55, rooms: 1, halls: 1, address: '荔湾区中山八', tags: ['老城区', '步梯', '生活便利'], image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop' },
]

const POPULAR_AREAS = [
  { name: '天河区', count: 1250, image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=300&h=200&fit=crop' },
  { name: '海珠区', count: 980, image: 'https://images.unsplash.com/photo-1559599238-308793637427?w=300&h=200&fit=crop' },
  { name: '越秀区', count: 856, image: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=300&h=200&fit=crop' },
  { name: '番禺区', count: 724, image: 'https://images.unsplash.com/photo-1512918760532-3ed46f4dd3b1?w=300&h=200&fit=crop' },
]

const QUICK_ACTIONS = [
  { icon: Search, label: '找租房', desc: '海量房源', color: 'bg-blue-500' },
  { icon: MapPin, label: '地图找房', desc: '可视化的', color: 'bg-green-500' },
  { icon: Users, label: '找经纪人', desc: '专业服务', color: 'bg-purple-500' },
  { icon: Building, label: '我要出租', desc: '当房东', color: 'bg-orange-500' },
  { icon: FileText, label: '租约合同', desc: '电子签约', color: 'bg-cyan-500' },
  { icon: Calculator, label: '租金计算', desc: '便捷工具', color: 'bg-pink-500' },
]

const PRICE_RANGES = [
  { label: '不限', value: 'all' },
  { label: '¥2000以下', value: '0-2000' },
  { label: '¥2000-4000', value: '2000-4000' },
  { label: '¥4000-6000', value: '4000-6000' },
  { label: '¥6000-8000', value: '6000-8000' },
  { label: '¥8000以上', value: '8000+' },
]

const ROOM_TYPES = [
  { label: '不限', value: 'all' },
  { label: '整租', value: 'entire' },
  { label: '合租', value: 'shared' },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'rent' | 'map'>('rent')
  const [selectedPrice, setSelectedPrice] = useState('all')
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = () => {
    // Navigate to properties with filters
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedPrice !== 'all') params.set('price', selectedPrice)
    if (selectedRoomType !== 'all') params.set('type', selectedRoomType)
    window.location.href = `/properties?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-gradient-to-b from-white/90 to-white/50 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <HomeIcon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                租好
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/properties" className="text-gray-700 hover:text-blue-600 font-medium transition">租房</Link>
              <Link href="/properties?map=true" className="text-gray-700 hover:text-blue-600 font-medium transition">地图找房</Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition">房东入口</Link>
              <Link href="/help" className="text-gray-700 hover:text-blue-600 font-medium transition">帮助</Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* City Selector */}
              <button className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-gray-900">
                <span>广州</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Login/Register */}
              <div className="hidden lg:flex items-center gap-3">
                <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition">
                  登录
                </Link>
                <Link href="/login?register=true" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                  注册
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden py-4 border-t">
              <nav className="flex flex-col gap-3">
                <Link href="/properties" className="py-2 text-gray-700 font-medium">租房</Link>
                <Link href="/properties?map=true" className="py-2 text-gray-700 font-medium">地图找房</Link>
                <Link href="/dashboard" className="py-2 text-gray-700 font-medium">房东入口</Link>
                <Link href="/help" className="py-2 text-gray-700 font-medium">帮助</Link>
                <div className="flex gap-3 pt-3 border-t">
                  <Link href="/login" className="flex-1 py-2 text-center border rounded-lg">登录</Link>
                  <Link href="/login?register=true" className="flex-1 py-2 text-center bg-blue-600 text-white rounded-lg">注册</Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 lg:py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          {/* Hero Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              让租房更简单
            </h1>
            <p className="text-lg lg:text-xl text-slate-300">
              海量真实房源 · 房东直租 · 0中介费
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('rent')}
                className={`px-6 py-2 rounded-full font-medium transition ${activeTab === 'rent' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
              >
                租房
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-6 py-2 rounded-full font-medium transition ${activeTab === 'map' ? 'bg-white text-slate-900' : 'text-white/70 hover:text-white'}`}
              >
                地图找房
              </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-2 lg:p-3 shadow-2xl">
              <div className="flex flex-col lg:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="搜小区、写字楼或地址"
                    className="w-full pl-12 pr-4 py-3 lg:py-4 text-base lg:text-lg border-0 focus:ring-2 focus:ring-blue-500 rounded-xl"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 lg:py-4 rounded-xl font-medium text-lg transition flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  搜索
                </button>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {/* Price */}
                <div className="flex gap-1 flex-wrap">
                  {PRICE_RANGES.slice(0, 4).map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setSelectedPrice(range.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition ${selectedPrice === range.value ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                <span className="text-gray-300">|</span>
                {/* Room Type */}
                <div className="flex gap-1">
                  {ROOM_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedRoomType(type.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition ${selectedRoomType === type.value ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                <span className="text-gray-300">|</span>
                <button className="px-3 py-1.5 rounded-full text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-1">
                  <Train className="w-4 h-4" /> 近地铁
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            {QUICK_ACTIONS.map((action, index) => (
              <Link
                key={index}
                href={index === 0 ? '/properties' : index === 3 ? '/dashboard' : '#'}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition"
              >
                <div className={`w-12 h-12 lg:w-14 lg:h-14 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition shadow-lg`}>
                  <action.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <span className="text-sm lg:text-base font-medium text-gray-700">{action.label}</span>
                <span className="text-xs text-gray-400 hidden lg:block">{action.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-8 lg:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">精选房源</h2>
            <Link href="/properties" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              查看更多 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            {FEATURED_LISTINGS.map((listing) => (
              <Link 
                key={listing.id} 
                href={`/properties/${listing.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-40 lg:h-48 overflow-hidden">
                  <img 
                    src={listing.image} 
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  {/* Tags */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {listing.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-xs font-medium text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Favorite */}
                  <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition">
                    <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {listing.address}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {listing.area}㎡</span>
                    <span>{listing.rooms}室{listing.halls}厅</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl lg:text-2xl font-bold text-blue-600">¥{listing.price}</span>
                    <span className="text-sm text-gray-400">/月</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Areas */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">热门商圈</h2>
            <Link href="/properties" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              查看更多 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {POPULAR_AREAS.map((area, index) => (
              <Link 
                key={index} 
                href={`/properties?area=${area.name}`}
                className="group relative h-32 lg:h-40 rounded-2xl overflow-hidden"
              >
                <img 
                  src={area.image} 
                  alt={area.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-lg">{area.name}</h3>
                  <p className="text-white/80 text-sm">{area.count} 套房源</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Landlord Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                房东出租首选
              </h2>
              <p className="text-lg text-white/80 mb-6 max-w-xl">
                发布房源、管理租客、在线签约、租金代收，一站式服务让出租更轻松
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 text-white">
                  <Verified className="w-5 h-5" />
                  <span>真实房源</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5" />
                  <span>电子签约</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CreditCard className="w-5 h-5" />
                  <span>租金代收</span>
                </div>
              </div>
            </div>
            <Link 
              href="/login?role=landlord"
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl flex items-center gap-2"
            >
              立即开始
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-10">
            为什么选择租好？
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl text-center shadow-sm">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">真实房源</h3>
              <p className="text-gray-500 text-sm">100%真实房源信息实地核验</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl text-center shadow-sm">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">房东直租</h3>
              <p className="text-gray-500 text-sm">无中间商赚差价</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl text-center shadow-sm">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">电子签约</h3>
              <p className="text-gray-500 text-sm">法律效应安全保障</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl text-center shadow-sm">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">快速响应</h3>
              <p className="text-gray-500 text-sm">7×24小时客服</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <HomeIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">租好</span>
              </div>
              <p className="text-slate-400 text-sm">
                让租房更简单
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">快速链接</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/properties" className="hover:text-white">租房</Link></li>
                <li><Link href="/map" className="hover:text-white">地图找房</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">房东入口</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">帮助中心</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/help" className="hover:text-white">常见问题</Link></li>
                <li><Link href="/privacy" className="hover:text-white">隐私政策</Link></li>
                <li><Link href="/terms" className="hover:text-white">用户协议</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> 400-888-8888
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> 9:00-21:00
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© 2026 租好ZUHAO. All rights reserved.</p>
            <p className="mt-2">粤ICP备xxxxxxxx号 · 粤ICP备xxxxxxxx号</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
