import { useState } from 'react';
import { X, MapPin, Calendar, AlertTriangle, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Crisis, Charity, Category, Severity } from '@/types';
import { cn } from '@/lib/utils';
import { DonationModal } from '@/components/DonationModal';

const categoryColors: Record<Category, string> = {
  Conflict: 'bg-category-conflict/20 text-category-conflict',
  Disaster: 'bg-category-disaster/20 text-category-disaster',
  Health: 'bg-category-health/20 text-category-health',
  Humanitarian: 'bg-category-humanitarian/20 text-category-humanitarian',
  Climate: 'bg-category-climate/20 text-category-climate',
};

const severityConfig: Record<Severity, { color: string; bgColor: string }> = {
  Low: { color: 'text-green-400', bgColor: 'bg-green-500/20' },
  Medium: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  High: { color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  Critical: { color: 'text-red-400', bgColor: 'bg-red-500/20' },
};

interface CrisisDetailsPanelProps {
  crisis: Crisis;
  charities: Charity[];
  onClose: () => void;
}

export function CrisisDetailsPanel({ crisis, charities, onClose }: CrisisDetailsPanelProps) {
  const severityInfo = severityConfig[crisis.severity];
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [showDonation, setShowDonation] = useState(false);

  const handleDonateClick = (charity: Charity) => {
    setSelectedCharity(charity);
    setShowDonation(true);
  };

  return (
    <>
      <DonationModal
        isOpen={showDonation}
        onClose={() => {
          setShowDonation(false);
          setSelectedCharity(null);
        }}
        crisisId={crisis.id}
        crisisTitle={crisis.title}
        charityId={selectedCharity?.id}
        charityName={selectedCharity?.name}
      />
    <div className="glass-strong rounded-2xl h-full flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', categoryColors[crisis.category])}>
                {crisis.category}
              </span>
              <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', severityInfo.bgColor, severityInfo.color)}>
                <AlertTriangle className="w-3 h-3" />
                {crisis.severity}
              </span>
            </div>
            <h2 className="font-display text-xl font-bold mb-1">{crisis.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {crisis.country}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Since {new Date(crisis.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0 hover:bg-secondary/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
            About this crisis
          </h3>
          <p className="text-sm leading-relaxed">{crisis.description}</p>
        </div>

        {/* Charities */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            Ways to help ({charities.length})
          </h3>
          <div className="space-y-3">
            {charities.map((charity) => (
              <div
                key={charity.id}
                className="p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/30 transition-colors"
              >
                <h4 className="font-semibold text-sm mb-1">{charity.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {charity.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-primary-foreground"
                    onClick={() => handleDonateClick(charity)}
                  >
                    <Heart className="w-3.5 h-3.5 mr-2" />
                    Donate via Stripe
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-3"
                    onClick={() => window.open(charity.donation_url, '_blank')}
                    title="Visit charity website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
