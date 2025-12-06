import { MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { Crisis, Category, Severity } from '@/types';
import { cn } from '@/lib/utils';

// Further reduced saturation for better scan speed
const categoryColors: Record<Category, string> = {
  Conflict: 'bg-blue-500/8 text-blue-300/50 border border-blue-500/15',
  Disaster: 'bg-orange-500/8 text-orange-300/50 border border-orange-500/15',
  Health: 'bg-emerald-500/8 text-emerald-300/50 border border-emerald-500/15',
  Humanitarian: 'bg-purple-500/8 text-purple-300/50 border border-purple-500/15',
  Climate: 'bg-cyan-500/8 text-cyan-300/50 border border-cyan-500/15',
};

// Slightly desaturated severity badges for cleaner hierarchy
const severityConfig: Record<Severity, { color: string; icon: boolean }> = {
  Low: { color: 'bg-green-500/12 text-green-300/70', icon: false },
  Medium: { color: 'bg-amber-500/12 text-amber-300/70', icon: false },
  High: { color: 'bg-orange-500/12 text-orange-300/70', icon: true },
  Critical: { color: 'bg-red-500/12 text-red-300/70', icon: true },
};

interface CrisisCardProps {
  crisis: Crisis;
  isSelected: boolean;
  onClick: () => void;
}

export function CrisisCard({ crisis, isSelected, onClick }: CrisisCardProps) {
  const severityInfo = severityConfig[crisis.severity];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-xl transition-all duration-200 group relative',
        'border',
        isSelected
          ? 'border-blue-400/40 bg-white/5 shadow-[0_0_16px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/20'
          : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className={cn(
          'font-semibold text-sm leading-tight transition-colors line-clamp-2',
          isSelected ? 'text-white' : 'text-slate-100 group-hover:text-white'
        )}>
          {crisis.title}
        </h3>
        <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0', severityInfo.color)}>
          {severityInfo.icon && <AlertTriangle className="w-2.5 h-2.5" />}
          {crisis.severity}
        </div>
      </div>

      <p className="text-xs text-slate-400 line-clamp-1 mb-2">
        {crisis.summary}
      </p>

      <div className="flex items-center gap-2 flex-wrap text-[10px]">
        <span className={cn('px-2 py-0.5 rounded-full', categoryColors[crisis.category])}>
          {crisis.category}
        </span>
        <span className="flex items-center gap-1 text-slate-500/80">
          <MapPin className="w-3 h-3" />
          {crisis.country}
        </span>
        <span className="flex items-center gap-1 text-slate-500/80">
          <Calendar className="w-3 h-3" />
          {new Date(crisis.start_date).getFullYear()}
        </span>
      </div>
    </button>
  );
}
