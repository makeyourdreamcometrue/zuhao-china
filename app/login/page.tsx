'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Home, CheckCircle, AlertCircle, X, Loader2, User, Building } from 'lucide-react'

// Security functions
const sanitizeInput = (input: string): string => {
  return input.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim()
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

// Role selection helper
const getDefaultRole = (roles: string[]) => {
  if (roles.length === 1) return roles[0]
  return null // Need to choose
}

const navigateByRole = (role: string, router: any) => {
  if (role === 'landlord') {
    router.push('/dashboard')
  } else if (role === 'tenant') {
    router.push('/properties')
  } else if (role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/')
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'login' | 'register' | 'select-role'>('login')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState('')
  
  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Registration options
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['tenant'])
  const [agreed, setAgreed] = useState(false)
  
  // Errors
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [nameError, setNameError] = useState('')
  const [agreeError, setAgreeError] = useState('')
  
  // Modals
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  
  const supabase = createClient()
  
  // Check for existing session on mount
  useEffect(() => {
    const initAuth = () => {
      if (isAuthenticated()) {
        const user = getCurrentUser()
        if (user) {
          // If user has a current_role set, use it
          if (user.current_role) {
            navigateByRole(user.current_role, router)
            return
          }
          // Otherwise, determine where to go
          const roles = user.roles || [user.role].filter(Boolean)
          const defaultRole = getDefaultRole(roles)
          if (defaultRole) {
            // Update current role and navigate
            user.current_role = defaultRole
            localStorage.setItem('auth_user', JSON.stringify(user))
            navigateByRole(defaultRole, router)
            return
          }
          // Has multiple roles, show selection
          setStep('select-role')
          setInitializing(false)
          return
        }
      }
      setInitializing(false)
    }
    initAuth()
  }, [])

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleLogin = async () => {
    setEmailError(''); setPasswordError(''); setError('')
    
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)
    
    if (!sanitizedEmail) { setEmailError('请输入邮箱'); return }
    if (!validateEmail(sanitizedEmail)) { setEmailError('请输入有效的邮箱地址'); return }
    if (!sanitizedPassword) { setPasswordError('请输入密码'); return }
    if (sanitizedPassword.length < 6) { setPasswordError('密码至少6位'); return }
    
    setLoading(true)
    
    try {
      // Check if user exists in our users table
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', sanitizedEmail.toLowerCase())
        .single()
      
      if (fetchError || !existingUser) {
        setError('用户不存在，请先注册')
        setLoading(false)
        return
      }
      
      // For demo: accept any password for existing users (in production, use proper auth)
      // In real app, you'd verify password hash here
      const userData = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        roles: existingUser.roles || [existingUser.role].filter(Boolean),
        role: existingUser.role, // Keep for backward compatibility
      }
      
      // Determine default role
      const defaultRole = getDefaultRole(userData.roles)
      if (defaultRole) {
        (userData as any).current_role = defaultRole
      }
      
      saveAuthSession(userData)
      
      // Navigate
      if (defaultRole) {
        navigateByRole(defaultRole, router)
      } else {
        // Show role selection
        setStep('select-role')
      }
      
    } catch (err) {
      setError('登录失败，请重试')
    }
    
    setLoading(false)
  }

  const handleRegister = async () => {
    setEmailError(''); setPasswordError(''); setNameError(''); setAgreeError(''); setError('')
    
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)
    const sanitizedName = sanitizeInput(name)
    
    if (!sanitizedEmail) { setEmailError('请输入邮箱'); return }
    if (!validateEmail(sanitizedEmail)) { setEmailError('请输入有效的邮箱地址'); return }
    if (!sanitizedPassword) { setPasswordError('请输入密码'); return }
    if (sanitizedPassword.length < 6) { setPasswordError('密码至少6位'); return }
    if (!confirmPassword) { setPasswordError('请确认密码'); return }
    if (sanitizedPassword !== confirmPassword) { setPasswordError('两次密码不一致'); return }
    if (!sanitizedName) { setNameError('请输入昵称'); return }
    if (selectedRoles.length === 0) { setError('请选择至少一个身份'); return }
    if (!agreed) { setAgreeError('请阅读并同意用户协议和隐私政策'); return }
    
    setLoading(true)
    
    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', sanitizedEmail.toLowerCase())
        .single()
      
      if (existingUser) {
        setError('该邮箱已被注册')
        setLoading(false)
        return
      }
      
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: sanitizedEmail.toLowerCase(),
          name: sanitizedName,
          role: selectedRoles[0], // Primary role
          roles: selectedRoles,   // All roles
          phone: '', // Will be updated later if needed
        })
        .select()
        .single()
      
      if (insertError) {
        setError('注册失败: ' + insertError.message)
        setLoading(false)
        return
      }
      
      // Auto-login after registration
      const userData: any = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        roles: newUser.roles || selectedRoles,
        role: newUser.role,
      }
      
      // Determine navigation
      const defaultRole = getDefaultRole(userData.roles)
      if (defaultRole) {
        userData.current_role = defaultRole
      }
      
      saveAuthSession(userData)
      
      if (defaultRole) {
        navigateByRole(defaultRole, router)
      } else {
        setStep('select-role')
      }
      
    } catch (err) {
      setError('注册失败，请重试')
    }
    
    setLoading(false)
  }

  const handleRoleSelect = (selectedRole: string) => {
    const user = getCurrentUser()
    if (user) {
      user.current_role = selectedRole
      localStorage.setItem('auth_user', JSON.stringify(user))
      navigateByRole(selectedRole, router)
    }
  }

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter(r => r !== role))
      }
    } else {
      setSelectedRoles([...selectedRoles, role])
    }
  }

  if (initializing) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /><p className="text-gray-500 mt-2">加载中...</p></div>
    </div>
  )

  // Role Selection Screen (for users with both tenant + landlord)
  if (step === 'select-role') {
    const user = getCurrentUser()
    const roles = user?.roles || []
    
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="max-w-md text-center relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
              <Home className="w-10 h-10" />
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight">租好</h1>
            <p className="text-xl text-slate-300 mb-12">选择您的身份</p>
          </div>
        </div>

        {/* Right Side - Role Selection */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">欢迎回来，{user?.name || '用户'}</h2>
              <p className="text-slate-500">请选择您要使用的身份</p>
            </div>

            <div className="space-y-4">
              {roles.includes('tenant') && (
                <button
                  onClick={() => handleRoleSelect('tenant')}
                  className="w-full p-6 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-900">租客</h3>
                    <p className="text-sm text-slate-500">浏览房源、申请租房、管理租约</p>
                  </div>
                </button>
              )}

              {roles.includes('landlord') && (
                <button
                  onClick={() => handleRoleSelect('landlord')}
                  className="w-full p-6 border-2 border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Building className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-900">房东</h3>
                    <p className="text-sm text-slate-500">管理房源、收取租金、处理维修</p>
                  </div>
                </button>
              )}

              {roles.includes('admin') && (
                <button
                  onClick={() => handleRoleSelect('admin')}
                  className="w-full p-6 border-2 border-slate-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Home className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-900">管理员</h3>
                    <p className="text-sm text-slate-500">系统管理后台</p>
                  </div>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('auth_user')
                localStorage.removeItem('auth_expiry')
                setStep('login')
              }}
              className="w-full mt-6 text-slate-500 py-3 text-sm hover:text-slate-700"
            >
              切换账号
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
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
              <span className="text-slate-300">一个账号，多种身份</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur p-4 rounded-xl border border-white/10">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">房东租客，随心切换</span>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {step === 'login' ? '欢迎登录' : '创建账户'}
            </h2>
            <p className="text-slate-500 mb-6 text-sm">
              {step === 'login' ? '登录后享受更多租房服务' : '注册一个账号，开始您的租房之旅'}
            </p>
            
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

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

            {/* Login Form */}
            {step === 'login' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }} 
                      placeholder="your@email.com" 
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-xl text-base ${emailError ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} 
                    />
                  </div>
                  {emailError && <p className="mt-2 text-sm text-red-500">{emailError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">密码</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }} 
                      placeholder="请输入密码" 
                      className={`w-full pl-12 pr-12 py-3.5 border rounded-xl text-base ${passwordError ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && <p className="mt-2 text-sm text-red-500">{passwordError}</p>}
                </div>

                <button 
                  onClick={handleLogin} 
                  disabled={loading} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  登录
                </button>

                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={() => { setStep('register'); setError(''); }} 
                    className="text-sm text-blue-600 hover:underline"
                  >
                    还没有账号？立即注册
                  </button>
                </div>
              </div>
            )}

            {/* Register Form */}
            {step === 'register' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">昵称</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => { setName(e.target.value); setNameError(''); }} 
                      placeholder="请输入昵称" 
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-xl text-base ${nameError ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} 
                    />
                  </div>
                  {nameError && <p className="mt-2 text-sm text-red-500">{nameError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }} 
                      placeholder="your@email.com" 
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-xl text-base ${emailError ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} 
                    />
                  </div>
                  {emailError && <p className="mt-2 text-sm text-red-500">{emailError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">密码</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }} 
                      placeholder="至少6位" 
                      className={`w-full pl-12 pr-12 py-3.5 border rounded-xl text-base ${passwordError ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && <p className="mt-2 text-sm text-red-500">{passwordError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">确认密码</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }} 
                      placeholder="再次输入密码" 
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-xl text-base ${passwordError ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} 
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">我想作为</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => toggleRole('tenant')}
                      className={`p-4 border-2 rounded-xl transition flex flex-col items-center gap-2 ${selectedRoles.includes('tenant') ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <User className={`w-6 h-6 ${selectedRoles.includes('tenant') ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className={`text-sm font-medium ${selectedRoles.includes('tenant') ? 'text-blue-600' : 'text-slate-600'}`}>租客</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleRole('landlord')}
                      className={`p-4 border-2 rounded-xl transition flex flex-col items-center gap-2 ${selectedRoles.includes('landlord') ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <Building className={`w-6 h-6 ${selectedRoles.includes('landlord') ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className={`text-sm font-medium ${selectedRoles.includes('landlord') ? 'text-emerald-600' : 'text-slate-600'}`}>房东</span>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">您可以同时选择两个身份，之后可以随时切换</p>
                </div>

                <button 
                  onClick={handleRegister} 
                  disabled={loading} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  注册
                </button>

                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={() => { setStep('login'); setError(''); }} 
                    className="text-sm text-blue-600 hover:underline"
                  >
                    已有账号？立即登录
                  </button>
                </div>
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
                <p>我们收集必要的个人信息用于提供服务，包括邮箱、昵称等。</p>
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
    </div>
  )
}
