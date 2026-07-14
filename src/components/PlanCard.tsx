import { motion } from 'motion/react';
import { InvestmentPlan } from '../types';
import { ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

interface PlanCardProps {
  key?: string;
  plan: InvestmentPlan;
  onSelect: (plan: InvestmentPlan) => void;
}

export default function PlanCard({ plan, onSelect }: PlanCardProps) {
  // Calculate percentage increase or yield multiplier
  const yieldMultiplier = (plan.roi / plan.capital).toFixed(1);
  const totalProfit = plan.roi - plan.capital;

  const isHighValue = plan.capital >= 2000;

  return (
    <motion.div
      id={`plan-card-${plan.id}`}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={`group relative overflow-hidden rounded-2xl border bg-[#121318] p-6 transition-all duration-300 ${
        isHighValue
          ? 'border-amber-500 bg-gradient-to-b from-[#16181d] to-[#121318] shadow-lg shadow-amber-500/5'
          : 'border-amber-500/10 hover:border-amber-500/35'
      }`}
    >
      {/* Decorative Gold Glow for top-tier plans */}
      {isHighValue && (
        <div className="absolute top-0 right-0 rounded-bl-xl bg-gradient-to-r from-amber-600 to-yellow-500 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#000]">
          ROYAL DIAMOND
        </div>
      )}

      {/* Background Gradient Circle on Hover */}
      <div className="absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl transition-all duration-500 group-hover:scale-150"></div>

      {/* Plan Header */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
          <Sparkles className="h-3 w-3" />
          {plan.categoryLabel}
        </span>
        <span className="rounded-full bg-[#1e2028] px-3 py-1 font-mono text-xs font-semibold text-gray-300 border border-amber-500/5">
          {plan.durationLabel}
        </span>
      </div>

      {/* Figures section */}
      <div className="mt-6 grid grid-cols-2 gap-4 border-b border-amber-500/10 pb-5">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
            INVEST CAPITAL
          </span>
          <span className="font-display text-2xl font-black text-white md:text-3xl">
            £{plan.capital.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
            GUARANTEED ROI
          </span>
          <span className="font-display text-2xl font-black text-[#d4af37] md:text-3xl shimmer-gold">
            £{plan.roi.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Yield Breakdowns */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Net Profits:</span>
          <span className="font-bold font-mono text-[#d4af37]">
            +£{totalProfit.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Total Pool Multiplier:</span>
          <span className="font-bold text-white bg-amber-500/10 rounded px-1.5 py-0.5 text-[10px] font-mono">
            {yieldMultiplier}x Value
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <button
          id={`btn-select-plan-${plan.id}`}
          onClick={() => onSelect(plan)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
            isHighValue
              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-[#0c0d12] hover:shadow-lg hover:shadow-amber-500/10 hover:brightness-110'
              : 'bg-[#181920] border border-amber-500/20 text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0c0d12] hover:border-[#d4af37]'
          }`}
        >
          <span>Allocate Capital</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {/* Insurance Badge footer */}
      <div className="mt-3 flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500 font-mono">
        <ShieldCheck className="h-3 w-3 text-amber-500/50" />
        <span>Secured via Liquidity Pool Contract</span>
      </div>
    </motion.div>
  );
}
