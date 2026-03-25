'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, MapPin, Home, Square, User, Phone, MessageSquare, 
  Check, Calendar, DollarSign, Building, Clock, Heart, Share2,
  Copy, QrCode, MessageCircle
} from 'lucide-react'

interface Property {
  id: string
  title: string
  description: string
  address: string
  city: string
  area: number
  rooms: number
  halls: number
  bathrooms: number
  rent: number
  deposit: number
  photos: string[]
  status: string
  orientation?: string
  floor?: number
  total_floors?: number
  decoration?: string
  facilities?: string[]
  owner_id: string
  wechat_id?: string
  created_at: string
}

interface User {
  id: string
  phone: string
  name?: string
  role: string
  wechat_id?: string
}

export default function PropertyDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [owner, setOwner] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applicationSent, setApplicationSent] = useState(false)
  const [message, setMessage] = useState('你好，请问这个房子还在吗？')
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProperty() {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (data) {
        setProperty(data)
        // Fetch owner info
        if (data.owner_id) {
          const { data: ownerData } = await supabase
            .from('users')
            .select('id, phone, name, role, wechat_id')
            .eq('id', data.owner_id)
            .single()
          setOwner(ownerData)
        }
      }
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

  const copyWechatId = () => {
    const wechatId = property?.wechat_id || owner?.wechat_id || owner?.phone || 'zuhao888'
    navigator.clipboard.writeText(wechatId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openWechat = () => {
    const wechatId = property?.wechat_id || owner?.wechat_id || owner?.phone || 'zuhao888'
    // WeChat deep link
    window.open(`weixin://dl.chat?uin=${wechatId}`, '_blank')
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

  const hasPhotos = property.photos && property.photos.length > 0
  const wechatId = property.wechat_id || owner?.wechat_id || owner?.phone || 'zuhao888'

  return (
    <div className="min-h-screen bg-gray-50 pb-32 lg:pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/properties" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="lg:hidden">返回</span>
          </Link>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:text-red-500">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Photo Gallery */}
      <div className="relative h-56 sm:h-72 md:h-96 bg-gray-100">
        {hasPhotos ? (
          <>
            <img 
              src={property.photos[currentPhotoIndex]} 
              alt={property.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentPhotoIndex + 1} / {property.photos.length}
            </div>
            {property.photos.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-2 overflow-x-auto max-w-[70%]">
                {property.photos.slice(0, 6).map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhotoIndex(i)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === currentPhotoIndex ? 'border-white' : 'border-transparent opacity-70'}`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Home className="w-20 h-20" />
          </div>
        )}
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
                  <div className="flex items-center gap-2 mt-2 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{property.city} · {property.address}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                  property.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {property.status === 'available' ? '可租' : '已出租'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 py-4 border-t border-b">
                <div className="text-center">
                  <div className="text-lg font-semibold">{property.area}</div>
                  <div className="text-xs text-gray-500">面积(㎡)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{property.rooms}室</div>
                  <div className="text-xs text-gray-500">户型</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{property.floor || '-'}/{property.total_floors || '-'}</div>
                  <div className="text-xs text-gray-500">楼层</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{property.orientation || '-'}</div>
                  <div className="text-xs text-gray-500">朝向</div>
                </div>
              </div>

              <div className="flex items-end gap-6 mt-4">
                <div>
                  <span className="text-3xl font-bold text-red-500">¥{property.rent.toLocaleString()}</span>
                  <span className="text-gray-500">/月</span>
                </div>
                <div className="text-gray-500">
                  押金: <span className="font-semibold">¥{property.deposit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {property.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3">房屋描述</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{property.description}</p>
              </div>
            )}

            {property.facilities && property.facilities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3">配套设施</h2>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {property.facilities.map((facility, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-600">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Card - WeChat */}
          <div className="lg:col-span-1">
            {property.status === 'available' && !applicationSent && (
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-20">
                <h2 className="text-lg font-semibold mb-4">联系房东</h2>
                
                {/* WeChat QR Code Placeholder */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
                  <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-gray-300" />
                  </div>
                  <p className="text-xs text-gray-500">扫码添加微信</p>
                </div>

                {/* WeChat ID */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-500 mb-2">微信号</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <span className="font-mono">{wechatId}</span>
                    </div>
                    <button
                      onClick={copyWechatId}
                      className={`px-4 py-3 rounded-lg flex items-center gap-2 transition ${
                        copied 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="text-sm">{copied ? '已复制' : '复制'}</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={copyWechatId}
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition flex items-center justify-center gap-2 mb-3"
                >
                  <Copy className="w-5 h-5" />
                  一键复制微信号
                </button>
                
                <button
                  onClick={openWechat}
                  className="w-full bg-wechat-green text-white py-3 rounded-xl font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#07C160' }}
                >
                  <MessageCircle className="w-5 h-5" />
                  打开微信联系
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-400">或</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Message Form */}
                <div>
                  <label className="block text-sm font-medium mb-2">给房东留言</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="介绍一下自己..."
                  />
                </div>

                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium disabled:opacity-50 hover:bg-blue-700 transition mt-4"
                >
                  {applying ? '提交中...' : '提交申请'}
                </button>

                <p className="text-xs text-gray-400 mt-4 text-center">
                  房东通常在24小时内回复
                </p>
              </div>
            )}

            {applicationSent && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">申请已提交</h3>
                <p className="text-gray-500 mb-4">请通过微信联系房东</p>
                <button
                  onClick={copyWechatId}
                  className="w-full bg-green-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 mb-3"
                >
                  <Copy className="w-5 h-5" /> 复制微信号
                </button>
                <Link href="/properties" className="text-blue-600 hover:underline">
                  查看更多房源
                </Link>
              </div>
            )}

            {property.status !== 'available' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <h3 className="text-lg font-semibold mb-2">已出租</h3>
                <p className="text-gray-500 mb-4">该房源已出租，看看其他房源？</p>
                <Link href="/properties" className="text-blue-600 hover:underline">
                  浏览更多房源
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      {property.status === 'available' && !applicationSent && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
          <div className="flex gap-3">
            <button
              onClick={copyWechatId}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" />
              复制微信号
            </button>
            <Link
              href={`weixin://dl/chat?uin=${wechatId}`}
              className="flex-1 bg-wechat-green text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: '#07C160' }}
            >
              <MessageCircle className="w-5 h-5" />
              微信联系
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
