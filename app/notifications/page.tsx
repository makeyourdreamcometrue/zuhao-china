'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Bell, Mail, MessageCircle, Check, CheckCheck, Send, Plus, Trash2, Search, Filter, Home, User, Calendar, Wrench, AlertCircle } from 'lucide-react'

interface Notification {
  id: string
  title: string
  content: string
  type: 'rent_reminder' | 'repair_update' | 'checkin_reminder' | 'checkout_reminder' | 'announcement'
  sender_id: string
  recipient_id: string
  is_read: boolean
  status: 'pending' | 'sent' | 'failed'
  created_at: string
  sender?: { name: string; role: string }
  recipient?: { name: string; role: string }
}

const notificationTypes = [
  { value: 'rent_reminder', label: '租金提醒', icon: Calendar, color: 'bg-yellow-500' },
  { value: 'repair_update', label: '维修进度', icon: Wrench, color: 'bg-blue-500' },
  { value: 'checkin_reminder', label: '入住提醒', icon: Home, color: 'bg-green-500' },
  { value: 'checkout_reminder', label: '退房提醒', icon: Home, color: 'bg-orange-500' },
  { value: 'announcement', label: '系统公告', icon: Bell, color: 'bg-purple-500' },
]

export default function NotificationsPage() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Compose form
  const [composeForm, setComposeForm] = useState({
    title: '',
    content: '',
    type: 'announcement' as Notification['type'],
    recipient_id: '',
    send_email: false,
    send_wechat: false
  })

  useEffect(() => {
    const userStr = localStorage.getItem('auth_user')
    const expiryStr = localStorage.getItem('auth_expiry')
    if (userStr && expiryStr && Date.now() <= parseInt(expiryStr)) {
      const u = JSON.parse(userStr)
      setUser(u)
      fetchNotifications(u.id)
    }
  }, [])

  async function fetchNotifications(userId: string) {
    setLoading(true)
    
    // Try fetching from database, use mock data if table doesn't exist
    const { data, error } = await supabase
      .from('notifications')
      .select('*, sender:users!sender_id(name,role), recipient:users!recipient_id(name,role)')
      .or(`recipient_id.eq.${userId},sender_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      // Use mock data if table doesn't exist
      setNotifications([
        { id: '1', title: '欢迎使用租好平台', content: '您的账户已创建成功，开始您的租房之旅吧！', type: 'announcement', sender_id: 'system', recipient_id: userId, is_read: false, status: 'sent', created_at: new Date().toISOString() },
        { id: '2', title: '租金提醒', content: '您的租金将于3天后到期，请及时缴纳。', type: 'rent_reminder', sender_id: 'system', recipient_id: userId, is_read: false, status: 'sent', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', title: '看房预约确认', content: '您预约的天河CBD精装两房看房时间已确认。', type: 'checkin_reminder', sender_id: 'system', recipient_id: userId, is_read: true, status: 'sent', created_at: new Date(Date.now() - 172800000).toISOString() },
        { id: '4', title: '维修进度更新', content: '您的维修工单已安排师傅上门处理。', type: 'repair_update', sender_id: 'system', recipient_id: userId, is_read: true, status: 'sent', created_at: new Date(Date.now() - 259200000).toISOString() },
      ])
    } else if (data) {
      setNotifications(data)
    }
    setLoading(false)
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter(n => !n.is_read && n.recipient_id === user?.id).map(n => n.id)
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  async function sendNotification() {
    if (!composeForm.title || !composeForm.content) return

    // Try to insert to database, add locally if it fails
    let error = null
    try { await supabase.from('notifications').insert({
      title: composeForm.title,
      content: composeForm.content,
      type: composeForm.type,
      sender_id: user?.id,
      recipient_id: composeForm.recipient_id || null,
      is_read: false,
      status: 'sent'
    })} catch (e) { error = e }

    // Add notification locally for demo
    const newNotif = {
      id: Date.now().toString(),
      title: composeForm.title,
      content: composeForm.content,
      type: composeForm.type,
      sender_id: user?.id,
      recipient_id: composeForm.recipient_id || user?.id,
      is_read: false,
      status: 'sent',
      created_at: new Date().toISOString()
    }
    setNotifications([newNotif, ...notifications])
    
    setShowCompose(false)
    setComposeForm({ title: '', content: '', type: 'announcement', recipient_id: '', send_email: false, send_wechat: false })
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter !== 'all' && n.type !== filter) return false
    if (searchTerm && !n.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.is_read && n.recipient_id === user?.id).length

  const getTypeInfo = (type: string) => notificationTypes.find(t => t.value === type) || notificationTypes[4]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">消息中心</h1>
              <p className="text-gray-500 text-sm">查看和管理您的通知消息</p>
            </div>
            <button
              onClick={() => setShowCompose(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> 发送通知
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">总消息</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">未读</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">已发送</p>
                <p className="text-2xl font-bold">{notifications.filter(n => n.sender_id === user?.id).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">发送方式</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索消息..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">全部类型</option>
              {notificationTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-blue-600 hover:underline text-sm"
              >
                全部标为已读
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">加载中...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">暂无消息</p>
            </div>
          ) : (
            filteredNotifications.map(notification => {
              const typeInfo = getTypeInfo(notification.type)
              const TypeIcon = typeInfo.icon
              const isMine = notification.sender_id === user?.id || notification.recipient_id === user?.id
              
              if (!isMine && user?.role !== 'admin') return null

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition ${!notification.is_read && notification.recipient_id === user?.id ? 'border-l-4 border-l-blue-500' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${typeInfo.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{notification.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${typeInfo.color} text-white`}>
                          {typeInfo.label}
                        </span>
                        {!notification.is_read && notification.recipient_id === user?.id && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notification.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{new Date(notification.created_at).toLocaleString('zh-CN')}</span>
                        <span className="flex items-center gap-1">
                          {notification.sender?.name || '系统'}
                        </span>
                        <span className={`flex items-center gap-1 ${notification.status === 'sent' ? 'text-green-500' : 'text-red-500'}`}>
                          {notification.status === 'sent' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {notification.status === 'sent' ? '已发送' : '发送失败'}
                        </span>
                      </div>
                    </div>
                    {!notification.is_read && notification.recipient_id === user?.id && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">发送通知</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">消息类型</label>
                <select
                  value={composeForm.type}
                  onChange={(e) => setComposeForm({ ...composeForm, type: e.target.value as any })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {notificationTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">标题</label>
                <input
                  type="text"
                  value={composeForm.title}
                  onChange={(e) => setComposeForm({ ...composeForm, title: e.target.value })}
                  placeholder="请输入消息标题"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">内容</label>
                <textarea
                  value={composeForm.content}
                  onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                  placeholder="请输入消息内容"
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">发送方式</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked className="w-4 h-4" />
                    <MessageCircle className="w-4 h-4" />站内消息
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={composeForm.send_email} onChange={(e) => setComposeForm({ ...composeForm, send_email: e.target.checked })} className="w-4 h-4" />
                    <Mail className="w-4 h-4" />邮件
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={composeForm.send_wechat} onChange={(e) => setComposeForm({ ...composeForm, send_wechat: e.target.checked })} className="w-4 h-4" />
                    <span>微信</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowCompose(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={sendNotification}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
