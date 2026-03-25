// Security utilities for the SaaS platform
// Includes encryption, sanitization, permission checks

// ============================================
// PASSWORD ENCRYPTION (SHA-256)
// ============================================

// Simple hash function for demo (in production, use bcrypt)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'zuhao_salt_2026')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// ============================================
// INPUT SANITIZATION (XSS Prevention)
// ============================================

export function sanitizeHTML(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  return str.replace(/[&<>"'/]/g, char => map[char])
}

export function sanitizeInput(input: string): string {
  // Remove any HTML tags
  let clean = input.replace(/<[^>]*>/g, '')
  // Remove script tags
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  // Remove on* event handlers
  clean = clean.replace(/\bon\w+\s*=/gi, '')
  // Remove javascript: URLs
  clean = clean.replace(/javascript:/gi, '')
  // Remove data: URLs
  clean = clean.replace(/data:/gi, '')
  return clean.trim()
}

// ============================================
// SQL INJECTION PREVENTION
// ============================================

// Note: Using Supabase client automatically parameterizes queries
// This is additional validation for any raw inputs

export function validatePhone(phone: string): boolean {
  // Chinese mobile: 11 digits starting with 1
  return /^1[3-9]\d{9}$/.test(phone)
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateWechatId(id: string): boolean {
  // Simple validation: alphanumeric, underscore, 4-20 chars
  return /^[a-zA-Z0-9_]{4,20}$/.test(id)
}

export function sanitizeForSQL(input: string): string {
  // Escape special characters that could be used in SQL
  // This is a backup - always use parameterized queries!
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
}

// ============================================
// DATA PERMISSION CONTROL
// ============================================

export interface User {
  id: string
  phone: string
  name?: string
  role: 'landlord' | 'tenant' | 'admin'
  email?: string
  wechat_id?: string
}

// Check if user can access a resource
export function canAccessResource(
  user: User | null,
  resourceOwnerId: string,
  allowAdmin: boolean = true
): boolean {
  if (!user) return false
  if (allowAdmin && user.role === 'admin') return true
  return user.id === resourceOwnerId
}

// Check if user is landlord
export function isLandlord(user: User | null): boolean {
  return user?.role === 'landlord'
}

// Check if user is admin
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

// Check if user is tenant
export function isTenant(user: User | null): boolean {
  return user?.role === 'tenant'
}

// ============================================
// SESSION SECURITY
// ============================================

const SESSION_KEY = 'auth_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

interface Session {
  user: User
  loginTime: number
  expiresAt: number
  ipAddress?: string
  userAgent?: string
}

export function createSession(user: User): void {
  const session: Session = {
    user,
    loginTime: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession(): Session | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY)
    if (!sessionStr) return null
    
    const session: Session = JSON.parse(sessionStr)
    
    // Check expiry
    if (Date.now() > session.expiresAt) {
      destroySession()
      return null
    }
    
    return session
  } catch {
    return null
  }
}

export function destroySession(): void {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('auth_user')
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_expiry')
  document.cookie = 'auth_state=;max-age=0;path=/'
}

export function refreshSession(): boolean {
  const session = getSession()
  if (!session) return false
  
  const updatedSession: Session = {
    ...session,
    expiresAt: Date.now() + SESSION_DURATION
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession))
  return true
}

// ============================================
// API RATE LIMITING (Client-side display)
// ============================================

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
}

const rateLimits: Map<string, { count: number; resetTime: number }> = new Map()

export function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now()
  const record = rateLimits.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + config.windowMs })
    return true
  }
  
  if (record.count >= config.maxAttempts) {
    return false
  }
  
  record.count++
  return true
}

export function getRateLimitRemaining(key: string): number {
  const record = rateLimits.get(key)
  if (!record || Date.now() > record.resetTime) return 5
  return 5 - record.count
}

// ============================================
// CSRF PROTECTION
// ============================================

export function generateCSRFToken(): string {
  return crypto.randomUUID()
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length > 0
}

// ============================================
// FILE UPLOAD SECURITY
// ============================================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: '只支持 JPG, PNG, GIF, WebP 格式' }
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '文件大小不能超过 5MB' }
  }
  
  return { valid: true }
}
