import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Flame, ShieldAlert, Award, ArrowRight, Star } from 'lucide-react';
import { InvestmentPlan } from '../types';

interface DailyOfferModalProps {
  onClose: () => void;
  onAllocate: (plan: InvestmentPlan) => void;
  plan?: InvestmentPlan;
}

export const DAILY_OFFER_PLAN: InvestmentPlan = {
  id: 'daily-offer-special',
  category: '24h',
  categoryLabel: 'ROYAL FLASH POOL',
  durationLabel: '24 Hours',
  capital: 300,
  roi: 3500,
  durationHours: 24
};

export const DAILY_OFFER_PLAN_200: InvestmentPlan = {
  id: 'daily-offer-200',
  category: '24h',
  categoryLabel: 'ROYAL FLASH POOL',
  durationLabel: '24 Hours',
  capital: 200,
  roi: 2500,
  durationHours: 24
};

export default function DailyOfferModal({ onClose, onAllocate, plan = DAILY_OFFER_PLAN }: DailyOfferModalProps) {
  const [slotsLeft, setSlotsLeft] = useState(3);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Simulate slot pressure
  useEffect(() => {
    // Small chance to drop slots to create high prestige and urgency
    const timer = setTimeout(() => {
      setSlotsLeft(2);
    }, 15000);

    const timer2 = setTimeout(() => {
      setSlotsLeft(1);
    }, 45000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div
      id="daily-offer-backdrop"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl
                 flex flex-col justify-end md:justify-center md:items-center md:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        id="daily-offer-box"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full md:max-w-lg overflow-hidden
                   rounded-t-3xl md:rounded-3xl
                   border-2 border-amber-400 bg-[#0d0e12] text-left
                   shadow-[0_0_50px_rgba(212,175,55,0.25)]
                   max-h-[92dvh] overflow-y-auto"
      >
        {/* Shimmer Background Accent */}
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl"></div>

        {/* Diagonal Ribbon for Limited Edition */}
        <div className="absolute top-6 -right-12 rotate-45 bg-gradient-to-r from-amber-600 to-yellow-400 text-[#0c0d12] font-mono text-[9px] font-black py-1 px-12 tracking-widest uppercase shadow-md">
          VIP OFFER
        </div>

        {/* Close Button */}
        <button
          id="btn-close-daily-offer"
          onClick={onClose}
          className="absolute top-5 left-5 text-gray-500 hover:text-white rounded-full p-2 hover:bg-white/5 transition-all cursor-pointer z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 text-center space-y-6">
          
          {/* Header Icon & Sparkles */}
          <div className="relative inline-flex items-center justify-center mt-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-300 p-[1px]">
              <div className="h-full w-full rounded-2xl bg-[#0c0d12] flex items-center justify-center">
                <Award className="h-10 w-10 text-amber-400 animate-pulse" />
              </div>
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute -top-2 -right-2 text-amber-400"
            >
              <Sparkles className="h-5 w-5" />
            </motion.div>
          </div>

          {/* Title & Caption */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#d4af37] bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
              FOREX ROYAL EXCLUSIVE SPECIAL
            </span>
            <h2 className="font-display text-2xl font-black tracking-wider text-white">
              ROYAL POOL ACTIVE SPECIAL ✅
            </h2>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Our master algorithm detected high-spread Gold arbitrage. Allocate immediate liquidity for maximum daily leverage payout.
            </p>
          </div>

          {/* Core Metrics Box */}
          <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-b from-[#171821] to-[#121318] p-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
            
            <div className="grid grid-cols-2 gap-4 divide-x divide-amber-500/10">
              <div className="text-center">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono">
                  INVEST CAPITAL
                </span>
                <span className="font-display text-3xl font-black text-white block mt-1">
                  £{plan.capital.toLocaleString()}
                </span>
              </div>
              <div className="text-center pl-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#d4af37] font-mono">
                  ROYAL PAYOUT (ROI)
                </span>
                <span className="font-display text-3xl font-black text-amber-400 shimmer-gold block mt-1">
                  £{plan.roi.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-500/5 flex justify-between items-center text-[10px] text-gray-400 font-mono">
              <span>Maturity: <strong className="text-white">24 Hours (Fast Release)</strong></span>
              <span>Yield ratio: <strong className="text-emerald-400">+{Math.round((plan.roi / plan.capital - 1) * 100)}% Net</strong></span>
            </div>
          </div>

          {/* Slots Available indicator */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-center gap-2">
              <Flame className="h-4 w-4 text-amber-500 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
                LIMITED CAPACITY: ONLY <strong className="text-[#d4af37] font-mono text-sm">{slotsLeft} / 3</strong> SLOTS REMAINING
              </span>
            </div>
            
            {/* Visual Slots chips representation */}
            <div className="flex justify-center gap-3">
              {[1, 2, 3].map(slotIndex => {
                const isClaimed = slotIndex > slotsLeft;
                return (
                  <motion.div
                    key={slotIndex}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`h-9 w-14 rounded-xl flex flex-col items-center justify-center border transition-all ${
                      isClaimed 
                        ? 'border-gray-800 bg-[#121318] text-gray-600' 
                        : 'border-amber-400 bg-amber-400/5 text-amber-400 shadow-md shadow-amber-500/10'
                    }`}
                  >
                    <span className="text-[8px] font-mono uppercase font-bold">Slot 0{slotIndex}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      {isClaimed ? 'Sold' : 'FREE'}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <button
              id="btn-claim-daily-offer"
              onClick={() => {
                onAllocate(plan);
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 py-4 text-xs font-black uppercase tracking-widest text-[#0c0d12] hover:shadow-xl hover:shadow-amber-500/20 hover:brightness-110 cursor-pointer transition-all"
            >
              <span>CLAIM ROYAL SLOT NOW</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            
            <button
              id="btn-skip-daily-offer"
              onClick={onClose}
              className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-all cursor-pointer font-mono"
            >
              No thanks, enter general dashboard
            </button>
          </div>

          {/* Security stamp */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-wider text-gray-500 font-mono border-t border-amber-500/5 pt-4">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500/50" />
            <span>Regulated by Sovereign FX Arbitrage Protocols</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
