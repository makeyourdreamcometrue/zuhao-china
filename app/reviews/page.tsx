'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Star, User, MessageCircle, ThumbsUp, Calendar } from 'lucide-react'

interface Review {
  id: string
  property_id: string
  tenant_name: string
  rating: number
  comment: string
  created_at: string
  helpful_count: number
}

interface PropertyReviewsProps {
  propertyId: string
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: '1',
    property_id: '',
    tenant_name: '张先生',
    rating: 5,
    comment: '房子非常好，采光充足，周边配套齐全。房东服务也很到位，推荐！',
    created_at: '2026-03-15',
    helpful_count: 12
  },
  {
    id: '2',
    property_id: '',
    tenant_name: '李女士',
    rating: 4,
    comment: '位置不错，交通便利。装修也很新，整体满意。',
    created_at: '2026-03-10',
    helpful_count: 8
  },
  {
    id: '3',
    property_id: '',
    tenant_name: '王同学',
    rating: 5,
    comment: '性价比超高！适合上班族通勤。已推荐给同事。',
    created_at: '2026-03-05',
    helpful_count: 15
  }
]

export default function PropertyReviews({ propertyId }: PropertyReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const supabase = createClient()

  useEffect(() => {
    fetchReviews()
  }, [propertyId])

  async function fetchReviews() {
    setLoading(true)
    
    // Try to fetch from database
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
    
    if (data && data.length > 0) {
      setReviews(data)
    } else {
      // Use mock data
      setReviews(mockReviews.map(r => ({ ...r, property_id: propertyId })))
    }
    setLoading(false)
  }

  async function submitReview() {
    if (!newReview.comment.trim()) return

    const userStr = localStorage.getItem('auth_user')
    const user = userStr ? JSON.parse(userStr) : null

    const review = {
      id: Date.now().toString(),
      property_id: propertyId,
      tenant_name: user?.name || '匿名用户',
      rating: newReview.rating,
      comment: newReview.comment,
      helpful_count: 0,
      created_at: new Date().toISOString()
    }

    // Save to database (or local storage for demo)
    setReviews([review, ...reviews] as typeof reviews)
    setNewReview({ rating: 5, comment: '' })
    setShowForm(false)
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">租客评价</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(Number(avgRating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-gray-600">{avgRating} ({reviews.length} 条评价)</span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          发表评价
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">评分</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })}>
                  <Star className={`w-8 h-8 ${star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">评价内容</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="分享您的租房体验..."
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={submitReview} className="px-4 py-2 bg-blue-600 text-white rounded-lg">提交</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">取消</button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无评价</div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="p-4 border rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{review.tenant_name}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {review.created_at}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{review.comment}</p>
              <button className="mt-2 text-sm text-gray-500 flex items-center gap-1 hover:text-blue-600">
                <ThumbsUp className="w-4 h-4" />
                有帮助 ({review.helpful_count})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
