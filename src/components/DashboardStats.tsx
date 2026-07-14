import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, Award, ShieldCheck, Zap } from 'lucide-react';

export default function DashboardStats() {
  const [poolCapital, setPoolCapital] = useState(2458900);
  const [activeMembers, setActiveMembers] = useState(14208);
  const [totalPayouts, setTotalPayouts] = useState(1894000);

  // Slow ticks to simulate active high frequency pool trading
  useEffect(() => {
    const interval = setInterval(() => {
      setPoolCapital(prev => prev + Math.floor(Math.random() * 80) + 15);
      if (Math.random() > 0.7) {
        setActiveMembers(prev => prev + 1);
      }
      setTotalPayouts(prev => prev + Math.floor(Math.random() * 120) + 30);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      id: 'stat-capital',
      label: 'TOTAL ROYAL POOL SIZE',
      value: `£${poolCapital.toLocaleString()}`,
      icon: TrendingUp,
      change: '+18.4% this week',
      color: 'from-amber-500/20 to-yellow-600/5'
    },
    {
      id: 'stat-members',
      label: 'ACTIVE ROYAL TRADERS',
      value: activeMembers.toLocaleString(),
      icon: Users,
      change: '+249 joined today',
      color: 'from-amber-600/20 to-yellow-700/5'
    },
    {
      id: 'stat-payouts',
      label: 'TOTAL ROI PAYOUTS',
      value: `£${totalPayouts.toLocaleString()}`,
      icon: Award,
      change: 'Fully Guaranteed Payouts',
      color: 'from-yellow-500/20 to-amber-600/5'
    }
  ];

  return (
    <div id="dashboard-stats-container" className="space-y-6">
      {/* Top Main Active Alert */}
      <motion.div
        id="active-trading-banner"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-[#121318] p-6 shadow-xl"
      >
        {/* Glow behind banner */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl"></div>

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/20">
              <Zap className="h-7 w-7 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold tracking-wider text-[#d4af37]">
                  FOREX ROYAL POOL TRADING INVESTMENT
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  ACTIVE ✅
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-400 max-w-xl">
                Experience high-frequency algorithm trading backed by Royal brokers. Secure fixed returns on 24-Hour, 2-Day, and Weekly cycles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch rounded-xl bg-amber-500/5 px-4 py-3 border border-amber-500/10 md:self-auto">
            <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">Capital Shield</div>
              <div className="text-xs text-gray-400 font-mono">100% Insured Pool Contracts</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid Stats */}
      <div id="stats-grid" className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4, borderColor: 'rgba(245, 158, 11, 0.4)' }}
              className={`relative overflow-hidden rounded-xl border border-amber-500/10 bg-gradient-to-br ${stat.color} p-6 transition-all duration-300`}
            >
              {/* Abs grid bg effects */}
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
                <Icon className="h-32 w-32" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">
                  {stat.label}
                </span>
                <span className="rounded-lg bg-[#0e0f12] p-2 text-amber-400 border border-amber-500/15">
                  <Icon className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-4">
                <span className="font-display text-2xl font-black text-[#d4af37] md:text-3xl tracking-tight">
                  {stat.value}
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="font-mono">{stat.change}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
