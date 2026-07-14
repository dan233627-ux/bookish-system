import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  LayoutDashboard, 
  Coins, 
  MessageSquare, 
  ShieldCheck, 
  Wallet, 
  ArrowUpRight, 
  HelpCircle,
  TrendingUp,
  Sparkles,
  DollarSign,
  Lock,
  Activity,
  Award
} from 'lucide-react';

import { InvestmentPlan, ActiveInvestment } from './types';
import { INVESTMENT_PLANS } from './data';

import DashboardStats from './components/DashboardStats';
import PlanCard from './components/PlanCard';
import RoiCalculator from './components/RoiCalculator';
import RoyalChart from './components/RoyalChart';
import DepositModal from './components/DepositModal';
import ActiveInvestmentComponent from './components/ActiveInvestment';
import LiveFeed from './components/LiveFeed';
import TelegramSection from './components/TelegramSection';
import DailyOfferModal, { DAILY_OFFER_PLAN } from './components/DailyOfferModal';
import Profiles from './components/Profiles';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; walletAddress: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'plans' | 'profiles' | 'community' | 'support'>('dashboard');
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>([]);
  const [totalClaimedEarnings, setTotalClaimedEarnings] = useState<number>(0);
  const [showDailyOffer, setShowDailyOffer] = useState<boolean>(false);

  // Load persistent session, investments & earnings from localStorage
  useEffect(() => {
    const session = localStorage.getItem('royal_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setCurrentUser(parsed);
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
      } catch (e) {
        console.error('Failed to parse saved session', e);
      }
    }

    const savedInvestments = localStorage.getItem('royal_investments');
    const savedEarnings = localStorage.getItem('royal_claimed_earnings');
    
    if (savedInvestments) {
      try {
        setActiveInvestments(JSON.parse(savedInvestments));
      } catch (e) {
        console.error('Failed to parse saved investments', e);
      }
    }
    
    if (savedEarnings) {
      setTotalClaimedEarnings(Number(savedEarnings));
    }
  }, []);

  const handleAuthSuccess = (username: string, walletAddress: string) => {
    const session = { username, walletAddress };
    localStorage.setItem('royal_session', JSON.stringify(session));
    setCurrentUser(session);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('royal_session');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  const handleAccessTerminal = () => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('auth');
    }
  };

  // Save changes to localStorage
  const saveInvestments = (updated: ActiveInvestment[]) => {
    setActiveInvestments(updated);
    localStorage.setItem('royal_investments', JSON.stringify(updated));
  };

  // Handle confirmed simulated deposit
  const handleConfirmDeposit = (
    username: string, 
    plan: InvestmentPlan, 
    screenshotBase64?: string | null, 
    paymentMethod?: string
  ) => {
    const now = new Date();
    // Calculate simulated end time
    const end = new Date(now.getTime() + plan.durationHours * 60 * 60 * 1000);

    const newInvestment: ActiveInvestment = {
      id: `inv-${Date.now()}`,
      planId: plan.id,
      planLabel: plan.categoryLabel,
      category: plan.category,
      capital: plan.capital,
      roi: plan.roi,
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      durationHours: plan.durationHours,
      progress: 0,
      currentEarning: plan.capital,
      status: 'active'
    };

    const updated = [newInvestment, ...activeInvestments];
    saveInvestments(updated);
    setActiveTab('dashboard');

    // Dispatch direct notification & screenshot to user's configured Telegram Bot
    fetch('/api/notify-deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        planName: plan.categoryLabel,
        amount: plan.capital,
        paymentMethod,
        screenshotBase64
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('[Telegram Alert System]', data.message);
      })
      .catch((err) => {
        console.error('[Telegram Alert Error]', err);
      });
  };

  // Handle simulated withdrawal payout claim
  const handleClaimPayout = (id: string) => {
    const matched = activeInvestments.find(inv => inv.id === id);
    if (!matched) return;

    // Add to claimed earnings
    const updatedEarnings = totalClaimedEarnings + matched.roi;
    setTotalClaimedEarnings(updatedEarnings);
    localStorage.setItem('royal_claimed_earnings', updatedEarnings.toString());

    // Update investment status to claimed
    const updated = activeInvestments.map(inv => {
      if (inv.id === id) {
        return { ...inv, status: 'claimed' as const, progress: 100, currentEarning: matched.roi };
      }
      return inv;
    });
    saveInvestments(updated);
  };

  // Group plans by category for easy display
  const plans24h = INVESTMENT_PLANS.filter(p => p.category === '24h');
  const plans2day = INVESTMENT_PLANS.filter(p => p.category === '2day');
  const plansWeekly = INVESTMENT_PLANS.filter(p => p.category === 'weekly');

  if (currentPage === 'landing') {
    return (
      <LandingPage 
        onAccessTerminal={handleAccessTerminal} 
        onNavigateToAuth={() => setCurrentPage('auth')} 
      />
    );
  }

  if (currentPage === 'auth') {
    return (
      <AuthPage 
        onAuthSuccess={handleAuthSuccess} 
        onBackToLanding={() => setCurrentPage('landing')} 
      />
    );
  }

  return (
    <div id="forex-royal-app-root" className="min-h-screen bg-[#08080a] text-gray-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      
      {/* Premium Header / Navigation Bar */}
      <header id="royal-app-header" className="sticky top-0 z-40 bg-[#0d0e12]/90 border-b border-amber-500/15 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            
            {/* Logo Brand Brand */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 via-yellow-400 to-amber-600 shadow-md shadow-amber-500/10">
                <Crown className="h-6 w-6 text-[#0d0e12]" />
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 opacity-20 blur-sm"></div>
              </div>
              <div className="text-left">
                <h1 className="font-display text-lg font-black tracking-widest text-[#d4af37] leading-none">
                  FOREX ROYAL
                </h1>
                <span className="text-[9px] uppercase tracking-widest text-gray-400 font-mono block mt-1">
                  PRESTIGE INVESTMENT POOL
                </span>
              </div>
            </div>

            {/* Desktop Horizontal Tabs */}
            <nav className="hidden md:flex items-center gap-1.5" id="desktop-navbar">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'plans', label: 'Investment Plans', icon: Coins },
                { id: 'profiles', label: 'My Profile', icon: Award },
                { id: 'community', label: 'Royal Forum', icon: MessageSquare },
                { id: 'support', label: 'Secure Broker', icon: ShieldCheck }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    id={`nav-btn-${tab.id}`}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'bg-amber-500/10 text-[#d4af37] border-b-2 border-amber-400/80 shadow-inner' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right side Portfolio Summary Pill */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[9px] text-gray-500 font-mono font-bold uppercase">SECURED DIVIDENDS CLAIMED</span>
                <span className="font-mono text-sm font-black text-emerald-400">
                  £{totalClaimedEarnings.toLocaleString()}
                </span>
              </div>
              <div className="h-10 w-10 sm:h-auto sm:px-4 sm:py-2.5 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="royal-main-viewport">
        
        {/* Dynamic Tab Switching Content with animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
              id="dashboard-view-stage"
            >
              {/* Premium status indicators & standard metrics */}
              <DashboardStats />

              {/* Premium Brand Intro Pitch (Catchy & Explains Forex Royal elegantly) */}
              <motion.div
                id="forex-royal-intro-hero"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-amber-500/15 bg-gradient-to-b from-[#101116] to-[#0c0d12] p-6 sm:p-8"
              >
                <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-amber-500/[0.02] blur-3xl pointer-events-none"></div>
                <div className="absolute top-0 left-12 h-24 w-48 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 blur-2xl pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-3 max-w-3xl text-left">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1">
                      <Crown className="h-3.5 w-3.5 text-[#d4af37]" />
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#d4af37] uppercase">
                        The Sovereign Standard of FX Arbitrage
                      </span>
                    </div>
                    
                    <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight uppercase">
                      MULTIPLY LIQUIDITY SECURELY WITH <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">ELITE ALGORITHMIC POOLS</span>
                    </h2>
                    
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Forex Royal bridges private liquidity with institutional-grade high-frequency arbitrage algorithms. By monitoring thousands of multi-broker micro-spreads in real-time, our pools secure steady compounding dividends with <strong className="text-white">100% Capital Shield Insurance</strong> protection. No trading experience required.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 justify-end">
                    <div className="rounded-xl border border-amber-500/10 bg-[#121318]/60 p-4 space-y-1.5 text-left w-full sm:w-48">
                      <span className="text-[9px] font-mono text-[#d4af37] font-bold uppercase tracking-wider block">Real-Time Compounding</span>
                      <p className="text-xs text-gray-300 font-bold">Watch profits count up every second</p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/15 bg-[#121318]/60 p-4 space-y-1.5 text-left w-full sm:w-48">
                      <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">Guaranteed Exit</span>
                      <p className="text-xs text-gray-300 font-bold">Fast-release withdraw back to your wallet</p>
                    </div>
                  </div>
                </div>

                {/* 3 columns of prestigious key pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-amber-500/5 text-left">
                  <div className="space-y-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">HFT Spreads Arbitrage</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Our system automatically executes hundreds of risk-free gold and currency arbitrage transactions per minute.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sovereign Protection</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Every pool allocation is shielded under an active capital protection reserve, ensuring absolute peace of mind.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Coins className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Effortless Simulation</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Simply secure an active contract slot, upload verification, and watch the dynamic real-time compounding live feed.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Exclusive Daily Offer Spotlight Banner */}
              <motion.div
                id="daily-offer-spotlight"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#171821] via-[#121318] to-[#171821] p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(212,175,55,0.08)]"
              >
                <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl"></div>
                
                <div className="flex items-center gap-4 text-left w-full md:w-auto">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#d4af37]">
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-[#d4af37] uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        24h FLASH DEAL
                      </span>
                      <span className="text-[9px] font-mono font-bold text-red-400 uppercase animate-pulse">
                        ⚠️ ONLY 3 SLOTS AVAILABLE
                      </span>
                    </div>
                    <h3 className="font-display text-sm font-black text-white mt-1 uppercase tracking-wide">
                      ROYAL SPECIAL POOL: INVEST £300 → RETURN £3,500 ROI ✅
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Secure this limited premium high-frequency arbitaged liquidity slot before they sell out.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto justify-end shrink-0">
                  <button
                    id="btn-trigger-daily-offer-modal"
                    onClick={() => setShowDailyOffer(true)}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-[#0c0d12] hover:brightness-110 cursor-pointer transition-all"
                  >
                    <span>CLAIM ROYAL SLOT NOW</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>

              {/* Ticking Active Simulations Container (High focus!) */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                
                {/* Active Portfolio Column */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-400" />
                      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">YOUR ACTIVE PORTFOLIO</h3>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {activeInvestments.filter(i => i.status === 'active').length} Active Contracts
                    </span>
                  </div>

                  {activeInvestments.filter(inv => inv.status !== 'claimed').length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-amber-500/15 bg-[#121318]/40 p-8 text-center space-y-4">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/5 text-amber-500/50">
                        <Coins className="h-7 w-7" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-300">No active pool allocations detected</h4>
                        <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">
                          Configure your capital options inside the investment calculator or select one of the premium plans below to trigger real-time algorithmic trades.
                        </p>
                      </div>
                      <button
                        id="btn-switch-plans-tab"
                        onClick={() => setActiveTab('plans')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0c0d12] transition-all cursor-pointer"
                      >
                        <span>Explore Premium Pools</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="active-investments-grid">
                      {activeInvestments
                        .filter(inv => inv.status !== 'claimed')
                        .map(inv => (
                          <ActiveInvestmentComponent 
                            key={inv.id} 
                            investment={inv} 
                            onClaim={handleClaimPayout} 
                          />
                        ))}
                    </div>
                  )}

                  {/* Dynamic trading chart */}
                  <RoyalChart />
                </div>

                {/* Live community feeds Column */}
                <div className="space-y-6">
                  <LiveFeed />
                  <RoiCalculator onSelectPlan={setSelectedPlan} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'plans' && (
            <motion.div
              key="plans-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-10 text-left"
              id="plans-view-stage"
            >
              {/* Premium introduction banner */}
              <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-b from-[#121318] to-[#0d0e12] p-6 md:p-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl"></div>
                
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] font-mono block">
                  Institutional Yield Standards
                </span>
                <h2 className="font-display text-2xl font-bold text-white mt-1.5">
                  PREMIUM ROYAL CONTRACT TRADING PLANS
                </h2>
                <p className="mt-2 text-sm text-gray-400 max-w-2xl leading-relaxed">
                  Lock capital inside certified high-frequency algorithmic liquidity pools. Your deposit is secured via deep margin reserves and pays guaranteed daily or weekly dividends directly to your designated crypto or wire accounts.
                </p>
              </div>

              {/* Category 1: 24 Hours Plans */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-amber-500/10 pb-3">
                  <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                  <h3 className="font-display text-base font-bold text-[#d4af37] tracking-wider uppercase">
                    𝟐𝟒 𝐇𝐎𝐔𝐑𝐒 𝐈𝐍𝐕𝐄𝐒𝐓𝐌𝐄𝐍𝐓 𝐏𝐋𝐀𝐍𝐒
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {plans24h.map(plan => (
                    <PlanCard key={plan.id} plan={plan} onSelect={setSelectedPlan} />
                  ))}
                </div>
              </div>

              {/* Category 2: 2 Days Plans */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-amber-500/10 pb-3">
                  <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                  <h3 className="font-display text-base font-bold text-[#d4af37] tracking-wider uppercase">
                    𝟐 𝐃𝐀𝐘𝐒 𝐈𝐍𝐕𝐄𝐒𝐓𝐌𝐄𝐍𝐓 𝐏𝐋𝐀𝐍𝐒
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {plans2day.map(plan => (
                    <PlanCard key={plan.id} plan={plan} onSelect={setSelectedPlan} />
                  ))}
                </div>
              </div>

              {/* Category 3: Weekly Plans */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-amber-500/10 pb-3">
                  <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                  <h3 className="font-display text-base font-bold text-[#d4af37] tracking-wider uppercase">
                    𝐖𝐄𝐄𝐊𝐋𝐘 𝐈𝐍𝐕𝐄𝐒𝐓𝐌𝐄𝐍𝐓 𝐏𝐋𝐀𝐍𝐒
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {plansWeekly.map(plan => (
                    <PlanCard key={plan.id} plan={plan} onSelect={setSelectedPlan} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profiles' && (
            <motion.div
              key="profiles-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              id="profiles-view-stage"
            >
              <Profiles currentUser={currentUser} onLogout={handleLogout} />
            </motion.div>
          )}

          {activeTab === 'community' && (
            <motion.div
              key="community-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 gap-8 lg:grid-cols-3 text-left"
              id="community-view-stage"
            >
              <div className="lg:col-span-2 space-y-6">
                <TelegramSection />
              </div>
              <div className="space-y-6">
                <LiveFeed />
              </div>
            </motion.div>
          )}

          {activeTab === 'support' && (
            <motion.div
              key="support-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto space-y-8 text-left"
              id="support-view-stage"
            >
              {/* Premium Broker walkthrough */}
              <div className="rounded-2xl border border-amber-500/15 bg-[#121318]/60 p-6 md:p-8 backdrop-blur-sm space-y-6">
                <div className="flex items-center gap-3.5 border-b border-amber-500/10 pb-4">
                  <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white tracking-wide">SECURE FUND ALLOCATION CHANNELS</h3>
                    <p className="text-xs text-gray-400 font-mono">Verified multi-signature contract routes</p>
                  </div>
                </div>

                <div className="space-y-5 text-sm text-gray-300 leading-relaxed font-sans">
                  <p>
                    Participation inside the **Forex Royal Pool** is handled strictly through automated liquidity smart routes. Your allocations can be completed directly using our institutional deposit hubs.
                  </p>

                  <h4 className="font-display text-[#d4af37] font-bold text-sm tracking-widest uppercase pt-2">
                    EXECUTIVE DEPOSIT PATHS
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-amber-500/5 bg-[#171821]/60 text-center space-y-2">
                      <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full bg-amber-500/10 text-[#d4af37] font-bold font-mono">1</div>
                      <h5 className="font-semibold text-white">Select a Plan</h5>
                      <p className="text-xs text-gray-500">Pick any 24h, 2 Days, or Weekly allocation capital tier.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-amber-500/5 bg-[#171821]/60 text-center space-y-2">
                      <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full bg-amber-500/10 text-[#d4af37] font-bold font-mono">2</div>
                      <h5 className="font-semibold text-white">Provide Address</h5>
                      <p className="text-xs text-gray-500">Send the exact corresponding amount to the generated escrow.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-amber-500/5 bg-[#171821]/60 text-center space-y-2">
                      <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full bg-amber-500/10 text-[#d4af37] font-bold font-mono">3</div>
                      <h5 className="font-semibold text-white">Compound Live</h5>
                      <p className="text-xs text-gray-500">Track and withdraw your mature payout automatically.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs space-y-2 leading-relaxed">
                    <span className="font-bold text-[#d4af37] block font-mono">SECURITY GUARANTEE NOTICE:</span>
                    <p>
                      All deposits made to the Forex Royal platform are covered by our Capital Insurance Reserve. In the rare event of extreme market volatility, your initial capital is 100% protected and returned within 1 hour of contract expiration.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Security & Compliance Trust Banner */}
      <section id="royal-security-compliance-banner" className="border-t border-amber-500/10 bg-[#0b0c10] py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#07080a] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/[0.015] blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                SECURE INFRASTRUCTURE VERIFIED
              </span>
            </div>
            <h3 className="font-display text-lg font-black text-white uppercase tracking-wider">
              SECURITY &amp; REGULATORY COMPLIANCE
            </h3>
            <p className="text-xs text-gray-400 max-w-lg mx-auto">
              Our advanced algorithmic liquidity pools operate under strict cryptographic standards to guarantee zero-risk simulated environments and bulletproof system safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* SSL Encryption */}
            <div className="rounded-2xl border border-amber-500/5 bg-[#0e1015]/80 p-6 flex flex-col items-start gap-4 hover:border-amber-500/15 transition-all duration-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                  SSL 256-Bit Encryption
                  <span className="text-[8px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded font-bold">ACTIVE</span>
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  All connection protocols, user sessions, and verification uploads are processed through end-to-end RSA 256-bit secure tunnels.
                </p>
              </div>
            </div>

            {/* Verified Liquidity Pools */}
            <div className="rounded-2xl border border-amber-500/5 bg-[#0e1015]/80 p-6 flex flex-col items-start gap-4 hover:border-amber-500/15 transition-all duration-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                  Verified Pools
                  <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-bold">AUDITED</span>
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Smart routing allocation pools are continuously audited to preserve capital shield buffers and absolute fund solvency.
                </p>
              </div>
            </div>

            {/* 24/7 Monitoring */}
            <div className="rounded-2xl border border-amber-500/5 bg-[#0e1015]/80 p-6 flex flex-col items-start gap-4 hover:border-amber-500/15 transition-all duration-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 relative">
                <Activity className="h-5 w-5" />
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                  24/7 Redundancy
                  <span className="text-[8px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded font-bold">ONLINE</span>
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Dual fail-safe server structures guarantee 99.99% uptime with constant master algorithm status check loops.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Dark Gold Footer */}
      <footer id="royal-app-footer" className="mt-auto border-t border-amber-500/15 bg-[#0a0b0e] py-8 text-center text-xs text-gray-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex justify-center items-center gap-2">
            <Crown className="h-4 w-4 text-[#d4af37]" />
            <span className="font-display font-bold text-[#d4af37] tracking-widest">FOREX ROYAL POOL TRADING</span>
          </div>
          <p className="max-w-lg mx-auto leading-relaxed">
            Forex Royal Community is a decentralized liquidity pool provider. Yield figures represent real-time algorithm capabilities. Consult your personal financial broker before investing.
          </p>
          <div className="flex justify-center gap-4 text-[10px] font-mono text-gray-600">
            <span>© 2026 FOREX ROYAL CORP. ALL RIGHTS RESERVED</span>
            <span>•</span>
            <span>LICENSED CONTRACTS: SEC-049811</span>
          </div>
        </div>
      </footer>

      {/* Interactive Deposit Verification Simulator Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <DepositModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
            onConfirmDeposit={handleConfirmDeposit}
            defaultUsername={currentUser?.username || ''}
          />
        )}
      </AnimatePresence>

      {/* Daily Flash Offer Modal */}
      <AnimatePresence>
        {showDailyOffer && (
          <DailyOfferModal
            onClose={() => setShowDailyOffer(false)}
            onAllocate={(plan) => setSelectedPlan(plan)}
          />
        )}
      </AnimatePresence>

      {/* Persistent Mobile Bottom Navigation Bar */}
      <div id="mobile-navigation-bar" className="md:hidden fixed bottom-0 inset-x-0 bg-[#0d0e12]/95 border-t border-amber-500/15 backdrop-blur-md py-2.5 z-40 flex justify-around">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'plans', label: 'Plans', icon: Coins },
          { id: 'community', label: 'Forum', icon: MessageSquare },
          { id: 'support', label: 'Funding', icon: ShieldCheck }
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`mobile-nav-btn-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                isActive ? 'text-[#d4af37]' : 'text-gray-500 hover:text-white'
              }`}
            >
              <TabIcon className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Padding space at the bottom for mobile nav */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
}
