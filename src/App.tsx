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
  TrendingUp,
  Sparkles,
  Lock,
  Activity,
  Award,
  Calculator,
  MoreHorizontal,
  X,
  Menu,
  User,
  ChevronRight
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
import AdminLoginPage from './components/AdminLoginPage';
import AdminApprovalPage from './components/AdminApprovalPage';
import PurchaseConfirmation from './components/PurchaseConfirmation';
import { supabase } from './utils/supabase/client';

const ADMIN_PASSWORD = 'RoyalAdmin2026!';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'admin-login' | 'admin-approval' | 'dashboard' | 'confirmation'>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; walletAddress: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'plans' | 'profiles' | 'community' | 'support' | 'calculator'>('dashboard');
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [purchaseConfirmation, setPurchaseConfirmation] = useState<{
    plan: InvestmentPlan;
    paymentMethod: string;
    username: string;
  } | null>(null);
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>([]);
  const [totalClaimedEarnings, setTotalClaimedEarnings] = useState<number>(0);
  const [showDailyOffer, setShowDailyOffer] = useState<boolean>(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState<boolean>(false);
  const [isLoadingInvestments, setIsLoadingInvestments] = useState<boolean>(false);

  const TRON_WITHDRAWAL_FEE_USD = 80;
  const MANAGEMENT_FEE_RATE = 0.03;

  const calculateManagementFee = (gross: number) => Number((gross * MANAGEMENT_FEE_RATE).toFixed(2));
  const calculateTotalWithdrawalFees = (gross: number) => Number((TRON_WITHDRAWAL_FEE_USD + calculateManagementFee(gross)).toFixed(2));
  const calculateNetWithdrawal = (gross: number) => Number((gross - calculateTotalWithdrawalFees(gross)).toFixed(2));

  const getInvestmentEndDate = (startDate: Date, durationHours: number) => {
    return new Date(startDate.getTime() + durationHours * 3600 * 1000);
  };

  const isInvestmentMature = (investment: ActiveInvestment) => {
    return new Date(investment.endDate).getTime() <= Date.now();
  };

  // Listen to hash change for navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setCurrentPage('admin-login');
        return;
      }

      if (hash === '#calculator') {
        setActiveTab('calculator');
      } else if (hash === '#plans') {
        setActiveTab('plans');
      } else if (hash === '#profiles') {
        setActiveTab('profiles');
      } else if (hash === '#community') {
        setActiveTab('community');
      } else if (hash === '#support') {
        setActiveTab('support');
      } else if (hash === '#dashboard' || hash === '') {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash(); // initial check

    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Load investments from Supabase
  const loadUserInvestments = async (userId: string) => {
    setIsLoadingInvestments(true);
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        throw error;
      }

      if (data) {
        const mapped = data.map((inv: any) => {
          const calculatedEndDate = inv.end_date
            ? inv.end_date
            : getInvestmentEndDate(new Date(inv.start_date), Number(inv.duration_hours)).toISOString();
          const normalizedStatus = inv.status === 'pending'
            ? 'pending'
            : inv.status === 'active' && new Date(calculatedEndDate).getTime() <= Date.now()
              ? 'completed'
              : inv.status;

          return {
            id: inv.id,
            planId: inv.plan_id,
            planLabel: inv.plan_label,
            category: inv.category,
            capital: Number(inv.capital),
            roi: Number(inv.roi),
            startDate: inv.start_date,
            endDate: calculatedEndDate,
            durationHours: Number(inv.duration_hours),
            progress: 0,
            currentEarning: Number(inv.capital),
            status: normalizedStatus,
          };
        });
        
        // Sum claimed earnings dynamically using net payout after fees
        const claimedSum = mapped
          .filter(inv => inv.status === 'claimed')
          .reduce((sum, inv) => sum + calculateNetWithdrawal(Number(inv.roi)), 0);
        
        console.log(`Successfully loaded ${mapped.length} investments for user ${userId}`);
        setTotalClaimedEarnings(claimedSum);
        setActiveInvestments(mapped);
      }
    } catch (e) {
      console.error('Failed to load investments from Supabase', e);
      setActiveInvestments([]);
    } finally {
      setIsLoadingInvestments(false);
    }
  };

  // Auto-login or self-healing demo registration for alan.turing@univ-scam-demo.com
  const autoLoginDemoUser = async () => {
    const demoEmail = 'alan.turing@univ-scam-demo.com';
    const demoPassword = 'admin123';
    
    const loggedOut = localStorage.getItem('royal_logged_out');
    if (loggedOut === 'true') {
      setCurrentPage('landing');
      return;
    }

    try {
      let { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error) {
        const signupRes = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
        });
        
        if (signupRes.data?.user) {
          data = signupRes.data;
          
          await supabase.from('profiles').upsert({
            id: signupRes.data.user.id,
            user_rank: 'Gold',
            join_date: '2026-07-01T00:00:00Z',
            trust_score: 94,
            base_invested: 15000,
            base_earnings: 82500,
            base_withdrawn: 45000,
            base_completed: 18,
          }, { onConflict: 'id' });
        }
      }

      if (data?.user) {
        setCurrentUser({ username: demoEmail, walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f42e2d' });
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
        // Properly await the investments load
        await loadUserInvestments(data.user.id);
      } else {
        setCurrentPage('landing');
      }
    } catch (e) {
      console.error('Demo auto-login failed', e);
      setCurrentPage('landing');
    }
  };

  // Load persistent session and investments from Supabase
  useEffect(() => {
    // Call async function to load session and investments
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const email = session.user.email || '';
        setCurrentUser({ username: email, walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f42e2d' });
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
        await loadUserInvestments(session.user.id);
      } else {
        await autoLoginDemoUser();
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const email = session.user.email || '';
        setCurrentUser({ username: email, walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f42e2d' });
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
        await loadUserInvestments(session.user.id);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = (username: string, walletAddress: string) => {
    localStorage.removeItem('royal_logged_out');
    setCurrentUser({ username, walletAddress });
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        await loadUserInvestments(user.id);
      }
    });
  };

  const handleAdminSuccess = () => {
    setIsAdminAuthenticated(true);
    setCurrentPage('admin-approval');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.setItem('royal_logged_out', 'true');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentPage('landing');
    setActiveInvestments([]);
    setTotalClaimedEarnings(0);
  };

  const handleAccessTerminal = () => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('auth');
    }
  };

  // Handle confirmed simulated deposit
  const handleConfirmDeposit = async (
    username: string, 
    plan: InvestmentPlan, 
    screenshotBase64?: string | null, 
    paymentMethod?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const end = getInvestmentEndDate(now, plan.durationHours);

    const newDbInvestment = {
      user_id: user.id,
      plan_id: plan.id,
      plan_label: plan.categoryLabel,
      category: plan.category,
      capital: plan.capital,
      roi: plan.roi,
      start_date: now.toISOString(),
      end_date: end.toISOString(),
      duration_hours: plan.durationHours,
      status: 'pending',
      screenshot_url: screenshotBase64 || null,
      payment_method: paymentMethod || 'Crypto'
    };

    try {
      const { data, error } = await supabase
        .from('investments')
        .insert(newDbInvestment)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const mappedNew: ActiveInvestment = {
          id: data.id,
          planId: data.plan_id,
          planLabel: data.plan_label,
          category: data.category,
          capital: Number(data.capital),
          roi: Number(data.roi),
          startDate: data.start_date,
          endDate: data.end_date,
          durationHours: data.duration_hours,
          progress: 0,
          currentEarning: Number(data.capital),
          status: data.status
        };

        setActiveInvestments(prev => [mappedNew, ...prev]);
        setActiveTab('dashboard');
        setPurchaseConfirmation({
          plan,
          paymentMethod: paymentMethod || 'Crypto',
          username,
        });
        setCurrentPage('confirmation');
      }
    } catch (e) {
      console.error('Failed to create investment in Supabase', e);
    }

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
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          console.log('[Telegram Alert System]', data.message);
        } catch {
          console.warn('[Telegram Alert System] response is not JSON:', text);
        }
      })
      .catch((err) => {
        console.error('[Telegram Alert Error]', err);
      });
  };

  // Handle simulated withdrawal payout claim
  const handleClaimPayout = async (id: string, feeCurrency: 'TRX' | 'USDT' | 'BTC' | 'ETH') => {
    const investment = activeInvestments.find(inv => inv.id === id);
    if (investment) {
      const now = Date.now();
      const endTime = new Date(investment.endDate).getTime();
      if (endTime > now) {
        alert('This investment is not yet mature. Please wait until the maturity date before withdrawing.');
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from('investments')
        .update({ status: 'claimed' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const grossPayout = Number(data.roi);
        const managementFee = calculateManagementFee(grossPayout);
        const totalFee = calculateTotalWithdrawalFees(grossPayout);
        const netPayout = Math.max(grossPayout - totalFee, 0);

        const updated = activeInvestments.map(inv => {
          if (inv.id === id) {
            return {
              ...inv,
              status: 'claimed' as const,
              progress: 100,
              currentEarning: grossPayout,
              netPayout,
            };
          }
          return inv;
        });
        setActiveInvestments(updated);
        
        const claimedSum = updated
          .filter(inv => inv.status === 'claimed')
          .reduce((sum, inv) => sum + (inv.netPayout ?? Number(inv.roi)), 0);

        setTotalClaimedEarnings(claimedSum);
      }
    } catch (e) {
      console.error('Failed to claim payout in Supabase', e);
    }
  };

  if (currentPage === 'landing') {
    return (
      <LandingPage onAccessTerminal={handleAccessTerminal} onOpenAdmin={() => setCurrentPage('admin-login')} />
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

  if (currentPage === 'admin-login') {
    return (
      <AdminLoginPage
        onBack={() => setCurrentPage('landing')}
        onLoginSuccess={handleAdminSuccess}
        adminPassword={ADMIN_PASSWORD}
      />
    );
  }

  if (currentPage === 'admin-approval') {
    return isAdminAuthenticated ? (
      <AdminApprovalPage onBack={() => setCurrentPage('landing')} />
    ) : (
      <AdminLoginPage
        onBack={() => setCurrentPage('landing')}
        onLoginSuccess={handleAdminSuccess}
        adminPassword={ADMIN_PASSWORD}
      />
    );
  }

  if (currentPage === 'confirmation' && purchaseConfirmation) {
    return (
      <PurchaseConfirmation
        plan={purchaseConfirmation.plan}
        paymentMethod={purchaseConfirmation.paymentMethod}
        username={purchaseConfirmation.username}
        onReturnToDashboard={() => {
          setPurchaseConfirmation(null);
          setCurrentPage('dashboard');
          setActiveTab('dashboard');
          setSelectedPlan(null);
        }}
      />
    );
  }

  // All nav tabs used in desktop + tablet navs
  const allNavTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plans', label: 'Plans', icon: Coins },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'profiles', label: 'Profile', icon: Award },
    { id: 'community', label: 'Forum', icon: MessageSquare },
    { id: 'support', label: 'Broker', icon: ShieldCheck },
  ];

  // Mobile bottom bar — 4 primary + More
  const mobileBottomTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plans', label: 'Plans', icon: Coins },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'profiles', label: 'Profile', icon: Award },
    { id: 'community', label: 'Forum', icon: MessageSquare },
  ];

  // Mobile More sheet tabs
  const moreSheetTabs = [
    { id: 'support', label: 'Secure Broker', icon: ShieldCheck },
  ];

  // Current page label for mobile header
  const currentTabLabel = allNavTabs.find(t => t.id === activeTab)?.label || 'Dashboard';

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    setMobileMoreOpen(false);
  };

  const plans24h = INVESTMENT_PLANS.filter(p => p.category === '24h');
  const plans2day = INVESTMENT_PLANS.filter(p => p.category === '2day');
  const plansWeekly = INVESTMENT_PLANS.filter(p => p.category === 'weekly');

  return (
    <div id="forex-royal-app-root" className="min-h-screen bg-[#08080a] text-gray-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      
      {/* ============================================================
          HEADER — responsive: desktop full labels | tablet icon-only | mobile title+hamburger 
          ============================================================ */}
      <header id="royal-app-header" className="sticky top-0 z-40 bg-[#0d0e12]/90 border-b border-amber-500/15 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between gap-2">
            
            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="relative flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 via-yellow-400 to-amber-600 shadow-md shadow-amber-500/10">
                <Crown className="h-5 w-5 md:h-6 md:w-6 text-[#0d0e12]" />
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 opacity-20 blur-sm"></div>
              </div>
              <div className="text-left hidden sm:block">
                <h1 className="font-display text-base md:text-lg font-black tracking-widest text-[#d4af37] leading-none">
                  FOREX ROYAL
                </h1>
                <span className="text-[8px] uppercase tracking-widest text-gray-400 font-mono block mt-0.5">
                  PRESTIGE INVESTMENT POOL
                </span>
              </div>
              {/* Mobile: show only brand name, no tagline */}
              <div className="text-left sm:hidden">
                <h1 className="font-display text-sm font-black tracking-widest text-[#d4af37] leading-none">
                  FOREX ROYAL
                </h1>
              </div>
            </div>

            {/* Mobile center: current page title */}
            <div className="flex-1 flex justify-center md:hidden">
              <span className="text-xs font-bold uppercase tracking-widest text-white/70 font-mono">
                {currentTabLabel}
              </span>
            </div>

            {/* Desktop + Tablet Nav — hidden on mobile */}
            <nav className="hidden md:flex items-center gap-1" id="desktop-navbar" aria-label="Main navigation">
              {allNavTabs.map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    id={`nav-btn-${tab.id}`}
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    title={tab.label}
                    className={`touch-target flex items-center gap-1.5 rounded-xl px-2.5 lg:px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'bg-amber-500/10 text-[#d4af37] border-b-2 border-amber-400/80 shadow-inner' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <TabIcon className="h-4 w-4 shrink-0" />
                    {/* Labels only on large screens to prevent overflow */}
                    <span className="hidden lg:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right side: Wallet pill (tablet+) + hamburger (mobile) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Wallet pill — tablet and up */}
              <div className="hidden md:flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                <Wallet className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-[8px] text-gray-500 font-mono font-bold uppercase leading-none">CLAIMED</span>
                  <span className="font-mono text-xs font-black text-emerald-400">
                    £{totalClaimedEarnings.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Mobile: wallet balance compact */}
              <div className="flex md:hidden items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-2">
                <Wallet className="h-4 w-4 text-emerald-400" />
                <span className="font-mono text-xs font-black text-emerald-400">
                  £{totalClaimedEarnings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Stage — extra bottom padding on mobile for the fixed bottom nav */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 md:pb-8" id="royal-main-viewport">
        
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
              <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-3">
                
                {/* Active Portfolio Column */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-400" />
                      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">YOUR ACTIVE PORTFOLIO</h3>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {activeInvestments.filter(i => i.status === 'active' || i.status === 'pending').length} Active/Pending Contracts
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
                            onClaim={(id, feeCurrency) => handleClaimPayout(id, feeCurrency)} 
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
                  
                  {/* ROI Simulation Summary Card */}
                  <div className="rounded-2xl border border-amber-500/10 bg-[#121318]/60 p-6 backdrop-blur-md text-left">
                    <div className="flex items-center gap-3 border-b border-amber-500/10 pb-4">
                      <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 border border-amber-500/10">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">ROYAL POOL SIMULATOR</h3>
                        <p className="text-[10px] text-gray-400">Model algorithmic leverage returns</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-4">
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Simulate institutional HFT yield strategies. Drag to scale your capital from <span className="text-white font-semibold">�500 to �10,000</span> and instantly generate simulated compounding equity growth curves.
                      </p>
                      
                      <div className="rounded-lg bg-[#16171d] p-3.5 border border-amber-500/5 flex items-center justify-between">
                        <div>
                          <span className="block text-[9px] font-mono text-gray-500 uppercase">Est. Profit Potential</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">+740% Profit Ratio</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] font-mono text-gray-500 uppercase">Maturity Options</span>
                          <span className="text-xs font-semibold text-white">24h / 2 Days / Weekly</span>
                        </div>
                      </div>

                      <button
                        id="btn-redirect-calculator"
                        onClick={() => {
                          window.location.hash = 'calculator';
                          setActiveTab('calculator');
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] py-3 text-xs font-extrabold uppercase tracking-widest text-[#0c0d12] hover:brightness-110 cursor-pointer shadow-md shadow-amber-500/10 transition-all duration-300"
                      >
                        <span>SIMULATE ROI</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          
          {activeTab === 'calculator' && (
            <motion.div
              key="calculator-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 text-left"
              id="calculator-view-stage"
            >
              <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-b from-[#121318] to-[#0d0e12] p-6 md:p-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>
                
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] font-mono block">
                  Interactive Simulator
                </span>
                <h2 className="font-display text-2xl font-bold text-white mt-1.5 uppercase">
                  ROYAL POOL ROI CALCULATOR
                </h2>
                <p className="mt-2 text-sm text-gray-400 max-w-2xl leading-relaxed">
                  Select your capital scale, duration cycle, and immediately analyze simulated compounding equity curves for premium high-frequency trading arbitrage pools.
                </p>
              </div>

              <RoiCalculator onSelectPlan={setSelectedPlan} />
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
              <Profiles 
                currentUser={currentUser} 
                onLogout={handleLogout} 
                activeInvestments={activeInvestments}
                totalClaimedEarnings={totalClaimedEarnings}
                setActiveTab={setActiveTab}
              />
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

      {/* ============================================================
          MOBILE BOTTOM NAVIGATION BAR — hidden on md+
          ============================================================ */}
      <div
        id="mobile-navigation-bar"
        className="md:hidden fixed bottom-0 inset-x-0 bg-[#0d0e12]/97 border-t border-amber-500/20 backdrop-blur-lg z-40 flex justify-around items-center mobile-nav-safe"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {mobileBottomTabs.map((tab, idx) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`mobile-nav-btn-${tab.id}`}
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`touch-target flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all duration-200 flex-1 py-2 ${
                isActive
                  ? 'text-[#d4af37]'
                  : 'text-gray-500 active:text-white'
              }`}
            >
              <div className={`relative flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                isActive ? 'bg-amber-500/15' : ''
              }`}>
                <TabIcon className="h-5 w-5" />
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[#d4af37]" />
                )}
              </div>
              <span className={`hidden sm:block text-[9px] font-bold uppercase tracking-widest truncate ${idx === 2 ? 'max-w-[48px]' : ''}`}>{tab.label}</span>
            </button>
          );
        })}

        {/* More button */}
        <button
          id="mobile-nav-btn-more"
          onClick={() => setMobileMoreOpen(prev => !prev)}
          className={`touch-target flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all duration-200 flex-1 py-2 ${
            mobileMoreOpen || ['support'].includes(activeTab)
              ? 'text-[#d4af37]'
              : 'text-gray-500 active:text-white'
          }`}
        >
          <div className={`relative flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
            mobileMoreOpen || ['support'].includes(activeTab) ? 'bg-amber-500/15' : ''
          }`}>
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <span className="hidden sm:block text-[9px] font-bold uppercase tracking-widest">More</span>
        </button>
      </div>

      {/* ============================================================
          MOBILE MORE SLIDE-UP SHEET
          ============================================================ */}
      <AnimatePresence>
        {mobileMoreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="more-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMoreOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-30"
            />
            {/* Sheet */}
            <motion.div
              key="more-sheet"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0d0e12] border-t border-amber-500/25 rounded-t-2xl"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              {/* Sheet Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-gray-700" />
              </div>

              <div className="px-4 pb-2">
                <p className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">More Options</p>

                {moreSheetTabs.map(tab => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`more-sheet-btn-${tab.id}`}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-4 rounded-xl px-4 py-3.5 mb-1.5 text-sm font-semibold transition-all cursor-pointer touch-target ${
                        isActive
                          ? 'bg-amber-500/10 text-[#d4af37] border border-amber-500/20'
                          : 'text-gray-300 hover:bg-white/5 active:bg-white/10'
                      }`}
                    >
                      <TabIcon className="h-5 w-5 shrink-0" />
                      <span>{tab.label}</span>
                      <ChevronRight className="h-4 w-4 ml-auto text-gray-500" />
                    </button>
                  );
                })}

                {/* Logout */}
                <button
                  id="more-sheet-btn-logout"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 rounded-xl px-4 py-3.5 mb-1.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer touch-target"
                >
                  <X className="h-5 w-5 shrink-0" />
                  <span>Sign Out</span>
                </button>

                {/* Divider + wallet info */}
                <div className="mt-3 pt-3 border-t border-amber-500/10 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-emerald-400" />
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Claimed Dividends</span>
                  </div>
                  <span className="font-mono text-sm font-black text-emerald-400">£{totalClaimedEarnings.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
