'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, Building, User, Shield, CreditCard, FileText, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user is logged in
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.role === 'landlord') {
        router.push('/dashboard')
      } else {
        router.push('/properties')
      }
    }
  }, [router])

  // Show loading while checking auth
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show landing page for logged out users
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">让租房变得更简单</h1>
          <p className="text-xl opacity-90 mb-8">专业的租房管理平台</p>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100">
              立即开始
            </Link>
            <Link href="/properties" className="bg-white/20 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/30">
              浏览房源
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl">
              <Building className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">房源管理</h3>
              <p className="text-gray-500">轻松管理多个房源</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <CreditCard className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">自动收租</h3>
              <p className="text-gray-500">告别催租烦恼</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <FileText className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">电子合同</h3>
              <p className="text-gray-500">在线签约更便捷</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">立即开始</h2>
        <p className="mb-8 opacity-90">加入租好，让租房更简单</p>
        <Link href="/login" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold">
          登录 / 注册
        </Link>
      </section>
    </div>
  )
}
