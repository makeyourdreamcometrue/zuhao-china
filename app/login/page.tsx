'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Eye, EyeOff, Home, CheckCircle, AlertCircle, X, Loader2, Shield, QrCode } from 'lucide-react'

// Security functions
const sanitizeInput = (input: string): string => {
  return input.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim()
}

const isValidPhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone)
}

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

// Session management
const saveAuthSession = (user: any) => {
  const expiry = Date.now() + SESSION_DURATION
  localStorage.setItem('auth_user', JSON.stringify(user))
  localStorage.setItem('auth_expiry', expiry.toString())
  document.cookie = `auth_state=valid;max-age=${SESSION_DURATION/1000};path=/`
}

const getCurrentUser = () => {
  const userStr = localStorage.getItem('auth_user')
  const expiryStr = localStorage.getItem('auth_expiry')
  if (!userStr || !expiryStr) return null
  if (Date.now() > parseInt(expiryStr)) return null
  try { return JSON.parse(userStr) } catch { return null }
}

const isAuthenticated = () => getCurrentUser() !== null

let refreshTimer: any = null
const startSessionRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer)
  refreshTimer = setInterval(() => { if (isAuthenticated()) localStorage.setItem('auth_expiry', (Date.now() + SESSION_DURATION).toString()) }, 60 * 60 * 1000)
}

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<'wechat' | 'phone'>('wechat')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('tenant')
  const [agreed, setAgreed] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showWechatModal, setShowWechatModal] = useState(false)
  const [wechatScanStep, setWechatScanStep] = useState<'qr' | 'scanning' | 'success'>('qr')
  const [wechatQrCode, setWechatQrCode] = useState('wechat_qr_' + Date.now())
  
  const [phoneError, setPhoneError] = useState('')
  const [codeError, setCodeError] = useState('')
  const [agreeError, setAgreeError] = useState('')
  
  const supabase = createClient()
  
  // Check for existing session on mount
  useEffect(() => {
    const initAuth = () => {
      if (isAuthenticated()) {
        const user = getCurrentUser()
        if (user) {
          startSessionRefresh()
          router.push(user.role === 'landlord' ? '/dashboard' : '/properties')
          return
        }
      }
      const savedPhone = localStorage.getItem('rememberedPhone')
      if (savedPhone) { setPhone(savedPhone); setRememberMe(true) }
      setInitializing(false)
    }
    initAuth()
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleLogin = async (userData: any) => {
    saveAuthSession({
      id: userData.id,
      phone: sanitizeInput(userData.phone || ''),
      name: sanitizeInput(userData.name || ''),
      role: sanitizeInput(userData.role)
    })
    
    if (rememberMe) localStorage.setItem('rememberedPhone', phone)
    else localStorage.removeItem('rememberedPhone')
    
    startSessionRefresh()
    router.push(userData.role === 'landlord' ? '/dashboard' : '/properties')
  }

  const sendCode = async () => {
    setPhoneError(''); setAgreeError('')
    
    const sanitizedPhone = sanitizeInput(phone)
    if (!sanitizedPhone) { setPhoneError('请输入手机号'); return }
    if (!isValidPhone(sanitizedPhone)) { setPhoneError('请输入正确的11位手机号'); return }
    if (!agreed) { setAgreeError('请阅读并同意用户协议和隐私政策'); return }
    
    setError(''); setLoading(true)
    
    const { data: existingUser } = await supabase.from('users').select('*').eq('phone', sanitizedPhone).single()
    setIsNewUser(!existingUser); setCountdown(60)
    setTimeout(() => { setStep('code'); setLoading(false) }, 800)
  }

  const verifyCode = async () => {
    setCodeError(''); setAgreeError('')
    
    const sanitizedCode = sanitizeInput(code)
    if (!sanitizedCode) { setCodeError('请输入验证码'); return }
    if (sanitizedCode.length !== 4) { setCodeError('请输入4位验证码'); return }
    if (!agreed) { setAgreeError('请阅读并同意用户协议和隐私政策'); return }
    
    setError(''); setLoading(true)
    try {
      if (isNewUser) {
        const sanitizedName = sanitizeInput(name)
        const { data: newUser, error: insertError } = await supabase.from('users').insert({ 
          phone: sanitizeInput(phone), 
          role: sanitizeInput(role), 
          name: sanitizedName || null 
        }).select().single()
        
        if (insertError) { setError('注册失败'); setLoading(false); return }
        if (newUser) await handleLogin(newUser)
      } else {
        const { data: existingUser } = await supabase.from('users').select('*').eq('phone', sanitizeInput(phone)).single()
        if (existingUser) await handleLogin(existingUser)
      }
    } catch { setError('登录失败，请重试') }
    setLoading(false)
  }

  const handleWechatLogin = () => {
    if (!agreed) { setAgreeError('请阅读并同意用户协议和隐私政策'); return }
    setShowWechatModal(true); setWechatScanStep('qr')
    
    // Simulate QR scan flow
    setTimeout(() => { setWechatScanStep('scanning') }, 1500)
    setTimeout(() => { 
      setWechatScanStep('success')
      handleWechatUser()
    }, 3500)
  }

  const handleWechatUser = async () => {
    const wechatId = 'wechat_' + Date.now()
    const { data: existingUser } = await supabase.from('users').select('*').eq('wechat_id', wechatId).single()
    if (existingUser) {
      await handleLogin(existingUser)
    } else { 
      const { data: newUser } = await supabase.from('users').insert({ 
        phone: wechatId, 
        wechat_id: wechatId, 
        role: 'tenant', 
        name: '微信用户' 
      }).select().single(); 
      if (newUser) await handleLogin(newUser) 
    }
    setShowWechatModal(false)
  }

  if (initializing) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /><p className="text-gray-500 mt-2">加载中...</p></div>
    </div>
  )

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="max-w-md text-center relative z-10">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Home className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">租好</h1>
          <p className="text-xl text-slate-300 mb-12">让租房更简单</p>
          
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur p-4 rounded-xl border border-white/10">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">100+ 城市房源覆盖</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur p-4 rounded-xl border border-white/10">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">房东直租 0 中介费</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur p-4 rounded-xl border border-white/10">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">在线签约 安全保障</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Home className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">租好</h1>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">欢迎登录</h2>
            <p className="text-slate-500 mb-6 text-sm">登录后享受更多租房服务</p>
            
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Login Method Tabs */}
            <div className="flex mb-6 bg-slate-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => { setLoginMethod('wechat'); setStep('phone'); }}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${loginMethod === 'wechat' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66l-.7 2.11 2.47-1.24c.72.19 1.49.29 2.29.29.34 0 .68-.02 1.01-.06A5.97 5.97 0 0110 14.5c0-.17.01-.34.01-.5 0-2.07-1.65-3.75-3.69-3.75-.49 0-.96.09-1.38.26L4.5 7.5c.5-.57 1.19-1 1.97-1.18L5 4c0-.02-.01-.03-.01-.05C3.69 4.64 6.31 4 9.5 4zm5 0c4.14 0 7.5 2.69 7.5 6 0 1.89-1.08 3.56-2.78 4.66l.7 2.11-2.47-1.24c-.72.19-1.49.29-2.29.29-.34 0-.68-.02-1.01-.06A5.97 5.97 0 0114 14.5c0-.17-.01-.34-.01-.5 0-2.07 1.65-3.75 3.69-3.75.49 0 .96.09 1.38.26l1.52-1.76c-.5-.57-1.19-1-1.97-1.18l-.47-2.11c.11.02.23.03.35.03z"/>
                </svg>
                微信登录
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('phone'); setStep('phone'); }}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${loginMethod === 'phone' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                <Phone className="w-4 h-4" />
                手机号登录
              </button>
            </div>

            {/* Agreement Checkbox */}
            <div className="mb-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreed} 
                  onChange={(e) => { setAgreed(e.target.checked); setAgreeError(''); }} 
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                />
                <span className="text-sm text-slate-600">
                  我已阅读并同意
                  <button type="button" onClick={() => setShowTermsModal(true)} className="text-blue-600 hover:underline mx-1">《用户协议》</button>
                  和
                  <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-blue-600 hover:underline mx-1">《隐私政策》</button>
                </span>
              </label>
              {agreeError && <p className="mt-2 text-sm text-red-500">{agreeError}</p>}
            </div>

            {/* WeChat Login */}
            {loginMethod === 'wechat' && step === 'phone' && (
              <div className="space-y-5">
                <button 
                  onClick={handleWechatLogin} 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl text-base font-medium flex items-center justify-center gap-3 transition"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66l-.7 2.11 2.47-1.24c.72.19 1.49.29 2.29.29.34 0 .68-.02 1.01-.06A5.97 5.97 0 0110 14.5c0-.17.01-.34.01-.5 0-2.07-1.65-3.75-3.69-3.75-.49 0-.96.09-1.38.26L4.5 7.5c.5-.57 1.19-1 1.97-1.18L5 4c0-.02-.01-.03-.01-.05C3.69 4.64 6.31 4 9.5 4zm5 0c4.14 0 7.5 2.69 7.5 6 0 1.89-1.08 3.56-2.78 4.66l.7 2.11-2.47-1.24c-.72.19-1.49.29-2.29.29-.34 0-.68-.02-1.01-.06A5.97 5.97 0 0114 14.5c0-.17-.01-.34-.01-.5 0-2.07 1.65-3.75 3.69-3.75.49 0 .96.09 1.38.26l1.52-1.76c-.5-.57-1.19-1-1.97-1.18l-.47-2.11c.11.02.23.03.35.03z"/>
                  </svg>
                  微信扫码登录
                </button>
                <p className="text-xs text-slate-400 text-center">使用微信扫描二维码快速登录</p>
              </div>
            )}

            {/* Phone Login */}
            {loginMethod === 'phone' && step === 'phone' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">手机号码</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base">+86</span>
                    <Phone className="absolute left-16 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 11)); setPhoneError(''); }} 
                      placeholder="请输入11位手机号" 
                      maxLength={11} 
                      className={`w-full pl-24 pr-12 py-3.5 border rounded-xl text-base ${phoneError ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} 
                    />
                    {phone && (
                      <button type="button" onClick={() => setPhone('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {phoneError && <p className="mt-2 text-sm text-red-500">{phoneError}</p>}
                </div>

                <button 
                  onClick={sendCode} 
                  disabled={loading || countdown > 0} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? '发送中...' : countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码'}
                </button>

                <p className="text-xs text-slate-400 text-center">演示模式：任意输入4位数字即可登录</p>
              </div>
            )}

            {/* Code Verification */}
            {step === 'code' && (
              <div className="space-y-5">
                {isNewUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">选择身份</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole('tenant')}
                          className={`p-4 border-2 rounded-xl transition flex flex-col items-center gap-2 ${role === 'tenant' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                          <Home className={`w-6 h-6 ${role === 'tenant' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className={`text-sm font-medium ${role === 'tenant' ? 'text-blue-600' : 'text-slate-600'}`}>我要租房</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('landlord')}
                          className={`p-4 border-2 rounded-xl transition flex flex-col items-center gap-2 ${role === 'landlord' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                          <Home className={`w-6 h-6 ${role === 'landlord' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className={`text-sm font-medium ${role === 'landlord' ? 'text-blue-600' : 'text-slate-600'}`}>我是房东</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">昵称（选填）</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="请输入昵称" 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">验证码</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type={showCode ? "text" : "password"} 
                      value={code} 
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                      placeholder="请输入4位验证码" 
                      maxLength={4} 
                      className={`w-full pl-12 pr-24 py-3.5 border text-center text-2xl tracking-widest rounded-xl ${codeError ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCode(!showCode)} 
                      className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {codeError && <p className="mt-2 text-sm text-red-500">{codeError}</p>}
                  <button type="button" onClick={() => setStep('phone')} className="mt-3 text-sm text-blue-600 hover:underline">重新获取验证码</button>
                </div>
                
                <button 
                  onClick={verifyCode} 
                  disabled={loading || code.length !== 4} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isNewUser ? '注册并登录' : '登录'}
                </button>
                
                <button 
                  onClick={() => { setStep('phone'); setIsNewUser(false); }} 
                  className="w-full text-slate-500 py-3 text-sm hover:text-slate-700 transition"
                >
                  返回
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            登录即表示同意
            <button onClick={() => setShowTermsModal(true)} className="text-blue-600 hover:underline mx-1">《用户协议》</button>
            和
            <button onClick={() => setShowPrivacyModal(true)} className="text-blue-600 hover:underline mx-1">《隐私政策》</button>
          </p>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">用户协议</h3>
              <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-slate-600 space-y-4">
              <section>
                <h4 className="font-semibold text-slate-900 mb-2">1. 服务条款</h4>
                <p>欢迎使用租好平台服务。本协议规定了您使用租好平台的条件。</p>
              </section>
              <section>
                <h4 className="font-semibold text-slate-900 mb-2">2. 用户责任</h4>
                <p>用户需保证所提供信息的真实性和准确性。</p>
              </section>
              <section>
                <h4 className="font-semibold text-slate-900 mb-2">3. 隐私保护</h4>
                <p>我们重视用户隐私，会采取必要措施保护您的个人信息。</p>
              </section>
            </div>
            <div className="p-6 border-t">
              <button 
                onClick={() => { setShowTermsModal(false); setAgreed(true); }} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium"
              >
                我已阅读并同意
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">隐私政策</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-slate-600 space-y-4">
              <section>
                <h4 className="font-semibold text-slate-900 mb-2">1. 信息收集</h4>
                <p>我们收集必要的个人信息用于提供服务，包括手机号码、昵称等。</p>
              </section>
              <section>
                <h4 className="font-semibold text-slate-900 mb-2">2. 信息使用</h4>
                <p>您的信息将用于提供租房服务、改进用户体验等目的。</p>
              </section>
              <section>
                <h4 className="font-semibold text-slate-900 mb-2">3. 信息安全</h4>
                <p>我们采用加密技术保护您的数据安全。</p>
              </section>
            </div>
            <div className="p-6 border-t">
              <button 
                onClick={() => { setShowPrivacyModal(false); setAgreed(true); }} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium"
              >
                我已阅读并同意
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WeChat Login Modal */}
      {showWechatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">微信登录</h3>
              <button onClick={() => setShowWechatModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 text-center">
              {wechatScanStep === 'qr' && (
                <>
                  <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center border-2 border-slate-100 overflow-hidden">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://weixin.qq.com& bgcolor=ffffff& color=000000" 
                      alt="WeChat QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-slate-600 mb-2">请使用微信扫描二维码登录</p>
                  <p className="text-xs text-slate-400">演示：1.5秒后自动扫描</p>
                </>
              )}
              
              {wechatScanStep === 'scanning' && (
                <>
                  <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center border-2 border-emerald-500 overflow-hidden relative">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://weixin.qq.com& bgcolor=ffffff& color=000000" 
                      alt="WeChat QR Code" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-emerald-500/20 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-0.5 bg-emerald-500 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">正在扫描二维码...</p>
                </>
              )}
              
              {wechatScanStep === 'success' && (
                <>
                  <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <p className="text-lg font-medium text-slate-900">登录成功</p>
                  <p className="text-sm text-slate-500 mt-1">正在跳转...</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
