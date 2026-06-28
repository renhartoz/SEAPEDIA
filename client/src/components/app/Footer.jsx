import { Link } from 'react-router-dom'
import { Waves, Mail } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="bg-(--color-text-primary) text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-sea-400 flex items-center justify-center">
                <Waves className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-lg">
                SEA<span className="text-sea-400">PEDIA</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Indonesia&apos;s multi-role marketplace connecting sellers, buyers, and drivers.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Marketplace</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/catalog" className="text-sm text-white/60 hover:text-white transition-colors">Browse Products</Link>
              <Link to="/register" className="text-sm text-white/60 hover:text-white transition-colors">Become a Seller</Link>
              <Link to="/register" className="text-sm text-white/60 hover:text-white transition-colors">Become a Driver</Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Account</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="text-sm text-white/60 hover:text-white transition-colors">Register</Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Contact</h4>
            <div className="flex flex-col gap-2">
              <a href="mailto:hello@seapedia.id" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                hello@seapedia.id
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />
        <p className="text-sm text-white/40 text-center">
          © {new Date().getFullYear()} SEAPEDIA. Built for COMPFEST 18 SEA Challenge.
        </p>
      </div>
    </footer>
  )
}
