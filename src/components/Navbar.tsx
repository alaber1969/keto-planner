import { Link, useLocation } from 'react-router-dom';
import { Calculator, Home, Utensils, BookOpen, ChefHat, ClipboardList } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
    },
    {
      path: '/calculator',
      label: 'Calculator',
      icon: Calculator,
    },
    {
      path: '/meal-planner',
      label: 'Meal Planner',
      icon: Utensils,
    },
    {
      path: '/progress',
      label: 'My Plans',
      icon: ClipboardList,
    },
    {
      path: '/education',
      label: 'Learn Keto',
      icon: BookOpen,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              KetoPlanner
            </span>
          </Link>

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

          {/* Mobile menu */}
          <div className="flex md:hidden items-center space-x-1">
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
                    'transition-all duration-200 px-2',
                    isActive && 'bg-emerald-600 hover:bg-emerald-700'
                  )}
                >
                  <Link to={item.path}>
                    <Icon className="h-4 w-4" />
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
