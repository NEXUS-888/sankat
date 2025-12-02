import { Crisis } from '@/types';
import { CrisisCard } from './CrisisCard';
import { AlertCircle } from 'lucide-react';

interface CrisisListProps {
  crises: Crisis[];
  selectedCrisis: Crisis | null;
  onSelectCrisis: (crisis: Crisis) => void;
  isLoading: boolean;
}

export function CrisisList({ crises, selectedCrisis, onSelectCrisis, isLoading }: CrisisListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl glass animate-pulse bg-secondary/30"
          />
        ))}
      </div>
    );
  }

  if (crises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-medium text-muted-foreground mb-1">No crises found</h3>
        <p className="text-sm text-muted-foreground/70">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground mb-2">
        {crises.length} {crises.length === 1 ? 'crisis' : 'crises'} found
      </div>
      {crises.map((crisis) => (
        <CrisisCard
          key={crisis.id}
          crisis={crisis}
          isSelected={selectedCrisis?.id === crisis.id}
          onClick={() => onSelectCrisis(crisis)}
        />
      ))}
    </div>
  );
}
