import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, User, Mail } from 'lucide-react';
import { authAPI } from '@/lib/auth';
import './CinematicLoginForm.css';

export function CinematicSignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authAPI.register(email, password);
      console.log('Registration successful:', response);
      
      // Force a full page reload to trigger auth check
      window.location.reload();
    } catch (err: any) {
      console.error('Registration failed:', err);
      const errorMessage = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      className="cinematic-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-message"
          style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '14px',
          }}
        >
          {error}
        </motion.div>
      )}

      {/* Name Field */}
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Full Name
        </label>
        <div className="input-wrapper">
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="cinematic-input"
            placeholder="Mission Operator Name"
            required
          />
          <div className="input-glow" />
        </div>
      </div>

      {/* Email Field */}
      <div className="form-group">
        <label htmlFor="signup-email" className="form-label">
          Email Address
        </label>
        <div className="input-wrapper">
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="cinematic-input"
            placeholder="operator@sankat.global"
            required
          />
          <div className="input-glow" />
        </div>
      </div>

      {/* Password Field */}
      <div className="form-group">
        <label htmlFor="signup-password" className="form-label">
          Access Code
        </label>
        <div className="input-wrapper">
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="cinematic-input"
            placeholder="••••••••••••"
            required
            minLength={8}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <div className="input-glow" />
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="form-group">
        <label htmlFor="confirm-password" className="form-label">
          Confirm Access Code
        </label>
        <div className="input-wrapper">
          <input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="cinematic-input"
            placeholder="••••••••••••"
            required
            minLength={8}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <div className="input-glow" />
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="form-options">
        <label className="checkbox-label">
          <input type="checkbox" className="cinematic-checkbox" required />
          <span className="checkbox-text">
            I agree to the <a href="#" className="link-text">Terms of Service</a>
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        className="cinematic-button"
        disabled={isLoading}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98, y: 0 }}
      >
        <span className="button-text">
          {isLoading ? 'Creating Account...' : 'Request Access'}
        </span>
        <motion.div
          className="button-icon"
          animate={isLoading ? { x: [0, 10, 0] } : {}}
          transition={{ repeat: isLoading ? Infinity : 0, duration: 1 }}
        >
          <ArrowRight size={20} />
        </motion.div>
        <div className="button-shine" />
      </motion.button>
    </motion.form>
  );
}
