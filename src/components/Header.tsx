import { Globe, LogOut } from 'lucide-react';
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HeaderProps {
  children?: ReactNode;
  showNavigation?: boolean;
}

// NavLink component for consistent styling
interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
}

function NavLink({ to, children, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'px-4 py-2 text-sm transition-all duration-200',
        isActive
          ? 'text-white font-semibold underline underline-offset-4 decoration-2 decoration-cyan-400'
          : 'text-slate-400 hover:text-slate-300'
      )}
    >
      {children}
    </Link>
  );
}

export function Header({ children, showNavigation = false }: HeaderProps) {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b1220]/90 backdrop-blur-md bg-gradient-to-b from-[#0b1220] to-[#0b1220]/70 border-b border-white/10">
      <div className="py-4 px-4 lg:px-6">
        <div className="flex items-center justify-between max-w-[2000px] mx-auto">
          {/* Brand Block (Left) */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-white leading-tight">
                  Global Problems Map
                </h1>
                <p className="text-xs text-slate-400 leading-tight hidden sm:block">
                  Track & support global crises
                </p>
              </div>
            </Link>

            {/* Navigation Block (Center) */}
            {showNavigation && (
              <nav className="hidden md:flex items-center gap-1 ml-8">
                <NavLink to="/" isActive={location.pathname === '/'}>
                  Map
                </NavLink>
                <NavLink to="/about" isActive={location.pathname === '/about'}>
                  About
                </NavLink>
                <NavLink to="/dashboard" isActive={location.pathname === '/dashboard'}>
                  Dashboard
                </NavLink>
              </nav>
            )}
          </div>

          {/* Logout Button (Right) */}
          <div className="flex items-center gap-3">
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
