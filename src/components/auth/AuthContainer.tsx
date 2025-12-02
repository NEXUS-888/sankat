import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { GlobeAnimation } from '@/components/auth/GlobeAnimation';

interface AuthContainerProps {
  onLoginSuccess: () => void;
  onSignupSuccess: () => void;
}

export const AuthContainer = ({ onLoginSuccess, onSignupSuccess }: AuthContainerProps) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-[#0f1729] relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse-slow top-0 -left-20" />
        <div className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow bottom-0 -right-20" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          >
            {/* Left Side - 3D Globe Hero Animation */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Title Section */}
                <div className="space-y-3">
                  <h1 className="text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight">
                    <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
                      SANKAT
                    </span>
                  </h1>
                  <p className="text-2xl text-gray-300 font-light">
                    Global Crisis Visualization
                  </p>
                  <p className="text-base text-gray-500">
                    Real-time awareness. Data-driven action.
                  </p>
                </div>

                {/* 3D Globe Animation Container */}
                <div className="relative w-full h-[500px] rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm border border-white/10 overflow-hidden">
                  <GlobeAnimation />
                  
                  {/* Subtle glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1729] via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>

            {/* Right Side - Auth Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full"
            >
              <div className="bg-[#1a2332]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Tab Switcher */}
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-all relative ${
                      isLogin ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Login
                    {isLogin && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-all relative ${
                      !isLogin ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Sign Up
                    {!isLogin && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"
                      />
                    )}
                  </button>
                </div>

                {/* Forms */}
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LoginForm
                        onSuccess={onLoginSuccess}
                        onSwitchToSignup={() => setIsLogin(false)}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SignupForm
                        onSuccess={onSignupSuccess}
                        onSwitchToLogin={() => setIsLogin(true)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
