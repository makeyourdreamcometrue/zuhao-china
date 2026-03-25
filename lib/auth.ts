// Auth utility for persistent login
// Handles token storage, refresh, and session management

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const EXPIRY_KEY = 'auth_expiry'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

export interface AuthUser {
  id: string
  phone?: string
  name?: string
  role?: string // Primary role (backward compatibility)
  roles: string[] // All roles user has: ['tenant'], ['landlord'], or ['tenant', 'landlord']
  current_role?: string // Currently active role
  email?: string
  wechat_id?: string
  created_at?: string
}

export interface AuthToken {
  access_token: string
  refresh_token: string
  expires_at: number
}

// Save auth session
export function saveAuthSession(user: AuthUser, token?: string) {
  const expiry = Date.now() + SESSION_DURATION
  
  // Save user data
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(EXPIRY_KEY, expiry.toString())
  
  // Save token if provided (for Supabase auth)
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
  
  // Set cookie for server-side auth (optional)
  document.cookie = `auth_state=valid;max-age=${SESSION_DURATION/1000};path=/`
}

// Get current user
export function getCurrentUser(): AuthUser | null {
  const userStr = localStorage.getItem(USER_KEY)
  const expiryStr = localStorage.getItem(EXPIRY_KEY)
  
  if (!userStr || !expiryStr) return null
  
  const expiry = parseInt(expiryStr)
  if (Date.now() > expiry) {
    // Session expired
    clearAuthSession()
    return null
  }
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Check if user is logged in
export function isAuthenticated(): boolean {
  const user = getCurrentUser()
  const expiryStr = localStorage.getItem(EXPIRY_KEY)
  
  if (!user || !expiryStr) return false
  
  const expiry = parseInt(expiryStr)
  return Date.now() <= expiry
}

// Refresh session (extend expiry)
export function refreshSession() {
  const user = getCurrentUser()
  if (user) {
    const expiry = Date.now() + SESSION_DURATION
    localStorage.setItem(EXPIRY_KEY, expiry.toString())
    document.cookie = `auth_state=valid;max-age=${SESSION_DURATION/1000};path=/`
  }
}

// Clear session (logout)
export function clearAuthSession() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRY_KEY)
  localStorage.removeItem('rememberedPhone')
  
  // Clear cookie
  document.cookie = 'auth_state=;max-age=0;path=/'
}

// Get auth token
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// Auto-refresh session on activity
let refreshTimer: NodeJS.Timeout | null = null

export function startSessionRefresh() {
  // Refresh session every hour if user is active
  refreshTimer = setInterval(() => {
    if (isAuthenticated()) {
      refreshSession()
    }
  }, 60 * 60 * 1000) // 1 hour
}

export function stopSessionRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}
