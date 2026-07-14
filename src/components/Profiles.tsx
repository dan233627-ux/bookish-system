import { useState } from 'react';
import { 
  Crown, 
  TrendingUp, 
  Award, 
  Zap,
  Calendar,
  Shield,
  Star,
  Copy,
  LogOut,
  Settings
} from 'lucide-react';

interface ProfilesProps {
  currentUser: { username: string; walletAddress: string } | null;
  onLogout: () => void;
}

export default function Profiles({ currentUser, onLogout }: ProfilesProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  
  // Load profile data from props or defaults
  const profileData = {
    username: currentUser?.username || 'RoyalTrader_Demo',
    rank: 'Gold' as const,
    joinDate: '2026-07-01',
    walletAddress: currentUser?.walletAddress || '0x742d35Cc6634C0532925a3b844Bc9e7595f42e2d',
    totalInvested: 15000,
    totalEarnings: 82500,
    activeInvestments: 3,
    completedInvestments: 18,
    roi: 550,
    trustScore: 94,
    totalWithdrawn: 45000
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'VIP':
        return 'from-red-600 to-pink-500';
      case 'Royal Elite':
        return 'from-amber-500 to-yellow-400';
      case 'Gold':
        return 'from-yellow-500 to-amber-400';
      case 'Silver':
        return 'from-gray-400 to-gray-300';
      case 'Bronze':
        return 'from-orange-600 to-amber-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(profileData.walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Profile Header Card */}
      <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-[#171821] to-[#121318] p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-amber-500/[0.02] blur-3xl"></div>

        <div className="relative z-10">
          {/* Top Row: Avatar & Basic Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            {/* Avatar */}
            <div className={`h-24 w-24 rounded-2xl bg-gradient-to-br ${getRankColor(profileData.rank)} flex items-center justify-center text-white font-display text-4xl font-black shadow-lg`}>
              {profileData.username.charAt(0)}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl font-black text-white">
                  {profileData.username}
                </h1>
                <div className={`bg-gradient-to-r ${getRankColor(profileData.rank)} text-white px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center gap-2`}>
                  <Star className="h-4 w-4" />
                  {profileData.rank}
                </div>
              </div>
              <p className="text-gray-400 font-mono text-sm">
                Member since {new Date(profileData.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Action Buttons */}
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

          {/* Trust Score & Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider block mb-2">Trust Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-300">{profileData.trustScore}%</span>
                <div className="flex-1 h-1.5 bg-[#0d0e12]/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                    style={{ width: `${profileData.trustScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider block mb-2">Active Investments</span>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-400" />
                <span className="text-2xl font-black text-purple-300">{profileData.activeInvestments}</span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <span className="text-[9px] font-mono text-blue-400 font-bold uppercase tracking-wider block mb-2">ROI Achieved</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <span className="text-2xl font-black text-blue-300">{profileData.roi}%</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <span className="text-[9px] font-mono text-[#d4af37] font-bold uppercase tracking-wider block mb-2">Total Withdrawn</span>
              <span className="text-2xl font-black text-amber-200">£{profileData.totalWithdrawn.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Address Section */}
      <div className="rounded-2xl border border-amber-500/15 bg-[#121318]/60 p-6 md:p-8">
        <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400" />
          Wallet Information
        </h3>
        <div className="bg-[#0d0e12] border border-amber-500/10 rounded-lg p-4 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-mono mb-2">Primary Withdrawal Address</p>
            <p className="font-mono text-sm text-gray-200 break-all">{profileData.walletAddress}</p>
          </div>
          <button
            onClick={handleCopyAddress}
            className="ml-4 flex-shrink-0 p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg hover:bg-amber-500/20 transition-all cursor-pointer"
            title="Copy address"
          >
            <Copy className={`h-5 w-5 ${copiedAddress ? 'text-emerald-400' : 'text-amber-400'}`} />
          </button>
        </div>
        {copiedAddress && (
          <p className="text-xs text-emerald-400 mt-2 font-mono">✓ Address copied to clipboard</p>
        )}
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment Summary */}
        <div className="rounded-2xl border border-amber-500/15 bg-[#121318]/60 p-6 md:p-8">
          <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Investment Summary
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#171821] rounded-lg border border-amber-500/10">
              <div>
                <p className="text-sm text-gray-400 font-mono">Total Invested</p>
                <p className="text-2xl font-black text-amber-200 mt-1">£{profileData.totalInvested.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-mono">Base Capital</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#171821] rounded-lg border border-emerald-500/10">
              <div>
                <p className="text-sm text-gray-400 font-mono">Total Earnings</p>
                <p className="text-2xl font-black text-emerald-300 mt-1">£{profileData.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-500 font-mono">+{((profileData.totalEarnings / profileData.totalInvested) * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#171821] rounded-lg border border-blue-500/10">
              <div>
                <p className="text-sm text-gray-400 font-mono">Net Profit</p>
                <p className="text-2xl font-black text-blue-300 mt-1">£{(profileData.totalEarnings - profileData.totalInvested).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-500 font-mono">Your Return</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contract History */}
        <div className="rounded-2xl border border-amber-500/15 bg-[#121318]/60 p-6 md:p-8">
          <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-400" />
            Contract History
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#171821] rounded-lg border border-purple-500/10">
              <div>
                <p className="text-sm text-gray-400 font-mono">Completed Contracts</p>
                <p className="text-2xl font-black text-purple-300 mt-1">{profileData.completedInvestments}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-500 font-mono">Finished</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#171821] rounded-lg border border-orange-500/10">
              <div>
                <p className="text-sm text-gray-400 font-mono">Active Contracts</p>
                <p className="text-2xl font-black text-orange-300 mt-1">{profileData.activeInvestments}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-orange-500 font-mono">Running</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg border border-amber-500/20">
              <p className="text-xs text-gray-400 font-mono mb-2">Success Rate</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-amber-300">
                  {((profileData.completedInvestments / (profileData.completedInvestments + profileData.activeInvestments)) * 100).toFixed(0)}%
                </p>
                <div className="w-24 h-2 bg-[#0d0e12]/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-400"
                    style={{
                      width: `${(profileData.completedInvestments / (profileData.completedInvestments + profileData.activeInvestments)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-amber-500/15 bg-[#121318]/60 p-6 md:p-8">
        <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amber-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/25 hover:border-amber-500/50 transition-all cursor-pointer text-left group">
            <p className="text-sm font-bold text-[#d4af37] mb-1">Deposit Funds</p>
            <p className="text-xs text-gray-400">Add capital to your account</p>
          </button>
          <button className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/25 hover:border-emerald-500/50 transition-all cursor-pointer text-left group">
            <p className="text-sm font-bold text-emerald-400 mb-1">Withdraw Earnings</p>
            <p className="text-xs text-gray-400">Request payout to wallet</p>
          </button>
          <button className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/25 hover:border-blue-500/50 transition-all cursor-pointer text-left group">
            <p className="text-sm font-bold text-blue-400 mb-1">Browse Plans</p>
            <p className="text-xs text-gray-400">View investment opportunities</p>
          </button>
        </div>
      </div>
    </div>
  );
}
