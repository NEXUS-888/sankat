import { useState } from 'react';
import { X, MapPin, ExternalLink, Heart, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crisis, Charity, Category, Severity } from '@/types';
import { cn } from '@/lib/utils';
import { DonationModal } from '@/components/DonationModal';

// Subtle category colors for low emphasis
const categoryColors: Record<Category, string> = {
  Conflict: 'bg-blue-500/10 text-blue-300/70 border-blue-500/20',
  Disaster: 'bg-orange-500/10 text-orange-300/70 border-orange-500/20',
  Health: 'bg-emerald-500/10 text-emerald-300/70 border-emerald-500/20',
  Humanitarian: 'bg-purple-500/10 text-purple-300/70 border-purple-500/20',
  Climate: 'bg-cyan-500/10 text-cyan-300/70 border-cyan-500/20',
};

// High emphasis severity colors with glow
const severityConfig: Record<Severity, { color: string; bgColor: string; borderColor: string; glowColor: string }> = {
  Low: { 
    color: 'text-green-300', 
    bgColor: 'bg-green-500/20', 
    borderColor: 'border-green-500/30',
    glowColor: 'shadow-[0_0_8px_rgba(34,197,94,0.3)]'
  },
  Medium: { 
    color: 'text-amber-300', 
    bgColor: 'bg-amber-500/20', 
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-[0_0_8px_rgba(251,191,36,0.3)]'
  },
  High: { 
    color: 'text-orange-300', 
    bgColor: 'bg-orange-500/20', 
    borderColor: 'border-orange-500/30',
    glowColor: 'shadow-[0_0_8px_rgba(251,146,60,0.3)]'
  },
  Critical: { 
    color: 'text-red-300', 
    bgColor: 'bg-red-500/20', 
    borderColor: 'border-red-500/30',
    glowColor: 'shadow-[0_0_8px_rgba(239,68,68,0.3)]'
  },
};

interface CrisisDetailsPanelProps {
  crisis: Crisis | null;
  charities: Charity[];
  onClose: () => void;
  isLoading?: boolean;
}

// Helper Components
const CategoryBadge = ({ category }: { category: Category }) => (
  <span className={cn(
    'px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm',
    categoryColors[category]
  )}>
    {category}
  </span>
);

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const config = severityConfig[severity];
  return (
    <motion.span 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className={cn(
        'px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm',
        config.bgColor,
        config.color,
        config.borderColor,
        config.glowColor
      )}
    >
      {severity}
    </motion.span>
  );
};

const PanelSectionDivider = () => (
  <div className="border-t border-white/5 my-4" />
);

const DonateButton = ({ 
  onClick, 
  children, 
  className = '' 
}: { 
  onClick: () => void; 
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.15 }}
    className={cn(
      'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
      'bg-gradient-to-r from-cyan-500 to-blue-600',
      'hover:from-cyan-400 hover:to-blue-500',
      'shadow-[0_0_20px_rgba(6,182,212,0.25)]',
      'hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]',
      'text-white font-semibold transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-[#0b1220]',
      className
    )}
  >
    {children}
  </motion.button>
);

const CharityCard = ({ 
  charity, 
  onDonateClick,
  index = 0
}: { 
  charity: Charity; 
  onDonateClick: (charity: Charity) => void;
  index?: number;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay: index * 0.05 }}
    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-black/20 transition-all duration-200 space-y-3 group"
  >
    <div className="flex items-start justify-between gap-2">
      <h4 className="font-semibold text-sm text-slate-100 group-hover:text-white transition-colors">
        {charity.name}
      </h4>
      {/* Optional verified badge - add verified field to Charity type if needed */}
    </div>
    
    {/* Description */}
    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
      {charity.description}
    </p>
    
    {/* Subtle divider */}
    <div className="border-t border-white/5 pt-2" />
    
    {/* Actions */}
    <div className="flex gap-2">
      <button
        onClick={() => onDonateClick(charity)}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
          'bg-gradient-to-r from-cyan-500 to-blue-600',
          'hover:from-cyan-400 hover:to-blue-500',
          'shadow-[0_0_12px_rgba(6,182,212,0.2)]',
          'hover:shadow-[0_0_16px_rgba(6,182,212,0.3)]',
          'text-white text-sm font-semibold transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-[#0b1220]'
        )}
      >
        <Heart className="w-3.5 h-3.5" />
        <span>Donate via Stripe</span>
        <ExternalLink className="w-3 h-3 opacity-70" />
      </button>
      {charity.donation_url && (
        <button
          onClick={() => window.open(charity.donation_url, '_blank')}
          className="px-3 py-2.5 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/10 text-slate-300 hover:text-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#0b1220]"
          title="Learn more"
          aria-label="Learn more about this charity"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      )}
    </div>
  </motion.div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-6">
    <div className="relative mb-6">
      <MapPin className="w-16 h-16 text-slate-600" />
      <div className="absolute inset-0 blur-xl bg-slate-600/20" />
    </div>
    <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
      Select a crisis on the map or from the list to see details and ways to help.
    </p>
  </div>
);

const SkeletonLoader = () => (
  <div className="h-full flex flex-col animate-pulse">
    <div className="p-6 space-y-4 border-b border-white/5">
      <div className="flex gap-2">
        <div className="h-7 w-20 bg-white/10 rounded-full" />
        <div className="h-7 w-24 bg-white/10 rounded-full" />
      </div>
      <div className="h-8 w-3/4 bg-white/10 rounded" />
      <div className="h-4 w-1/2 bg-white/10 rounded" />
      <div className="h-10 w-full bg-white/10 rounded-lg" />
    </div>
    <div className="flex-1 p-6 space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-24 bg-white/10 rounded" />
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-5/6 bg-white/10 rounded" />
        <div className="h-4 w-4/6 bg-white/10 rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-24 bg-white/10 rounded" />
        <div className="h-24 w-full bg-white/10 rounded-lg" />
        <div className="h-24 w-full bg-white/10 rounded-lg" />
      </div>
    </div>
  </div>
);

export function CrisisDetailsPanel({ crisis, charities, onClose, isLoading }: CrisisDetailsPanelProps) {
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [showDonation, setShowDonation] = useState(false);

  const handleDonateClick = (charity: Charity) => {
    setSelectedCharity(charity);
    setShowDonation(true);
  };

  const handleDonateToCrisis = () => {
    if (crisis) {
      setSelectedCharity(null);
      setShowDonation(true);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <aside 
        className="h-full bg-gradient-to-b from-[#0b1220] to-[#0b1220]/80 backdrop-blur-sm border-l border-white/10 rounded-lg overflow-hidden shadow-2xl"
        aria-label="Crisis details"
      >
        <SkeletonLoader />
      </aside>
    );
  }

  // Empty state
  if (!crisis) {
    return (
      <aside 
        className="h-full bg-gradient-to-b from-[#0b1220] to-[#0b1220]/80 backdrop-blur-sm border-l border-white/10 rounded-lg overflow-hidden shadow-2xl"
        aria-label="Crisis details"
      >
        <EmptyState />
      </aside>
    );
  }

  const formattedDate = new Date(crisis.start_date).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });

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
      
      <motion.aside 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="h-full bg-gradient-to-b from-[#0b1220] to-[#0b1220]/80 backdrop-blur-sm border-l border-white/10 rounded-lg overflow-hidden flex flex-col shadow-2xl"
        aria-label="Crisis details"
      >
        {/* Sticky Header */}
        <div className="p-6 space-y-4 border-b border-white/5 bg-[#0b1220]/50 backdrop-blur-md">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Close details"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
          </button>

          {/* Badges with proper spacing */}
          <div className="flex items-center flex-wrap pr-12">
            <CategoryBadge category={crisis.category} />
            <div className="ml-2">
              <SeverityBadge severity={crisis.severity} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white leading-tight pr-8">
            {crisis.title}
          </h2>

          {/* Meta */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5" />
            <span className="font-medium">{crisis.country}</span>
            <span className="mx-1 opacity-50">•</span>
            <span>Since {formattedDate}</span>
          </div>

          {/* Primary CTA with enhanced glow */}
          <DonateButton onClick={handleDonateToCrisis}>
            <Heart className="w-4 h-4" />
            <span>Donate to this crisis</span>
          </DonateButton>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* About Section */}
          <div className="p-6 space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              About this crisis
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {crisis.description}
            </p>
            
            {/* Optional stats could go here */}
            {/* Example: 
            <div className="flex gap-2 pt-2">
              <span className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-full">
                People affected: 50K+
              </span>
            </div>
            */}
          </div>

          {/* Subtle Divider */}
          <PanelSectionDivider />

          {/* Ways to Help Section */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Ways to help
            </h3>
            
            {charities.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-500">
                  Verified ways to help will appear here soon.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {charities.map((charity, index) => (
                  <CharityCard
                    key={charity.id}
                    charity={charity}
                    onDonateClick={handleDonateClick}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
