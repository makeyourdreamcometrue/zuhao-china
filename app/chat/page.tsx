'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { MessageCircle, Send, User, Search, Plus, Loader2 } from 'lucide-react'

interface Chat {
  id: string
  participant_id: string
  participant_name: string
  last_message: string
  last_time: string
  unread: number
}

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_mine: boolean
}

// Mock conversations
const mockChats: Chat[] = [
  { id: '1', participant_id: 'u1', participant_name: '张房东', last_message: '房子看好了吗？', last_time: '10:30', unread: 2 },
  { id: '2', participant_id: 'u2', participant_name: '李房东', last_message: '欢迎来看房', last_time: '昨天', unread: 0 },
  { id: '3', participant_id: 'u3', participant_name: '王房东', last_message: '可以签约了', last_time: '3天前', unread: 0 },
]

const mockMessages: Message[] = [
  { id: '1', sender_id: 'u1', content: '您好，我想咨询一下这套房子的情况', created_at: '10:00', is_mine: true },
  { id: '2', sender_id: 'landlord', content: '您好，请问有什么想了解的？', created_at: '10:05', is_mine: false },
  { id: '3', sender_id: 'u1', content: '房子在几楼？采光怎么样？', created_at: '10:10', is_mine: true },
  { id: '4', sender_id: 'landlord', content: '房子在15楼，南朝向，采光非常好。', created_at: '10:15', is_mine: false },
  { id: '5', sender_id: 'u1', content: '房子看好了吗？', created_at: '10:30', is_mine: false },
]

export default function ChatPage() {
  const supabase = createClient()
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('auth_user')
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
    fetchChats()
  }, [])

  async function fetchChats() {
    setLoading(true)
    // Use mock data for demo
    setChats(mockChats)
    setLoading(false)
  }

  async function fetchMessages(chatId: string) {
    setLoading(true)
    // Use mock messages for demo
    setMessages(mockMessages)
    setLoading(false)
  }

  function selectChat(chat: Chat) {
    setSelectedChat(chat)
    fetchMessages(chat.id)
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedChat) return

    setSending(true)

    // Add message locally
    const msg: Message = {
      id: Date.now().toString(),
      sender_id: currentUser?.id || 'me',
      content: newMessage,
      created_at: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      is_mine: true
    }

    setMessages([...messages, msg])
    setNewMessage('')
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            消息中心
          </h1>
          <p className="text-gray-500">与房东沟通</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-200px)]">
          {/* Chat List */}
          <div className={`${selectedChat ? 'hidden md:block' : ''} md:w-1/3 border-r h-full`}>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索聊天..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-65px)]">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                </div>
              ) : chats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  暂无消息
                </div>
              ) : (
                chats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition ${selectedChat?.id === chat.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{chat.participant_name}</p>
                        <span className="text-xs text-gray-400">{chat.last_time}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{chat.last_message}</p>
                    </div>
                    {chat.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`${selectedChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <button onClick={() => setSelectedChat(null)} className="md:hidden">
                    ←
                  </button>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedChat.participant_name}</p>
                    <p className="text-xs text-gray-500">在线</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loading ? (
                    <div className="text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                    </div>
                  ) : messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${msg.is_mine ? 'order-2' : ''}`}>
                        <div className={`p-3 rounded-xl ${msg.is_mine ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                          <p>{msg.content}</p>
                        </div>
                        <p className={`text-xs text-gray-400 mt-1 ${msg.is_mine ? 'text-right' : ''}`}>
                          {msg.created_at}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="输入消息..."
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                  <p>选择一个对话开始聊天</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
