import { useState, FormEvent, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { DollarSign, Heart, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { paymentsAPI } from '@/lib/payments';

interface PaymentFormProps {
  crisisId: number;
  charityId?: number;
  stripePromise: Promise<Stripe | null>;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

// Currency data with symbols
const CURRENCIES: { [key: string]: { symbol: string; code: string } } = {
  US: { symbol: '$', code: 'USD' },
  GB: { symbol: '£', code: 'GBP' },
  EU: { symbol: '€', code: 'EUR' },
  IN: { symbol: '₹', code: 'INR' },
  JP: { symbol: '¥', code: 'JPY' },
  AU: { symbol: 'A$', code: 'AUD' },
  CA: { symbol: 'C$', code: 'CAD' },
  DEFAULT: { symbol: '$', code: 'USD' },
};

const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#6b7280',
      },
      ':-webkit-autofill': {
        color: '#ffffff',
      },
      backgroundColor: 'transparent',
      iconColor: '#06b6d4',
      lineHeight: '24px',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
    complete: {
      color: '#10b981',
      iconColor: '#10b981',
    },
  },
};

// Payment step component
interface PaymentStepProps {
  amount: number | string;
  currency: { symbol: string; code: string };
  clientSecret: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

const PaymentStep = ({ amount, currency, clientSecret, onSuccess, onError }: PaymentStepProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found');
      return;
    }

    setLoading(true);
    setCardError('');

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        onError(result.error.message || 'Payment failed');
        setCardError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        onError('Payment was not successful');
      }
    } catch (err: any) {
      onError(err.message || 'An unexpected error occurred');
      setCardError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Display */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Donation Amount</p>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              {currency.symbol}{amount}
            </p>
          </div>
          <Heart className="w-12 h-12 text-cyan-400 opacity-50" />
        </div>
      </div>

      {/* Card Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Card Information
        </label>
        <div className="relative">
          <div className={`
            bg-gradient-to-br from-white/5 to-white/[0.02] 
            border-2 rounded-xl p-5 transition-all duration-200
            ${cardError ? 'border-red-500/50 bg-red-500/5' : cardComplete ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-cyan-500/30 focus-within:border-cyan-500/50'}
          `}>
            <CardElement 
              options={CARD_ELEMENT_OPTIONS}
              onChange={(e) => {
                setCardComplete(e.complete);
                if (e.error) {
                  setCardError(e.error.message);
                } else {
                  setCardError('');
                }
              }}
            />
          </div>
          {cardError && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-2 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {cardError}
            </motion.p>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Your payment information is encrypted and secure
        </p>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={!stripe || !elements || loading || !cardComplete}
        className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg shadow-cyan-500/20 disabled:shadow-none"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Complete Secure Donation</span>
          </>
        )}
      </motion.button>

      {/* Test Card Info */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-300 font-medium mb-1">Test Mode</p>
        <p className="text-xs text-gray-400">
          Use card: <span className="font-mono text-white">4242 4242 4242 4242</span>, any future date, any CVC
        </p>
      </div>
    </form>
  );
};

// Main component
const PaymentFormInner = ({ crisisId, charityId, stripePromise, onSuccess }: PaymentFormProps) => {
  const [amount, setAmount] = useState<number | string>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'amount' | 'payment' | 'success' | 'error'>('amount');
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState(CURRENCIES.DEFAULT);

  // Detect user's currency based on location
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        
        // Map country codes to currency
        if (countryCode === 'GB') {
          setCurrency(CURRENCIES.GB);
        } else if (['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'GR'].includes(countryCode)) {
          setCurrency(CURRENCIES.EU);
        } else if (countryCode === 'IN') {
          setCurrency(CURRENCIES.IN);
        } else if (countryCode === 'JP') {
          setCurrency(CURRENCIES.JP);
        } else if (countryCode === 'AU') {
          setCurrency(CURRENCIES.AU);
        } else if (countryCode === 'CA') {
          setCurrency(CURRENCIES.CA);
        } else {
          setCurrency(CURRENCIES.US);
        }
      } catch (error) {
        console.error('Failed to detect currency:', error);
        setCurrency(CURRENCIES.DEFAULT);
      }
    };

    detectCurrency();
  }, []);

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    }
  };

  const handleCreatePaymentIntent = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const amountInCents = Math.round(Number(amount) * 100);

      if (amountInCents < 100) {
        setError('Minimum donation amount is $1.00');
        setLoading(false);
        return;
      }

      const response = await paymentsAPI.createPaymentIntent({
        amount: amountInCents,
        crisis_id: crisisId,
        charity_id: charityId,
        donor_email: donorEmail || undefined,
        donor_name: donorName || undefined,
      });

      setClientSecret(response.client_secret);
      setStep('payment');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to initialize payment');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Amount Selection
  if (step === 'amount') {
    return (
      <form onSubmit={handleCreatePaymentIntent} className="space-y-6">
        {/* Currency indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
          </svg>
          <span>Currency: {currency.code} ({currency.symbol})</span>
        </div>

        {/* Preset amounts */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Donation Amount
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAmountSelect(preset)}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  amount === preset
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {currency.symbol}{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <label htmlFor="customAmount" className="block text-sm font-medium text-gray-300 mb-2">
            Or Enter Custom Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400 font-semibold">
              {currency.symbol}
            </span>
            <input
              id="customAmount"
              type="number"
              min="1"
              step="0.01"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
        </div>

        {/* Donor info */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div>
            <label htmlFor="donorName" className="block text-sm font-medium text-gray-300 mb-2">
              Your Name (Optional)
            </label>
            <input
              id="donorName"
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          <div>
            <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-300 mb-2">
              Email (Optional, for receipt)
            </label>
            <input
              id="donorEmail"
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={loading || !amount || Number(amount) < 1}
          className="w-full py-4 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Heart className="w-6 h-6" />
              Donate {currency.symbol}{amount}
            </>
          )}
        </motion.button>
      </form>
    );
  }

  // Step 2: Payment
  if (step === 'payment' && clientSecret) {
    return (
      <Elements stripe={stripePromise}>
        <PaymentStep
          amount={amount}
          currency={currency}
          clientSecret={clientSecret}
          onSuccess={() => {
            setStep('success');
            onSuccess?.();
          }}
          onError={(message) => {
            setError(message);
            setStep('error');
          }}
        />
      </Elements>
    );
  }

  // Step 3: Success
  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
        <h3 className="text-3xl font-bold text-white mb-3">Thank You! 🎉</h3>
        <p className="text-xl text-gray-300 mb-2">
          Your donation of <span className="font-bold text-cyan-400">{currency.symbol}{amount}</span> was successful
        </p>
        <p className="text-gray-400">
          Your support makes a real difference in helping those affected by crises.
        </p>
      </motion.div>
    );
  }

  // Step 4: Error
  if (step === 'error') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Payment Failed</h3>
        <p className="text-red-400 mb-6">{error}</p>
        <button
          onClick={() => setStep('amount')}
          className="py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return null;
};

export const PaymentForm = (props: PaymentFormProps) => {
  return <PaymentFormInner {...props} />;
};
