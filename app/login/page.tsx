'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Eye, EyeOff, Home, CheckCircle, AlertCircle, X, Loader2, User, Building } from 'lucide-react'

const sanitizeInput = (input: string) => input.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim()
const isValidPhone = (phone: string) => /^1[3-9]\d{9}$/.test(phone)
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000
const saveAuthSession = (user: any) => { localStorage.setItem('auth_user', JSON.stringify(user)); localStorage.setItem('auth_expiry', (Date.now() + SESSION_DURATION).toString()) }
const getCurrentUser = () => { try { const u = localStorage.getItem('auth_user'), e = localStorage.getItem('auth_expiry'); return u && e && Date.now() < parseInt(e) ? JSON.parse(u) : null } catch { return null } }
const isAuthenticated = () => getCurrentUser() !== null
const getDefaultRole = (roles: string[]) => roles?.length === 1 ? roles[0] : null
const navigateByRole = (role: string, r: any) => { if (role === 'landlord') r.push('/dashboard'); else if (role === 'tenant') r.push('/tenant'); else r.push('/') }

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<'wechat' | 'phone'>('wechat')
  const [step, setStep] = useState<'login' | 'code' | 'register' | 'select-role'>('login')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [showCode, setShowCode] = useState(false)
  const [name, setName] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['tenant'])
  const [agreed, setAgreed] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [codeError, setCodeError] = useState('')
  const [nameError, setNameError] = useState('')
  const [agreeError, setAgreeError] = useState('')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const initAuth = () => {
      const user = getCurrentUser()
      if (user) {
        const roles = user.roles || [user.role].filter(Boolean)
        const defaultRole = getDefaultRole(roles)
        if (defaultRole) { localStorage.setItem('auth_user', JSON.stringify({ ...user, current_role: defaultRole })); navigateByRole(defaultRole, router) }
        else { setStep('select-role'); setInitializing(false) }
      } else setInitializing(false)
    }
    initAuth()
  }, [])

  useEffect(() => { if (countdown > 0) { const t = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(t) } }, [countdown])

  const sendCode = async () => {
    setPhoneError(''); setAgreeError('')
    const sp = sanitizeInput(phone)
    if (!sp) { setPhoneError('请输入手机号'); return }
    if (!isValidPhone(sp)) { setPhoneError('请输入正确的11位手机号'); return }
    if (!agreed) { setAgreeError('请阅读并同意用户协议和隐私政策'); return }
    setLoading(true)
    try { await supabase.from('users').select('*').eq('phone', sp).single().then(({ data }) => { setStep(data ? 'code' : 'register'); setCountdown(60) }) } catch { setError('获取验证码失败') }
    setLoading(false)
  }

  const verifyCode = async () => {
    setCodeError('')
    const sc = sanitizeInput(code)
    if (!sc) { setCodeError('请输入验证码'); return }
    if (sc.length !== 4) { setCodeError('请输入4位验证码'); return }
    setLoading(true)
    try {
      const sp = sanitizeInput(phone)
      const { data: u } = await supabase.from('users').select('*').eq('phone', sp).single()
      if (u) { const ud: any = { id: u.id, phone: u.phone, name: u.name, roles: u.roles || [u.role].filter(Boolean), role: u.role }; const dr = getDefaultRole(ud.roles); if (dr) ud.current_role = dr; saveAuthSession(ud); dr ? navigateByRole(dr, router) : setStep('select-role') }
      else { setError('请先注册'); setStep('register') }
    } catch { setError('登录失败') }
    setLoading(false)
  }

  const handleRegister = async () => {
    setNameError(''); setAgreeError(''); setError('')
    const sn = sanitizeInput(name)
    if (!sn) { setNameError('请输入昵称'); return }
    if (selectedRoles.length === 0) { setError('请选择至少一个身份'); return }
    if (!agreed) { setAgreeError('请阅读并同意用户协议和隐私政策'); return }
    setLoading(true)
    try {
      const sp = sanitizeInput(phone)
      const { data: nu, error: ie } = await supabase.from('users').insert({ phone: sp, name: sn, role: selectedRoles[0], roles: selectedRoles }).select().single()
      if (ie) { setError('注册失败'); setLoading(false); return }
      const ud: any = { id: nu.id, phone: nu.phone, name: nu.name, roles: nu.roles || selectedRoles, role: nu.role }; const dr = getDefaultRole(ud.roles); if (dr) ud.current_role = dr; saveAuthSession(ud); dr ? navigateByRole(dr, router) : setStep('select-role')
    } catch { setError('注册失败') }
    setLoading(false)
  }

  const handleRoleSelect = (sr: string) => { const u = getCurrentUser(); if (u) { localStorage.setItem('auth_user', JSON.stringify({ ...u, current_role: sr })); navigateByRole(sr, router) } }
  const toggleRole = (r: string) => setSelectedRoles(ps => ps.includes(r) ? (ps.length > 1 ? ps.filter(x => x !== r) : ps) : [...ps, r])

  if (initializing) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /><p className="text-gray-500 mt-2">加载中...</p></div></div>

  if (step === 'select-role') {
    const u = getCurrentUser()
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-center items-center p-12 text-white">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-8"><Home className="w-10 h-10" /></div>
          <h1 className="text-5xl font-bold mb-4">租好</h1><p className="text-xl text-slate-300 mb-12">选择您的身份</p>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold mb-2">欢迎回来，{u?.name || '用户'}</h2><p className="text-slate-500 mb-8">请选择您要使用的身份</p>
            <div className="space-y-4">
              {u?.roles?.includes('tenant') && <button onClick={() => handleRoleSelect('tenant')} className="w-full p-6 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 flex items-center gap-4"><div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center"><User className="w-7 h-7 text-blue-600" /></div><div className="text-left"><h3 className="text-lg font-semibold">我是租客</h3><p className="text-sm text-slate-500">浏览房源、申请租房</p></div></button>}
              {u?.roles?.includes('landlord') && <button onClick={() => handleRoleSelect('landlord')} className="w-full p-6 border-2 border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 flex items-center gap-4"><div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center"><Building className="w-7 h-7 text-emerald-600" /></div><div className="text-left"><h3 className="text-lg font-semibold">我是房东</h3><p className="text-sm text-slate-500">管理房源、收取租金</p></div></button>}
            </div>
            <button onClick={() => { localStorage.removeItem('auth_user'); setStep('login') }} className="w-full mt-6 text-slate-500">切换账号</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-center items-center p-12 text-white">
        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-8"><Home className="w-10 h-10" /></div>
        <h1 className="text-5xl font-bold mb-4">租好</h1><p className="text-xl text-slate-300 mb-12">让租房更简单</p>
        <div className="space-y-4"><div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl"><CheckCircle className="w-5 h-5 text-emerald-400" /><span>一个账号，多种身份</span></div><div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl"><CheckCircle className="w-5 h-5 text-emerald-400" /><span>房东租客，随心切换</span></div></div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8"><div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-3"><Home className="w-7 h-7 text-white" /></div><h1 className="text-2xl font-bold">租好</h1></div>
          <h2 className="text-2xl font-bold mb-1">欢迎登录</h2><p className="text-slate-500 mb-6 text-sm">登录后享受更多租房服务</p>
          {error && <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
          <div className="flex mb-6 bg-slate-100 rounded-xl p-1">
            <button onClick={() => { setLoginMethod('wechat'); setStep('login') }} className={`flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${loginMethod === 'wechat' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66l-.7 2.11 2.47-1.24c.72.19 1.49.29 2.29.29.34 0 .68-.02 1.01-.06A5.97 5.97 0 0110 14.5c0-.17.01-.34.01-.5 0-2.07-1.65-3.75-3.69-3.75-.49 0-.96.09-1.38.26L4.5 7.5c.5-.57 1.19-1 1.97-1.18L5 4c0-.02-.01-.03-.01-.05C3.69 4.64 6.31 4 9.5 4zm5 0c4.14 0 7.5 2.69 7.5 6 0 1.89-1.08 3.56-2.78 4.66l.7 2.11-2.47-1.24c-.72.19-1.49.29-2.29.29-.34 0-.68-.02-1.01-.06A5.97 5.97 0 0114 14.5c0-.17-.01-.34-.01-.5 0-2.07 1.65-3.75 3.69-3.75.49 0 .96.09 1.38.26l1.52-1.76c-.5-.57-1.19-1-1.97-1.18l-.47-2.11c.11.02.23.03.35.03z"/></svg>微信登录</button>
            <button onClick={() => { setLoginMethod('phone'); setStep('login') }} className={`flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${loginMethod === 'phone' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><Phone className="w-4 h-4" />手机登录</button>
          </div>
          <div className="mb-5"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setAgreeError('') }} className="mt-1 w-4 h-4 rounded" /><span className="text-sm text-slate-600">我已阅读并同意<button onClick={() => setShowTermsModal(true)} className="text-blue-600 mx-1">《用户协议》</button>和<button onClick={() => setShowPrivacyModal(true)} className="text-blue-600 mx-1">《隐私政策》</button></span></label>{agreeError && <p className="mt-2 text-sm text-red-500">{agreeError}</p>}</div>
          {loginMethod === 'wechat' && step === 'login' && <div className="space-y-5"><button className="w-full bg-emerald-500 text-white py-4 rounded-xl flex items-center justify-center gap-3"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66l-.7 2.11 2.47-1.24c.72.19 1.49.29 2.29.29.34 0 .68-.02 1.01-.06A5.97 5.97 0 0110 14.5c0-.17.01-.34.01-.5 0-2.07-1.65-3.75-3.69-3.75-.49 0-.96.09-1.38.26L4.5 7.5c.5-.57 1.19-1 1.97-1.18L5 4c0-.02-.01-.03-.01-.05C3.69 4.64 6.31 4 9.5 4zm5 0c4.14 0 7.5 2.69 7.5 6 0 1.89-1.08 3.56-2.78 4.66l.7 2.11-2.47-1.24c-.72.19-1.49.29-2.29.29-.34 0-.68-.02-1.01-.06A5.97 5.97 0 0114 14.5c0-.17-.01-.34-.01-.5 0-2.07 1.65-3.75 3.69-3.75.49 0 .96.09 1.38.26l1.52-1.76c-.5-.57-1.19-1-1.97-1.18l-.47-2.11c.11.02.23.03.35.03z"/></svg>微信快捷登录</button></div>}
          {loginMethod === 'phone' && step === 'login' && <div className="space-y-5"><div><label className="block text-sm font-medium text-slate-700 mb-2">手机号码</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">+86</span><Phone className="absolute left-16 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 11)); setPhoneError('') }} placeholder="请输入11位手机号" maxLength={11} className={`w-full pl-24 pr-12 py-3.5 border rounded-xl ${phoneError ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-500'}`} />{phone && <button onClick={() => setPhone('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><X className="w-5 h-5" /></button>}</div>{phoneError && <p className="mt-2 text-sm text-red-500">{phoneError}</p>}</div><button onClick={sendCode} disabled={loading || countdown > 0} className="w-full bg-blue-600 text-white py-3.5 rounded-xl disabled:opacity-50">{loading ? '发送中...' : countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码'}</button><p className="text-xs text-slate-400 text-center">演示模式：任意输入4位数字即可</p></div>}
          {step === 'code' && <div className="space-y-5"><div className="text-sm text-slate-600 mb-4">已发送验证码到 <span className="font-medium">{phone}</span><button onClick={() => setStep('login')} className="text-blue-600 ml-2">修改</button></div><div><label className="block text-sm font-medium text-slate-700 mb-2">验证码</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type={showCode ? "text" : "password"} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="请输入4位验证码" maxLength={4} className={`w-full pl-12 pr-24 py-3.5 border text-center text-2xl tracking-widest rounded-xl ${codeError ? 'border-red-300' : 'border-slate-200'}`} /><button onClick={() => setShowCode(!showCode)} className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400">{showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>{codeError && <p className="mt-2 text-sm text-red-500">{codeError}</p>}<button onClick={() => { setStep('login'); setCode('') }} className="mt-3 text-sm text-blue-600">重新获取验证码</button></div><button onClick={verifyCode} disabled={loading || code.length !== 4} className="w-full bg-blue-600 text-white py-3.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">{loading && <Loader2 className="w-5 h-5 animate-spin" />}登录</button></div>}
          {step === 'register' && <div className="space-y-5"><div className="text-sm text-slate-600 mb-4">手机号 <span className="font-medium">{phone}</span></div><div><label className="block text-sm font-medium text-slate-700 mb-2">昵称</label><input type="text" value={name} onChange={(e) => { setName(e.target.value); setNameError('') }} placeholder="请输入昵称" className={`w-full px-4 py-3 border rounded-xl ${nameError ? 'border-red-300' : 'border-slate-200'}`} />{nameError && <p className="mt-2 text-sm text-red-500">{nameError}</p>}</div><div><label className="block text-sm font-medium text-slate-700 mb-3">我想作为</label><div className="grid grid-cols-2 gap-3"><button onClick={() => toggleRole('tenant')} className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 ${selectedRoles.includes('tenant') ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}><User className={`w-6 h-6 ${selectedRoles.includes('tenant') ? 'text-blue-600' : 'text-slate-400'}`} /><span className={`text-sm ${selectedRoles.includes('tenant') ? 'text-blue-600' : 'text-slate-600'}`}>租客</span></button><button onClick={() => toggleRole('landlord')} className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 ${selectedRoles.includes('landlord') ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}><Building className={`w-6 h-6 ${selectedRoles.includes('landlord') ? 'text-emerald-600' : 'text-slate-400'}`} /><span className={`text-sm ${selectedRoles.includes('landlord') ? 'text-emerald-600' : 'text-slate-600'}`}>房东</span></button></div><p className="mt-2 text-xs text-slate-500">可同时选择，之后可切换</p></div><button onClick={handleRegister} disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">{loading && <Loader2 className="w-5 h-5 animate-spin" />}注册并登录</button></div>}
          <p className="text-center text-xs text-slate-400 mt-6">登录即表示同意<button onClick={() => setShowTermsModal(true)} className="text-blue-600 mx-1">《用户协议》</button>和<button onClick={() => setShowPrivacyModal(true)} className="text-blue-600 mx-1">《隐私政策》</button></p>
        </div>
      </div>
      {showTermsModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"><div className="p-6 border-b flex justify-between"><h3 className="text-xl font-bold">用户协议</h3><button onClick={() => setShowTermsModal(false)}><X className="w-6 h-6" /></button></div><div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-slate-600 space-y-4"><section><h4 className="font-semibold mb-2">1. 服务条款</h4><p>欢迎使用租好平台服务。</p></section><section><h4 className="font-semibold mb-2">2. 用户责任</h4><p>用户需保证信息真实性。</p></section></div><div className="p-6 border-t"><button onClick={() => { setShowTermsModal(false); setAgreed(true) }} className="w-full bg-blue-600 text-white py-3 rounded-xl">我已阅读并同意</button></div></div></div>}
      {showPrivacyModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"><div className="p-6 border-b flex justify-between"><h3 className="text-xl font-bold">隐私政策</h3><button onClick={() => setShowPrivacyModal(false)}><X className="w-6 h-6" /></button></div><div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-slate-600 space-y-4"><section><h4 className="font-semibold mb-2">1. 信息收集</h4><p>我们收集必要的个人信息。</p></section><section><h4 className="font-semibold mb-2">2. 信息使用</h4><p>用于提供租房服务。</p></section></div><div className="p-6 border-t"><button onClick={() => { setShowPrivacyModal(false); setAgreed(true) }} className="w-full bg-blue-600 text-white py-3 rounded-xl">我已阅读并同意</button></div></div></div>}
    </div>
  )
}
