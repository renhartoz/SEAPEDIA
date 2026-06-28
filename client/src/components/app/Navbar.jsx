import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { ShoppingBag, Waves, Home, Search, LayoutDashboard, User } from 'lucide-react'
import { useState } from 'react'

const ROLE_COLORS = {
  buyer: 'bg-sea-500 text-white',
  seller: 'bg-brand-600 text-white',
  driver: 'bg-success text-white',
  admin: 'bg-danger text-white',
}

const ROLE_DASHBOARDS = {
  buyer: '/buyer',
  seller: '/seller',
  driver: '/driver',
  admin: '/admin',
}

export function Navbar() {
  const { user, activeRole, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-(--color-border) bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-sea-500 flex items-center justify-center">
              <Waves className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-(--color-text-primary) tracking-tight">
              SEA<span className="text-brand-500">PEDIA</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/catalog"
              className="text-sm font-medium text-(--color-text-secondary) hover:text-brand-600 transition-colors"
            >
              Browse
            </Link>
            {!user && (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
            {user && (
              <div className="flex items-center gap-3">
                {activeRole === 'buyer' && (
                  <Link to="/buyer/cart" className="relative p-2 text-(--color-text-secondary) hover:text-brand-600 transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                  </Link>
                )}
                {activeRole && (
                  <Badge className={`text-xs capitalize ${ROLE_COLORS[activeRole] || ''}`}>
                    {activeRole}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto" id="user-menu-trigger">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-brand-100 text-brand-700 text-sm font-semibold">
                          {user.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold">{user.username}</p>
                      <p className="text-xs text-(--color-text-muted)">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {activeRole && (
                      <DropdownMenuItem asChild>
                        <Link to={ROLE_DASHBOARDS[activeRole]}>Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/role-select">Switch Role</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-danger focus:text-danger"
                      onClick={handleLogout}
                      id="logout-btn"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-(--color-border) z-50 flex items-center justify-around px-2 pb-safe">
        <Link to="/" className="flex flex-col items-center gap-1 p-2 text-(--color-text-secondary) hover:text-brand-600">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/catalog" className="flex flex-col items-center gap-1 p-2 text-(--color-text-secondary) hover:text-brand-600">
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Browse</span>
        </Link>
        
        {user && activeRole === 'buyer' && (
          <Link to="/buyer/cart" className="flex flex-col items-center gap-1 p-2 text-(--color-text-secondary) hover:text-brand-600">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-medium">Cart</span>
          </Link>
        )}

        {user && activeRole && (
          <Link to={ROLE_DASHBOARDS[activeRole]} className="flex flex-col items-center gap-1 p-2 text-(--color-text-secondary) hover:text-brand-600">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center gap-1 p-2 text-(--color-text-secondary) hover:text-brand-600">
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">{user ? 'Profile' : 'Account'}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48 mb-2">
            {!user ? (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/login" className="w-full">Sign In</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/register" className="w-full">Register</Link>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold">{user.username}</p>
                  <p className="text-xs text-(--color-text-muted)">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/role-select" className="w-full">Switch Role</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-danger focus:text-danger w-full cursor-pointer"
                  onClick={handleLogout}
                >
                  Sign Out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
