import { useState, FormEvent } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { DollarSign, Heart, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { paymentsAPI } from '@/lib/payments';

interface PaymentFormProps {
  crisisId: number;
  charityId?: number;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

export const PaymentForm = ({ crisisId, charityId, onSuccess }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [amount, setAmount] = useState<number | string>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'amount' | 'payment' | 'processing' | 'success' | 'error'>('amount');
  const [error, setError] = useState('');

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

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Payment submission failed');
        setStep('error');
        setLoading(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setStep('error');
      } else {
        setStep('success');
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Amount Selection
  if (step === 'amount') {
    return (
      <form onSubmit={handleCreatePaymentIntent} className="space-y-6">
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
                ${preset}
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
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
              Donate ${amount}
            </>
          )}
        </motion.button>
      </form>
    );
  }

  // Step 2: Payment Details
  if (step === 'payment' && clientSecret) {
    return (
      <form onSubmit={handlePayment} className="space-y-6">
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
          <p className="text-cyan-400 font-semibold text-lg">
            Donation Amount: ${amount}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Payment Details
          </label>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <PaymentElement />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={!stripe || loading}
          className="w-full py-4 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              Complete Donation
            </>
          )}
        </motion.button>
      </form>
    );
  }

  // Step 3: Processing
  if (step === 'processing') {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Processing Payment...</h3>
        <p className="text-gray-400">Please wait while we process your donation</p>
      </div>
    );
  }

  // Step 4: Success
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
          Your donation of <span className="font-bold text-cyan-400">${amount}</span> was successful
        </p>
        <p className="text-gray-400">
          Your support makes a real difference in helping those affected by crises.
        </p>
      </motion.div>
    );
  }

  // Step 5: Error
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
