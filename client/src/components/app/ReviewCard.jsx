import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function ReviewCard({ review }) {
  return (
    <Card className="border-(--color-border)" style={{ boxShadow: 'var(--shadow-card)' }}>
      <CardContent className="pt-5 pb-5 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sea-100 text-sea-700 text-sm font-semibold">
              {review.reviewer_name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{review.reviewer_name}</p>
            <div className="flex gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= review.rating ? 'fill-warning text-warning' : 'text-(--color-border)'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-(--color-text-secondary) leading-relaxed">
          {review.comment}
        </p>
        <p className="text-xs text-(--color-text-muted)">
          {new Date(review.created_at).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </CardContent>
    </Card>
  )
}
