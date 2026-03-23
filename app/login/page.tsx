'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Phone, Home } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const sendCode = async () => {
    if (!phone || phone.length !== 11) {
      setError('请输入正确的手机号')
      return
    }
    setError('')
    setLoading(true)
    
    // DEMO MODE: 模拟发送成功 (实际需要接入短信API)
    setTimeout(() => {
      setStep('code')
      setLoading(false)
    }, 1000)
  }

  const verifyCode = async () => {
    if (!code || code.length !== 4) {
      setError('请输入4位验证码')
      return
    }
    setError('')
    setLoading(true)
    
    try {
      // DEMO MODE: 跳过验证码验证 (实际需要验证)
      // 查找或创建用户
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

      if (existingUser) {
        localStorage.setItem('user', JSON.stringify(existingUser))
        router.push('/')
      } else {
        // 创建新用户
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({ phone, role: 'tenant' })
          .select()
          .single()
        
        if (insertError) {
          setError('创建用户失败: ' + insertError.message)
          setLoading(false)
          return
        }
        
        if (newUser) {
          localStorage.setItem('user', JSON.stringify(newUser))
          router.push('/')
        }
      }
    } catch (err) {
      setError('登录失败，请重试')
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">租好</h1>
          <p className="text-gray-500 mt-2">租房更简单</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="请输入11位手机号"
                maxLength={11}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              onClick={sendCode}
              disabled={loading || phone.length !== 11}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? '发送中...' : '获取验证码'}
            </button>
            
            {/* Demo hint */}
            <p className="text-xs text-gray-400 text-center">
              Demo模式: 点击获取验证码后，任意输入4位数字即可登录
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                验证码
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="请输入4位验证码"
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              />
            </div>
            <button
              onClick={verifyCode}
              disabled={loading || code.length !== 4}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 text-lg"
            >
              {loading ? '登录中...' : '登录'}
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full text-gray-500 py-2 hover:text-gray-700"
            >
              返回修改手机号
            </button>
          </div>
        )}
        
        <p className="text-center text-xs text-gray-400 mt-6">
          登录即表示同意
          <a href="#" className="text-blue-600 hover:underline">《用户协议》</a>
          和
          <a href="#" className="text-blue-600 hover:underline">《隐私政策》</a>
        </p>
      </div>
    </div>
  )
}
