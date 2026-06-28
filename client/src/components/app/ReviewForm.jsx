import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { reviewService } from '../../services/reviewService'
import { toast } from 'sonner'

export function ReviewForm({ onReviewAdded }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) {
      toast.error('Please select a rating.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await reviewService.create({
        reviewer_name: name,
        rating,
        comment,
      })
      toast.success('Review submitted!')
      onReviewAdded?.(data)
      setName('')
      setRating(0)
      setComment('')
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to submit review.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="review-form">
      <div className="space-y-1.5">
        <Label htmlFor="reviewer-name">Your Name</Label>
        <Input
          id="reviewer-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              id={`star-${star}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= (hovered || rating)
                    ? 'fill-warning text-warning'
                    : 'text-(--color-border)'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-comment">Comment</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={3}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white"
        id="review-submit-btn"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </Button>
    </form>
  )
}
