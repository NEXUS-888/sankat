import { MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { Crisis, Category, Severity } from '@/types';
import { cn } from '@/lib/utils';

const categoryColors: Record<Category, string> = {
  Conflict: 'bg-category-conflict/20 text-category-conflict',
  Disaster: 'bg-category-disaster/20 text-category-disaster',
  Health: 'bg-category-health/20 text-category-health',
  Humanitarian: 'bg-category-humanitarian/20 text-category-humanitarian',
  Climate: 'bg-category-climate/20 text-category-climate',
};

const severityConfig: Record<Severity, { color: string; icon: boolean }> = {
  Low: { color: 'bg-green-500/20 text-green-400', icon: false },
  Medium: { color: 'bg-yellow-500/20 text-yellow-400', icon: false },
  High: { color: 'bg-orange-500/20 text-orange-400', icon: true },
  Critical: { color: 'bg-red-500/20 text-red-400', icon: true },
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
        'w-full text-left p-4 rounded-xl transition-all duration-200 group',
        'glass border hover:border-primary/30',
        isSelected
          ? 'border-primary/50 bg-primary/10 shadow-lg shadow-primary/10'
          : 'border-border/30 hover:bg-secondary/30'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {crisis.title}
        </h3>
        <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0', severityInfo.color)}>
          {severityInfo.icon && <AlertTriangle className="w-2.5 h-2.5" />}
          {crisis.severity}
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {crisis.summary}
      </p>

      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className={cn('px-2 py-0.5 rounded-full', categoryColors[crisis.category])}>
          {crisis.category}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {crisis.country}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(crisis.start_date).getFullYear()}
        </span>
      </div>
    </button>
  );
}
