import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Award, 
  Zap,
  Calendar,
  Shield,
  Star,
  Copy,
  LogOut,
  Settings,
  Loader2
} from 'lucide-react';

import { ActiveInvestment } from '../types';
import { supabase } from '../utils/supabase/client';

interface ProfilesProps {
  currentUser: { username: string; walletAddress: string } | null;
  onLogout: () => void;
  activeInvestments: ActiveInvestment[];
  totalClaimedEarnings: number;
  setActiveTab: (tab: 'dashboard' | 'plans' | 'profiles' | 'community' | 'support' | 'calculator') => void;
}

interface DbProfile {
  id: string;
  user_rank: string;
  join_date: string;
  trust_score: number;
  base_invested: number;
  base_earnings: number;
  base_withdrawn: number;
  base_completed: number;
  wallet_address?: string;
}

export default function Profiles({ 
  currentUser, 
  onLogout, 
  activeInvestments, 
  totalClaimedEarnings, 
  setActiveTab 
}: ProfilesProps) {
  const [dbProfile, setDbProfile] = useState<DbProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all profile data from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error.message);
        } else if (data) {
          setDbProfile(data as DbProfile);
        }
      } catch (e) {
        console.error('Profiles fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  // All base values from database — zero defaults for new users
  const baseInvested   = Number(dbProfile?.base_invested  ?? 0);
  const baseEarnings   = Number(dbProfile?.base_earnings  ?? 0);
  const baseWithdrawn  = Number(dbProfile?.base_withdrawn ?? 0);
  const baseCompleted  = Number(dbProfile?.base_completed ?? 0);
  const trustScore     = Number(dbProfile?.trust_score    ?? 0);
  const rank           = dbProfile?.user_rank || dbProfile?.rank || 'Bronze';
  const joinDate       = dbProfile?.join_date || new Date().toISOString();
  const walletAddress  = dbProfile?.wallet_address || currentUser?.walletAddress || '—';
  const username       = currentUser?.username || '—';

  // Dynamically compute totals from DB base + live investments
  const pendingInvested = activeInvestments
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.capital, 0);
  const confirmedInvested = activeInvestments
    .filter(inv => inv.status !== 'pending')
    .reduce((sum, inv) => sum + inv.capital, 0);
  const userInvested = pendingInvested + confirmedInvested;

  const userEarnings = activeInvestments
    .filter(inv => inv.status !== 'pending')
    .reduce((sum, inv) => sum + inv.roi, 0);

  const activeCount        = activeInvestments.filter(inv => inv.status === 'active' || inv.status === 'pending' || inv.status === 'completed').length;
  const claimedCount       = activeInvestments.filter(inv => inv.status === 'claimed').length;

  const totalInvested      = baseInvested + userInvested;
  const totalEarnings      = baseEarnings + userEarnings;
  const totalWithdrawn     = baseWithdrawn + totalClaimedEarnings;
  const completedContracts = baseCompleted + claimedCount;
  const totalContracts     = completedContracts + activeCount;

  const netProfitBase = totalEarnings - (baseInvested + confirmedInvested);
  const netProfit      = Math.max(0, netProfitBase);
  const effectiveInvested = baseInvested + confirmedInvested;
  const roiPercentage  = effectiveInvested > 0 ? Math.round((totalEarnings / effectiveInvested) * 100) : 0;
  const successRate    = totalContracts > 0 ? Math.round((completedContracts / totalContracts) * 100) : 0;

  const getRankColor = (r: string) => {
    switch (r) {
      case 'VIP':        return 'from-red-600 to-pink-500';
      case 'Royal Elite': return 'from-amber-500 to-yellow-400';
      case 'Gold':       return 'from-yellow-500 to-amber-400';
      case 'Silver':     return 'from-gray-400 to-gray-300';
      case 'Bronze':     return 'from-orange-600 to-amber-600';
      default:           return 'from-gray-500 to-gray-600';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-amber-400">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span className="font-mono text-sm uppercase tracking-widest">Loading profile from database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">

      {/* ── Profile Header Card ── */}
      <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-[#171821] to-[#121318] p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-amber-500/[0.02] blur-3xl" />

        <div className="relative z-10">
          {/* Avatar + Info Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className={`h-24 w-24 rounded-2xl bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center text-white font-display text-4xl font-black shadow-lg`}>
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="font-display text-2xl font-black text-white break-all">{username}</h1>
                <div className={`bg-gradient-to-r ${getRankColor(rank)} text-white px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center gap-2 shrink-0`}>
                  <Star className="h-4 w-4" />
                  {rank}
                </div>
              </div>
              <p className="text-gray-400 font-mono text-sm">
                Member since {new Date(joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/25 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0c0d12] transition-all cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button 
                onClick={onLogout}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-lg bg-red-500/10 border border-red-500/25 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Trust Score & Quick Stats Row — all from DB */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider block mb-2">Trust Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-300">{trustScore}%</span>
                <div className="flex-1 h-1.5 bg-[#0d0e12]/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${trustScore}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider block mb-2">Active Investments</span>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-400" />
                <span className="text-2xl font-black text-purple-300">{activeCount}</span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <span className="text-[9px] font-mono text-blue-400 font-bold uppercase tracking-wider block mb-2">ROI Achieved</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <span className="text-2xl font-black text-blue-300">{roiPercentage}%</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <span className="text-[9px] font-mono text-[#d4af37] font-bold uppercase tracking-wider block mb-2">Total Withdrawn</span>
              <span className="text-2xl font-black text-amber-200">£{totalWithdrawn.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>



      {/* ── Investment Summary + Contract History ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Investment Summary — base from DB + live investments */}
        <div className="rounded-2xl border border-amber-500/15 bg-[#121318]/60 p-6 md:p-8">
          <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Investment Summary
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#171821] rounded-lg border border-amber-500/10">
              <div>
                <p className="text-sm text-gray-400 font-mono">Total Invested</p>
                <p className="text-2xl font-black text-amber-200 mt-1">£{totalInvested.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-mono">Base Capital</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#171821] rounded-lg border border-emerald-500/10">
              <div>
                <p className="text-sm text-gray-400 font-mono">Total Earnings</p>
                <p className="text-2xl font-black text-emerald-300 mt-1">£{totalEarnings.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-500 font-mono">
                  +{totalInvested > 0 ? ((totalEarnings / totalInvested) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#171821] rounded-lg border border-blue-500/10">
              <div>
                <p className="text-sm text-gray-400 font-mono">Net Profit</p>
                <p className="text-2xl font-black text-blue-300 mt-1">£{netProfit.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-500 font-mono">Your Return</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contract History — base_completed from DB + live claimed */}
        <div className="rounded-2xl border border-amber-500/15 bg-[#121318]/60 p-6 md:p-8">
          <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-400" />
            Contract History
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#171821] rounded-lg border border-purple-500/10">
              <div>
                <p className="text-sm text-gray-400 font-mono">Completed Contracts</p>
                <p className="text-2xl font-black text-purple-300 mt-1">{completedContracts}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-500 font-mono">Finished</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#171821] rounded-lg border border-orange-500/10">
              <div>
                <p className="text-sm text-gray-400 font-mono">Active Contracts</p>
                <p className="text-2xl font-black text-orange-300 mt-1">{activeCount}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-orange-500 font-mono">Running</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg border border-amber-500/20">
              <p className="text-xs text-gray-400 font-mono mb-2">Success Rate</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-amber-300">{successRate}%</p>
                <div className="w-24 h-2 bg-[#0d0e12]/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-400"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="rounded-2xl border border-amber-500/15 bg-[#121318]/60 p-6 md:p-8">
        <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amber-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab('plans')}
            className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/25 hover:border-amber-500/50 transition-all cursor-pointer text-left group"
          >
            <p className="text-sm font-bold text-[#d4af37] mb-1">Deposit Funds</p>
            <p className="text-xs text-gray-400">Add capital to your account</p>
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/25 hover:border-emerald-500/50 transition-all cursor-pointer text-left group"
          >
            <p className="text-sm font-bold text-emerald-400 mb-1">Withdraw Earnings</p>
            <p className="text-xs text-gray-400">Request payout to wallet</p>
          </button>
          <button 
            onClick={() => setActiveTab('plans')}
            className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/25 hover:border-blue-500/50 transition-all cursor-pointer text-left group"
          >
            <p className="text-sm font-bold text-blue-400 mb-1">Browse Plans</p>
            <p className="text-xs text-gray-400">View investment opportunities</p>
          </button>
        </div>
      </div>
    </div>
  );
}
