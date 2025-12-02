import { Globe } from 'lucide-react';
import { ReactNode } from 'react';

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="glass-strong fixed top-0 left-0 right-0 z-50 h-16 px-4 lg:px-6">
      <div className="h-full flex items-center justify-between max-w-[2000px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold gradient-text">
              Global Problems Map
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Track & support global crises
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {children}
        </div>
      </div>
    </header>
  );
}
