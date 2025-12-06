import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { PaymentForm } from './PaymentFormSimple';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface DonationModalProps {
  crisisId: number;
  crisisTitle: string;
  charityId?: number;
  charityName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal = ({
  crisisId,
  crisisTitle,
  charityId,
  charityName,
  isOpen,
  onClose,
}: DonationModalProps) => {
  const [stripeConfigured] = useState(isStripeConfigured());
  const [stripePromise] = useState(() => getStripe());

  // Reset scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-8 pb-6 border-b border-white/10">
          <h2 className="text-3xl font-bold text-white mb-2">Support This Cause</h2>
          <p className="text-gray-400">
            Donate to <span className="font-semibold text-cyan-400">{crisisTitle}</span>
            {charityName && (
              <>
                {' '}via <span className="font-semibold text-blue-400">{charityName}</span>
              </>
            )}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {stripeConfigured ? (
            <PaymentForm
              crisisId={crisisId}
              charityId={charityId}
              stripePromise={stripePromise}
              onSuccess={() => {
                setTimeout(onClose, 2000); // Close after 2 seconds on success
              }}
            />
          ) : (
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                Payment system is not configured. Please contact the administrator to set up Stripe.
                <br />
                <br />
                <strong>Setup Instructions:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Get Stripe API keys from https://dashboard.stripe.com</li>
                  <li>Add VITE_STRIPE_PUBLISHABLE_KEY to .env file</li>
                  <li>Add STRIPE_SECRET_KEY to backend/.env file</li>
                  <li>Restart both frontend and backend servers</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};
