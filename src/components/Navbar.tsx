import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calculator, Home, Utensils, BookOpen, ClipboardList, Compass, Menu, X, Newspaper } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/guide', label: 'Guide', icon: Compass },
    { path: '/calculator', label: 'Calculator', icon: Calculator },
    { path: '/meal-planner', label: 'Meal Planner', icon: Utensils },
    { path: '/progress', label: 'My Plans', icon: ClipboardList },
    { path: '/blog', label: 'Blog', icon: Newspaper },
    { path: '/education', label: 'Learn Keto', icon: BookOpen },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobile}>
            <svg className="h-8 w-8" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="navLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#059669"/>
                  <stop offset="100%" stop-color="#0d9488"/>
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#navLogo)"/>
              <text x="50" y="62" font-family="Arial,sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="white">K</text>
            </svg>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              KetoPlanner
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  asChild
                  className={cn(
                    'transition-all duration-200',
                    isActive && 'bg-emerald-600 hover:bg-emerald-700'
                  )}
                >
                  <Link to={item.path} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white pb-3 pt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
