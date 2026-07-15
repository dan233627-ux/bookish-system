import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ActiveInvestment as ActiveInvestmentType } from '../types';
import { Coins, Flame, Clock, CheckCircle2, DollarSign } from 'lucide-react';

interface ActiveInvestmentProps {
  key?: string;
  investment: ActiveInvestmentType;
  onClaim: (id: string, feeCurrency: 'TRX' | 'USDT' | 'BTC' | 'ETH') => void;
}

export default function ActiveInvestment({ investment, onClaim }: ActiveInvestmentProps) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentEarning, setCurrentEarning] = useState(investment.status === 'pending' ? 0 : investment.capital);
  const [feeCurrency, setFeeCurrency] = useState<'TRX' | 'USDT' | 'BTC' | 'ETH'>('TRX');
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateProgress = () => {
      const nowTime = Date.now();
      const startTime = new Date(investment.startDate).getTime();
      const endTime = new Date(investment.endDate).getTime();
      const totalMs = endTime - startTime;
      const elapsedMs = nowTime - startTime;

      let nextProgress = 0;
      if (totalMs > 0) {
        nextProgress = Math.min((elapsedMs / totalMs) * 100, 100);
      }
      if (nextProgress < 0) nextProgress = 0;
      setCurrentProgress(nextProgress);

      if (investment.status === 'pending') {
        setCurrentEarning(0);
      } else {
        const totalProfitRange = investment.roi - investment.capital;
        const earned = investment.capital + (totalProfitRange * (nextProgress / 100));
        setCurrentEarning(earned);
      }

      // Remaining Time Countdown
      const diffMs = endTime - nowTime;
      if (diffMs <= 0 || nextProgress >= 100) {
        setTimeRemaining('00:00:00 (Ready to Claim)');
        return;
      }

      const totalSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      const pad = (n: number) => n.toString().padStart(2, '0');
      setTimeRemaining(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);

    return () => clearInterval(interval);
  }, [investment]);

  const isPending = investment.status === 'pending';
  const isCompleted = !isPending && currentProgress >= 100;
  const TRON_WITHDRAWAL_FEE = 80;
  const MANAGEMENT_FEE_RATE = 0.03;
  const managementFee = Number((investment.roi * MANAGEMENT_FEE_RATE).toFixed(2));
  const withdrawalFeeTotal = Number((TRON_WITHDRAWAL_FEE + managementFee).toFixed(2));
  const expectedNetPayout = Number((investment.roi - withdrawalFeeTotal).toFixed(2));

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

        {isPending ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 font-mono">
            <Clock className="h-3.5 w-3.5" />
            PENDING VERIFICATION
          </span>
        ) : isCompleted ? (
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

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-[10px] text-gray-400 font-mono">
        <div className="rounded-2xl border border-amber-500/10 bg-[#0f1217] p-3">
          <p className="uppercase tracking-[0.24em] text-[9px] text-gray-500">Purchased</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {new Date(investment.startDate).toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/10 bg-[#0f1217] p-3">
          <p className="uppercase tracking-[0.24em] text-[9px] text-gray-500">Maturity Date</p>
          <p className="mt-1 text-sm font-semibold text-[#d4af37]">
            {isPending
              ? investment.durationHours === 24
                ? 'After 24 hours'
                : investment.durationHours === 48
                  ? 'After 2 days'
                  : investment.durationHours === 168
                    ? 'After 7 days'
                    : `After ${investment.durationHours} hours`
              : new Date(investment.endDate).toLocaleString()}
          </p>
        </div>
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
          <span>{isPending ? 'Status: Awaiting verification' : `Progress: ${currentProgress.toFixed(1)}%`}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-500/50" />
            {isPending ? 'Pending review' : timeRemaining}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isPending
                ? 'bg-gradient-to-r from-amber-500/60 to-amber-400/80'
                : isCompleted 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : 'bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600'
            }`}
            style={{ width: `${isPending ? 0 : currentProgress}%` }}
            initial={{ width: '0%' }}
            animate={{ width: `${isPending ? 0 : currentProgress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      </div>

      {/* Fee summary */}
      {isCompleted && (
        <div className="mt-5 rounded-2xl border border-emerald-500/10 bg-[#0e1611]/70 p-4 text-xs text-gray-300">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-emerald-300 uppercase tracking-[0.18em]">Withdraw Fee Currency</p>
              <p className="text-[11px] text-gray-400">Choose the crypto you want to pay the fee with.</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['TRX', 'USDT', 'BTC', 'ETH'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setFeeCurrency(method)}
                  className={`rounded-lg px-2 py-1 text-[10px] font-semibold uppercase transition-all ${
                    feeCurrency === method
                      ? 'bg-emerald-500/15 border border-emerald-400 text-emerald-300'
                      : 'bg-[#121318] border border-emerald-500/10 text-gray-300 hover:border-emerald-400'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-3">
            <div className="rounded-xl bg-[#121318] p-3">
              <p className="text-gray-400">Network fee</p>
              <p className="mt-1 font-semibold text-white">${TRON_WITHDRAWAL_FEE.toFixed(0)}</p>
            </div>
            <div className="rounded-xl bg-[#121318] p-3">
              <p className="text-gray-400">Management fee</p>
              <p className="mt-1 font-semibold text-white">£{managementFee.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-[#121318] p-3">
              <p className="text-gray-400">Estimated net payout</p>
              <p className="mt-1 font-semibold text-emerald-300">£{expectedNetPayout.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Claims triggers */}
      <div className="mt-6">
        {isPending ? (
          <button
            id={`btn-pending-${investment.id}`}
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17181f] border border-amber-500/10 py-3 text-xs font-bold uppercase tracking-widest text-amber-400 cursor-not-allowed"
          >
            <span>AWAITING VERIFICATION</span>
          </button>
        ) : isCompleted ? (
          <button
            id={`btn-claim-payout-${investment.id}`}
            onClick={() => onClaim(investment.id, feeCurrency)}
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
