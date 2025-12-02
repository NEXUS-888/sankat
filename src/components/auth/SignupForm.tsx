import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Check, AlertCircle } from 'lucide-react';
import { authAPI } from '@/lib/auth';

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const SignupForm = ({ onSuccess, onSwitchToLogin }: SignupFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length >= 8 ? 'strong' : password.length >= 6 ? 'medium' : 'weak';
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await authAPI.register(email, password);
      localStorage.setItem('auth_token', data.access_token);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-300">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your email"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Create a password (min 6 characters)"
              required
              disabled={loading}
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {/* Password Strength Indicator */}
          {password && (
            <div className="flex gap-1 mt-2">
              <div className={`h-1 flex-1 rounded transition-colors ${password.length >= 1 ? (passwordStrength === 'weak' ? 'bg-red-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-600'}`} />
              <div className={`h-1 flex-1 rounded transition-colors ${password.length >= 6 ? (passwordStrength === 'strong' ? 'bg-green-500' : 'bg-yellow-500') : 'bg-gray-600'}`} />
              <div className={`h-1 flex-1 rounded transition-colors ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-600'}`} />
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="signup-confirm" className="block text-sm font-medium text-gray-300">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              id="signup-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Confirm your password"
              required
              disabled={loading}
              minLength={6}
              autoComplete="new-password"
            />
            {passwordsMatch && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        whileHover={!loading ? { scale: 1.02 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>

      {/* Switch to Login */}
      <div className="text-center text-sm">
        <span className="text-gray-400">Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={loading}
          className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors disabled:opacity-50"
        >
          Sign in
        </button>
      </div>
    </form>
  );
};
