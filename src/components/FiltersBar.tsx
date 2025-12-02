import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Category, Severity } from '@/types';
import { cn } from '@/lib/utils';

const categories: Category[] = ['Conflict', 'Disaster', 'Health', 'Humanitarian', 'Climate'];
const severities: Severity[] = ['Low', 'Medium', 'High', 'Critical'];

const categoryColors: Record<Category, string> = {
  Conflict: 'bg-category-conflict/20 text-category-conflict border-category-conflict/30 hover:bg-category-conflict/30',
  Disaster: 'bg-category-disaster/20 text-category-disaster border-category-disaster/30 hover:bg-category-disaster/30',
  Health: 'bg-category-health/20 text-category-health border-category-health/30 hover:bg-category-health/30',
  Humanitarian: 'bg-category-humanitarian/20 text-category-humanitarian border-category-humanitarian/30 hover:bg-category-humanitarian/30',
  Climate: 'bg-category-climate/20 text-category-climate border-category-climate/30 hover:bg-category-climate/30',
};

interface FiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
  selectedSeverity: Severity | null;
  onSeverityChange: (severity: Severity | null) => void;
  onClear: () => void;
}

export function FiltersBar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSeverity,
  onSeverityChange,
  onClear,
}: FiltersBarProps) {
  const hasFilters = search || selectedCategory || selectedSeverity;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search crises..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 glass border-border/50 focus:border-primary/50 bg-secondary/30"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Category
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(selectedCategory === category ? null : category)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200',
                selectedCategory === category
                  ? categoryColors[category]
                  : 'bg-secondary/30 text-muted-foreground border-border/30 hover:bg-secondary/50'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Severity chips */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Severity
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {severities.map((severity) => (
            <button
              key={severity}
              onClick={() => onSeverityChange(selectedSeverity === severity ? null : severity)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200',
                selectedSeverity === severity
                  ? `bg-severity-${severity.toLowerCase()}/20 text-severity-${severity.toLowerCase()} border-severity-${severity.toLowerCase()}/30`
                  : 'bg-secondary/30 text-muted-foreground border-border/30 hover:bg-secondary/50',
                selectedSeverity === severity && severity === 'Low' && 'bg-green-500/20 text-green-400 border-green-500/30',
                selectedSeverity === severity && severity === 'Medium' && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                selectedSeverity === severity && severity === 'High' && 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                selectedSeverity === severity && severity === 'Critical' && 'bg-red-500/20 text-red-400 border-red-500/30'
              )}
            >
              {severity}
            </button>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="w-3 h-3 mr-1" />
          Clear all filters
        </Button>
      )}
    </div>
  );
}
