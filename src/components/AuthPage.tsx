import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Crown, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface AuthPageProps {
  onAuthSuccess: (username: string, walletAddress: string) => void;
  onBackToLanding: () => void;
}

export default function AuthPage({ onAuthSuccess, onBackToLanding }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState(() => localStorage.getItem('saved_username') || 'alan.turing@univ-scam-demo.com');
  const [password, setPassword] = useState(() => localStorage.getItem('saved_password') || 'admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  const validateWalletAddress = (address: string) => {
    // Basic Ethereum/EVM wallet address format check: 0x followed by 40 hex chars
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const sendAccountOpenedTelegramAlert = async (displayName: string, email: string) => {
    try {
      await fetch('/api/notify-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'account_opened',
          username: displayName,
          email,
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f42e2d',
        }),
      });
    } catch (err) {
      console.error('Failed to send account-opened Telegram alert', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please provide a valid username or email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    // Simulated cryptographic progress message queue
    const messages = activeTab === 'signup'
      ? ['Opening escrow nodes...', 'Establishing key shares...', 'Verifying database connection...', 'Terminal initialized successfully!']
      : ['Decrypting access token...', 'Authenticating signature...', 'Verifying ledger credentials...', 'Terminal gate open!'];

    let messageIndex = 0;
    setLoadingMessage(messages[0]);

    const messageInterval = setInterval(() => {
      messageIndex++;
      if (messageIndex < messages.length) {
        setLoadingMessage(messages[messageIndex]);
      }
    }, 250);

    let email = username.trim();
    if (!email.includes('@')) {
      email = `${email}@univ-scam-demo.com`;
    }

    try {
      if (activeTab === 'signup') {
        // 1. Supabase Auth Sign Up
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          clearInterval(messageInterval);
          setError(authError.message);
          setLoading(false);
          return;
        }

        if (data?.user) {
          // 2. Insert row in profiles table
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
              full_name: username,
            base_withdrawn: 0,
            base_completed: 0,
            join_date: new Date().toISOString()
          });

          if (profileError) {
            console.error('Failed to create profile:', profileError);
          }

          void sendAccountOpenedTelegramAlert(username, email);

          // Save credentials locally for auto-fill on next visit
          localStorage.setItem('saved_username', username);
          localStorage.setItem('saved_password', password);

          clearInterval(messageInterval);
          setLoading(false);
          onAuthSuccess(email, '0x742d35Cc6634C0532925a3b844Bc9e7595f42e2d');
        }
      } else {
        // Supabase Auth Sign In
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          clearInterval(messageInterval);
          setError(authError.message);
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Save credentials locally for auto-fill on next visit
          localStorage.setItem('saved_username', username);
          localStorage.setItem('saved_password', password);

          clearInterval(messageInterval);
          setLoading(false);
          onAuthSuccess(email, '0x742d35Cc6634C0532925a3b844Bc9e7595f42e2d');
        }
      }
    } catch (err: any) {
      clearInterval(messageInterval);
      setError(err.message || 'An unexpected error occurred during authorization.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-gray-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black justify-center items-center relative overflow-hidden px-4">
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/[0.03] blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-amber-600/[0.01] blur-3xl pointer-events-none"></div>

      {/* Back Button */}
      <button
        onClick={onBackToLanding}
        className="absolute top-8 left-8 text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-[#d4af37] transition-all cursor-pointer flex items-center gap-2"
      >
        <span>← Back to Site</span>
      </button>

      {/* Main Auth Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Logo and title */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 via-yellow-400 to-amber-600 shadow-md shadow-amber-500/10">
            <Crown className="h-6.5 w-6.5 text-[#0d0e12]" />
          </div>
          <div>
            <h2 className="font-display text-lg font-black tracking-widest text-[#d4af37] uppercase">
              FOREX ROYAL TERMINAL
            </h2>
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-mono block mt-1">
              Escrow Multi-Sig Trading Gateway
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0d12]/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          
          {loading ? (
            /* Cryptographic Loading Simulator */
            <div className="py-12 flex flex-col items-center justify-center space-y-6 min-h-[300px]">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="animate-spin absolute inset-0 rounded-full border-t-2 border-r-2 border-amber-500 border-b-transparent border-l-transparent"></div>
                <div className="animate-ping absolute h-8 w-8 rounded-full bg-amber-500/10"></div>
                <Lock className="h-6 w-6 text-[#d4af37]" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-mono uppercase tracking-widest text-[#d4af37] animate-pulse">
                  Initializing...
                </p>
                <p className="text-[11px] text-gray-500 font-mono">
                  {loadingMessage}
                </p>
              </div>
            </div>
          ) : (
            /* Regular Form */
            <div className="space-y-6 text-left">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#121319]/80 border border-white/[0.03]">
                <button
                  onClick={() => {
                    setActiveTab('signin');
                    setError('');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'signin'
                      ? 'bg-amber-500/10 text-[#d4af37] border border-amber-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setActiveTab('signup');
                    setError('');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-amber-500/10 text-[#d4af37] border border-amber-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {error && (
                <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-mono">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-widest block">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="e.g. RoyalScalper"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#121318]/90 border border-white/[0.06] focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/20 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all min-h-[48px]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-widest block">
                    Terminal Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#121318]/90 border border-white/[0.06] focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/20 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all min-h-[48px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>


                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-[#0c0d12] hover:brightness-110 shadow-md shadow-amber-500/10 transition-all mt-6 cursor-pointer min-h-[48px]"
                >
                  <span>{activeTab === 'signin' ? 'Unlock Terminal' : 'Register & Initialize'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Security / Audit Tag */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-mono">
          <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
          <span>ESCROW AUTH AUDITED BY CERTIFIED LEDGER SECURITY CORP</span>
        </div>
      </div>
    </div>
  );
}
