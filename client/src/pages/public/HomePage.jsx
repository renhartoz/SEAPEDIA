import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ReviewForm } from '../../components/app/ReviewForm'
import { ReviewCard } from '../../components/app/ReviewCard'
import { useState, useEffect } from 'react'
import { reviewService } from '../../services/reviewService'
import {
  ShoppingBag,
  Store,
  Truck,
  ShieldCheck,
  ArrowRight,
  Star,
  Package,
  Zap,
} from 'lucide-react'

const FEATURES = [
  { icon: Store, title: 'Multiple Stores', desc: 'Browse from hundreds of verified sellers.' },
  { icon: Zap, title: 'Instant Delivery', desc: 'Get your order delivered in hours.' },
  { icon: ShieldCheck, title: 'Buyer Protection', desc: 'Auto-refund if your order is overdue.' },
  { icon: Package, title: 'Easy Management', desc: 'Sellers manage inventory in real time.' },
]

import { catalogService } from '../../services/catalogService'

export function HomePage() {
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    reviewService
      .list({ page_size: 6 })
      .then(({ data }) => setReviews(data.results || []))
      .catch(() => {})
      
    catalogService
      .getProducts()
      .then(({ data }) => {
        setProducts(data.slice(0, 6))
      })
      .catch(() => {})
  }, [])

  const handleReviewAdded = (review) => {
    setReviews((prev) => [review, ...prev])
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-sea-800 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, oklch(70% 0.2 195) 0%, transparent 50%), radial-gradient(circle at 75% 20%, oklch(60% 0.2 220) 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl animate-fade-in-up">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/20">
              🌊 Indonesia's Next-Gen Marketplace
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Shop Smarter,{' '}
              <span className="bg-gradient-to-r from-sea-300 to-brand-300 bg-clip-text text-transparent">
                Sell Better
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-white/70 mb-8 leading-relaxed">
              SEAPEDIA connects buyers with trusted sellers, powered by a driver network
              for fast and reliable delivery across Indonesia.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/catalog" id="hero-browse-btn">
                <Button size="lg" className="bg-white text-brand-800 hover:bg-brand-50 font-semibold gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Start Shopping
                </Button>
              </Link>
              <Link to="/register" id="hero-register-btn">
                <Button size="lg" variant="outline" className="border-white/30 text-brand-800 hover:text-white hover:bg-white/10 gap-2">
                  Open Your Store
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-(--color-surface-raised) border border-(--color-border) hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-sea-500 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-(--color-text-secondary)">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-(--color-surface-sunken) py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <p className="text-sm text-(--color-text-muted) mt-1">Discover what's trending</p>
            </div>
            <Link to="/catalog">
              <Button variant="ghost" className="gap-1 text-brand-600">
                View all <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 && (
              <p className="text-sm text-(--color-text-muted) italic col-span-full">No products found.</p>
            )}
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} id={`product-${product.id}`}>
                <Card className="border-(--color-border) hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                  <div className="h-44 bg-gradient-to-br from-brand-50 to-sea-50 flex items-center justify-center text-6xl">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-16 h-16 text-brand-300" />
                    )}
                  </div>
                  <CardContent className="pt-4 pb-5">
                    <p className="text-xs text-(--color-text-muted) mb-1">{product.store_name}</p>
                    <h3 className="font-semibold text-sm mb-2 leading-snug">{product.name}</h3>
                    <p className="font-bold text-brand-600">
                      Rp {Number(product.price).toLocaleString('id-ID')}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-2">What People Say</h2>
            <p className="text-(--color-text-secondary) text-sm mb-6">
              Real feedback from our community.
            </p>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
              {reviews.length === 0 && (
                <p className="text-sm text-(--color-text-muted) italic">No reviews yet. Be the first!</p>
              )}
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          </div>
          <div className="bg-(--color-surface-raised) rounded-2xl border border-(--color-border) p-8" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h3 className="text-lg font-bold mb-1">Share Your Experience</h3>
            <p className="text-sm text-(--color-text-muted) mb-6">
              Anyone can leave a review — no purchase required.
            </p>
            <ReviewForm onReviewAdded={handleReviewAdded} />
          </div>
        </div>
      </section>
    </div>
  )
}
