'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Eye, EyeOff, Home, CheckCircle, AlertCircle, ArrowRight, X, MessageCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<'phone' | 'wechat'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('tenant')
  const [agreed, setAgreed] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showWechatModal, setShowWechatModal] = useState(false)
  const [wechatScanStep, setWechatScanStep] = useState<'qr' | 'success'>('qr')
  
  const [phoneError, setPhoneError] = useState('')
  const [codeError, setCodeError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [agreeError, setAgreeError] = useState('')
  
  const supabase = createClient()
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    const savedPhone = localStorage.getItem('rememberedPhone')
    if (savedPhone) {
      setPhone(savedPhone)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (userData: any) => {
    if (rememberMe) {
      localStorage.setItem('rememberedPhone', phone)
    } else {
      localStorage.removeItem('rememberedPhone')
    }
    localStorage.setItem('user', JSON.stringify(userData))
    router.push(userData.role === 'landlord' ? '/dashboard' : '/properties')
  }

  const sendCode = async () => {
    setPhoneError('')
    setAgreeError('')
    if (!phone) { setPhoneError('请输入手机号'); return }
    if (phone.length !== 11) { setPhoneError('请输入正确的11位手机号'); return }
    if (!agreed) { setAgreeError('请阅读并同意用户协议和隐私政策'); return }
    
    setError('')
    setLoading(true)
    const { data: existingUser } = await supabase.from('users').select('*').eq('phone', phone).single()
    setIsNewUser(!existingUser)
    setCountdown(60)
    setTimeout(() => { setStep('code'); setLoading(false) }, 1000)
  }

  const verifyCode = async () => {
    setCodeError('')
    setAgreeError('')
    if (!code) { setCodeError('请输入验证码'); return }
    if (code.length !== 4) { setCodeError('请输入4位验证码'); return }
    if (!agreed) { setAgreeError('请阅读并同意用户协议和隐私政策'); return }
    
    setError('')
    setLoading(true)
    try {
      if (isNewUser) {
        const { data: newUser, error: insertError } = await supabase.from('users').insert({ phone, role, name: name || null }).select().single()
        if (insertError) { setError('注册失败: ' + insertError.message); setLoading(false); return }
        if (newUser) await handleLogin(newUser)
      } else {
        const { data: existingUser } = await supabase.from('users').select('*').eq('phone', phone).single()
        if (existingUser) await handleLogin(existingUser)
      }
    } catch { setError('登录失败，请重试') }
    setLoading(false)
  }

  const handlePasswordLogin = async () => {
    setPasswordError('')
    setAgreeError('')
    if (!phone) { setPhoneError('请输入手机号'); return }
    if (phone.length !== 11) { setPhoneError('请输入正确的11位手机号'); return }
    if (!password) { setPasswordError('请输入密码'); return }
    if (!agreed) { setAgreeError('请阅读并同意用户协议和隐私政策'); return }
    
    setError('')
    setLoading(true)
    try {
      const { data: user } = await supabase.from('users').select('*').eq('phone', phone).single()
      if (!user) { setError('用户不存在，请先注册'); setLoading(false); return }
      await handleLogin(user)
    } catch { setError('登录失败，请重试') }
    setLoading(false)
  }

  const handleWechatLogin = () => {
    if (!agreed) { setAgreeError('请阅读并同意用户协议和隐私政策'); return }
    setShowWechatModal(true)
    setWechatScanStep('qr')
    setTimeout(() => { setWechatScanStep('success'); setTimeout(() => handleWechatUser(), 1500) }, 2000)
  }

  const handleWechatUser = async () => {
    const wechatId = 'wechat_' + Date.now()
    const { data: existingUser } = await supabase.from('users').select('*').eq('wechat_id', wechatId).single()
    if (existingUser) { await handleLogin(existingUser) }
    else { const { data: newUser } = await supabase.from('users').insert({ phone: wechatId, wechat_id: wechatId, role: 'tenant', name: '微信用户' }).select().single(); if (newUser) await handleLogin(newUser) }
    setShowWechatModal(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm"><Home className="w-12 h-12" /></div>
          <h1 className="text-4xl font-bold mb-4">租好</h1>
          <p className="text-xl opacity-90 mb-8">让租房更简单</p>
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl"><CheckCircle className="w-6 h-6 text-green-400" /><span>房源管理更轻松</span></div>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl"><CheckCircle className="w-6 h-6 text-green-400" /><span>租金自动收取</span></div>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl"><CheckCircle className="w-6 h-6 text-green-400" /><span>租客智能筛选</span></div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4"><Home className="w-8 h-8 text-white" /></div>
            <h1 className="text-2xl font-bold">租好</h1><p className="text-gray-500">让租房更简单</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-2">{isNewUser ? '注册' : '欢迎回来'}</h2>
            <p className="text-gray-500 mb-6">{isNewUser ? '创建您的账户' : '登录您的账户'}</p>

            {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

            {/* Tabs */}
            {step === 'phone' && (
              <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
                <button type="button" onClick={() => setLoginMethod('phone')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${loginMethod === 'phone' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><Phone className="w-4 h-4 inline mr-1" />手机号登录</button>
                <button type="button" onClick={() => setLoginMethod('wechat')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${loginMethod === 'wechat' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>微信登录</button>
              </div>
            )}

            {/* Agreement */}
            <div className="mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setAgreeError(''); }} className="mt-1 w-5 h-5 rounded" />
                <span className="text-sm text-gray-600">我已阅读并同意<button type="button" onClick={() => setShowTermsModal(true)} className="text-blue-600 mx-1">《用户协议》</button>和<button type="button" onClick={() => setShowPrivacyModal(true)} className="text-blue-600 mx-1">《隐私政策》</button></span>
              </label>
              {agreeError && <p className="mt-2 text-sm text-red-500"><AlertCircle className="w-4 h-4 inline" /> {agreeError}</p>}
            </div>
            
            {/* Phone Login */}
            {loginMethod === 'phone' && step === 'phone' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">+86</span>
                    <Phone className="absolute left-16 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 11)); setPhoneError(''); }} placeholder="请输入11位手机号" maxLength={11} className={`w-full pl-24 pr-12 py-4 border rounded-xl text-lg ${phoneError ? 'border-red-500' : 'border-gray-200'}`} />
                    {phone && <button type="button" onClick={() => setPhone('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-5 h-5" /></button>}
                  </div>
                  {phoneError && <p className="mt-2 text-sm text-red-500">{phoneError}</p>}
                </div>

                <div>
                  <div className="flex justify-between mb-2"><label className="text-sm font-medium text-gray-700">密码</label><button className="text-sm text-blue-600">忘记密码？</button></div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" className={`w-full pl-12 pr-12 py-4 border rounded-xl text-lg ${passwordError ? 'border-red-500' : 'border-gray-200'}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                  </div>
                  {passwordError && <p className="mt-2 text-sm text-red-500">{passwordError}</p>}
                </div>

                <div className="flex items-center"><label className="flex items-center gap-2"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded" /><span className="text-sm text-gray-600">记住我</span></label></div>

                <button onClick={handlePasswordLogin} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg">{loading ? '登录中...' : '登录'}</button>

                <div className="relative"><div className="border-t"></div><div className="absolute inset-0 flex justify-center"><span className="bg-white px-4 text-gray-500">或</span></div></div>

                <button onClick={sendCode} disabled={loading || countdown > 0} className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl text-lg">{loading ? '发送中...' : countdown > 0 ? `${countdown}秒后重试` : '手机验证码登录'}</button>
                <p className="text-xs text-gray-400 text-center">Demo模式: 密码登录任意手机号即可</p>
              </div>
            )}

            {/* WeChat Login */}
            {loginMethod === 'wechat' && step === 'phone' && (
              <div className="space-y-5">
                <button onClick={handleWechatLogin} className="w-full bg-green-500 text-white py-4 rounded-xl text-lg">微信一键登录</button>
                <p className="text-xs text-gray-400 text-center">微信扫码即可快速登录，无需注册</p>
              </div>
            )}

            {/* Code Step */}
            {step === 'code' && (
              <div className="space-y-6">
                {isNewUser && (<><div><label className="block text-sm font-medium mb-2">您的身份</label><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setRole('tenant')} className={`p-4 border-2 rounded-xl ${role === 'tenant' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}><Home className="w-6 h-6 mx-auto mb-1" /><span>我要租房</span></button><button type="button" onClick={() => setRole('landlord')} className={`p-4 border-2 rounded-xl ${role === 'landlord' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}><Home className="w-6 h-6 mx-auto mb-1" /><span>我是房东</span></button></div></div><div><label className="block text-sm font-medium mb-2">昵称（选填）</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入昵称" className="w-full px-4 py-3 border border-gray-200 rounded-xl" /></div></>)}
                <div>
                  <label className="block text-sm font-medium mb-2">验证码</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type={showCode ? "text" : "password"} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="4位验证码" maxLength={4} className={`w-full pl-12 pr-20 py-4 border text-center text-2xl tracking-widest ${codeError ? 'border-red-500' : 'border-gray-200'}`} />
                    <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400">{showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                  </div>
                  {codeError && <p className="mt-2 text-sm text-red-500">{codeError}</p>}
                  <button type="button" onClick={() => setStep('phone')} className="mt-3 text-sm text-blue-600">重新获取验证码</button>
                </div>
                <button onClick={verifyCode} disabled={loading || code.length !== 4} className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg">{loading ? '处理中...' : isNewUser ? '注册' : '登录'}</button>
                <button onClick={() => { setStep('phone'); setIsNewUser(false); }} className="w-full text-gray-500 py-3">返回</button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">登录即表示同意<button onClick={() => setShowTermsModal(true)} className="text-blue-600 mx-1">《用户协议》</button>和<button onClick={() => setShowPrivacyModal(true)} className="text-blue-600 mx-1">《隐私政策》</button></p>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh]"><div className="p-6 border-b flex justify-between"><h3 className="text-xl font-bold">用户协议</h3><button onClick={() => setShowTermsModal(false)}><X className="w-6 h-6" /></button></div><div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-600 space-y-4"><section><h4 className="font-semibold">1. 服务条款</h4><p>欢迎使用租好平台！本用户协议规定了您与租好平台之间的权利和义务。</p></section><section><h4 className="font-semibold">2. 服务描述</h4><p>租好是提供租房信息发布、房屋管理、租金收取等服务的平台。</p></section></div><div className="p-6 border-t"><button onClick={() => { setShowTermsModal(false); setAgreed(true); }} className="w-full bg-blue-600 text-white py-3 rounded-xl">我已阅读并同意</button></div></div></div>)}

      {/* Privacy Modal */}
      {showPrivacyModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh]"><div className="p-6 border-b flex justify-between"><h3 className="text-xl font-bold">隐私政策</h3><button onClick={() => setShowPrivacyModal(false)}><X className="w-6 h-6" /></button></div><div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-gray-600 space-y-4"><section><h4 className="font-semibold">1. 信息收集</h4><p>我们收集您提供的个人信息，包括手机号码、昵称等。</p></section><section><h4 className="font-semibold">2. 信息使用</h4><p>您的信息将用于提供租房服务、账户管理等目的。</p></section></div><div className="p-6 border-t"><button onClick={() => { setShowPrivacyModal(false); setAgreed(true); }} className="w-full bg-blue-600 text-white py-3 rounded-xl">我已阅读并同意</button></div></div></div>)}

      {/* WeChat Modal */}
      {showWechatModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-sm w-full"><div className="p-6 border-b flex justify-between"><h3 className="text-xl font-bold">微信登录</h3><button onClick={() => setShowWechatModal(false)}><X className="w-6 h-6" /></button></div><div className="p-8 text-center">{wechatScanStep === 'qr' ? (<><div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center"><span className="text-gray-400">二维码</span></div><p className="text-sm text-gray-500">请使用微信扫码登录</p><p className="text-xs text-gray-400 mt-2">模拟: 2秒后自动登录</p>) : (<><div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center"><CheckCircle className="w-10 h-10 text-green-500" /></div><p className="text-lg font-medium">登录成功</p></>)}</div></div></div>)}
    </div>
  )
}
