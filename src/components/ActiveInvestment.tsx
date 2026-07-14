import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ActiveInvestment as ActiveInvestmentType } from '../types';
import { Coins, Flame, Clock, CheckCircle2, DollarSign } from 'lucide-react';

interface ActiveInvestmentProps {
  key?: string;
  investment: ActiveInvestmentType;
  onClaim: (id: string) => void;
}

export default function ActiveInvestment({ investment, onClaim }: ActiveInvestmentProps) {
  const [currentProgress, setCurrentProgress] = useState(investment.progress);
  const [currentEarning, setCurrentEarning] = useState(investment.currentEarning);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Calculate simulated rate of tick increase per second
  // For standard simulation, we tick up progress and earnings so they can see immediate action!
  useEffect(() => {
    // We want the simulation to feel extremely active, so we increase progress and earnings slightly faster
    // or simulate real-time hourly rates. Let's make it tick up progress by 0.05% per second to simulate rapid growth,
    // and scale earnings accordingly so the user gets to see completions during their preview!
    const totalProfitRange = investment.roi - investment.capital;

    const interval = setInterval(() => {
      setCurrentProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }

        const step = 0.08; // speed of simulation progress tick
        const nextProgress = Math.min(prevProgress + step, 100);
        
        // Calculate current earnings based on progress
        const earned = investment.capital + (totalProfitRange * (nextProgress / 100));
        setCurrentEarning(earned);

        return nextProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [investment]);

  // Handle ticking clock representation
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const end = new Date(investment.endDate);
      const diffMs = end.getTime() - now.getTime();

      // Since we simulate rapid progress in the UI, let's also mock the countdown clock to scale with progress!
      // This keeps the countdown synchronized with the progress bar.
      const simulatedHoursLeft = (investment.durationHours * (100 - currentProgress)) / 100;
      
      if (simulatedHoursLeft <= 0 || currentProgress >= 100) {
        setTimeRemaining('00:00:00 (Ready to Claim)');
        return;
      }

      const hours = Math.floor(simulatedHoursLeft);
      const minutesDecimal = (simulatedHoursLeft - hours) * 60;
      const minutes = Math.floor(minutesDecimal);
      const seconds = Math.floor((minutesDecimal - minutes) * 60);

      const pad = (n: number) => n.toString().padStart(2, '0');
      setTimeRemaining(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
    };

    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    return () => clearInterval(clockInterval);
  }, [currentProgress, investment]);

  const isCompleted = currentProgress >= 100;

  return (
    <div
      id={`active-inv-card-${investment.id}`}
      className={`relative overflow-hidden rounded-2xl border bg-[#121318] p-6 ${
        isCompleted
          ? 'border-emerald-500/40 bg-gradient-to-br from-[#121c17] to-[#121318] shadow-lg shadow-emerald-500/5'
          : 'border-amber-500/20 shadow-lg'
      }`}
    >
      {/* Sparkles background */}
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-amber-500/5 blur-xl"></div>

      {/* Header info */}
      <div className="flex items-center justify-between border-b border-amber-500/10 pb-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${isCompleted ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-white tracking-wider uppercase">
              {investment.planLabel} Pool
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">
              Capital Allocated: £{investment.capital.toLocaleString()}
            </span>
          </div>
        </div>

        {isCompleted ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 font-mono">
            <CheckCircle2 className="h-3.5 w-3.5" />
            COMPLETED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 font-mono animate-pulse">
            <Flame className="h-3.5 w-3.5" />
            COMPOUNDING LIVE
          </span>
        )}
      </div>

      {/* Numbers */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <span className="block text-[9px] uppercase font-bold text-gray-500 font-mono">CURRENT REALIZED VALUE</span>
          <span className="font-mono text-xl font-bold text-white mt-0.5 block">
            £{currentEarning.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="block text-[9px] uppercase font-bold text-gray-500 font-mono">TARGET MATURITY ROI</span>
          <span className="font-mono text-xl font-bold text-[#d4af37] shimmer-gold mt-0.5 block">
            £{investment.roi.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Progress slider bar */}
      <div className="mt-5 space-y-2">
        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
          <span>Progress: {currentProgress.toFixed(1)}%</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-500/50" />
            {timeRemaining}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isCompleted 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                : 'bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600'
            }`}
            style={{ width: `${currentProgress}%` }}
            initial={{ width: '0%' }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      </div>

      {/* Claims triggers */}
      <div className="mt-6">
        {isCompleted ? (
          <button
            id={`btn-claim-payout-${investment.id}`}
            onClick={() => onClaim(investment.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 text-xs font-extrabold uppercase tracking-widest text-[#000] hover:brightness-110 cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <span>WITHDRAW ROYAL PAYOUT</span>
          </button>
        ) : (
          <button
            id={`btn-disabled-claim-${investment.id}`}
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17181f] border border-amber-500/5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 cursor-not-allowed"
          >
            <span>LOCKED UNTIL MATURITY</span>
          </button>
        )}
      </div>
    </div>
  );
}
