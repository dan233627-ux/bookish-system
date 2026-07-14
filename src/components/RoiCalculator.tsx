import { useState } from 'react';
import { motion } from 'motion/react';
import { INVESTMENT_PLANS } from '../data';
import { Calculator, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import { InvestmentPlan } from '../types';

interface RoiCalculatorProps {
  onSelectPlan: (plan: InvestmentPlan) => void;
}

export default function RoiCalculator({ onSelectPlan }: RoiCalculatorProps) {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const currentPlan = INVESTMENT_PLANS[selectedPlanIndex];

  const netProfit = currentPlan.roi - currentPlan.capital;
  const yieldPercent = ((netProfit / currentPlan.capital) * 100).toFixed(0);

  const getDurationLabelDetail = (category: string) => {
    switch (category) {
      case '24h': return 'Ticking Live ROI for 24 Hours';
      case '2day': return 'Steady Distribution for 48 Hours';
      case 'weekly': return 'Weekly compounding payout';
      default: return '';
    }
  };

  return (
    <div id="roi-calculator-section" className="rounded-2xl border border-amber-500/10 bg-[#121318]/60 p-6 md:p-8 backdrop-blur-md">
      <div className="flex items-center gap-3 border-b border-amber-500/10 pb-4">
        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-white tracking-wider">ROYAL POOL ROI CALCULATOR</h3>
          <p className="text-xs text-gray-400">Simulate and select premium trading strategies</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left column: controls */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-3">
              SELECT INVESTMENT CAPACITY:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['24h', '2day', 'weekly'] as const).map(cat => {
                const count = INVESTMENT_PLANS.filter(p => p.category === cat).length;
                return (
                  <span
                    key={cat}
                    className="text-[10px] text-center font-bold font-mono py-1 rounded bg-[#17181f] text-gray-400 uppercase tracking-widest border border-amber-500/5"
                  >
                    {cat === '24h' ? '24 Hours' : cat === '2day' ? '2 Days' : 'Weekly'}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-mono">
              <span>Drag to scale Capital:</span>
              <span className="text-[#d4af37] font-bold">£{currentPlan.capital.toLocaleString()}</span>
            </div>
            <input
              id="calculator-range-input"
              type="range"
              min={0}
              max={INVESTMENT_PLANS.length - 1}
              value={selectedPlanIndex}
              onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-[#181921] appearance-none cursor-pointer accent-amber-500"
              style={{
                background: `linear-gradient(to right, #b4933a 0%, #b4933a ${(selectedPlanIndex / (INVESTMENT_PLANS.length - 1)) * 100}%, #181921 ${(selectedPlanIndex / (INVESTMENT_PLANS.length - 1)) * 100}%, #181921 100%)`
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-2">
              <span>£500 Min</span>
              <span>£1,500</span>
              <span>£3,000</span>
              <span>£10,000 Max</span>
            </div>
          </div>

          {/* Rapid Presets List */}
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Fast Selection Tiers:
            </span>
            <div className="flex flex-wrap gap-2">
              {INVESTMENT_PLANS.map((plan, index) => (
                <button
                  id={`calc-preset-btn-${plan.id}`}
                  key={plan.id}
                  onClick={() => setSelectedPlanIndex(index)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedPlanIndex === index
                      ? 'bg-[#d4af37] text-[#0c0d12] border-transparent'
                      : 'bg-[#181920] text-gray-400 border border-amber-500/5 hover:border-amber-500/30'
                  }`}
                >
                  £{plan.capital.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: metrics display */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/10 bg-[#16171d] p-6 flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-amber-500/5 blur-xl"></div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">SELECTED STRUCTURE:</span>
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-[#d4af37]">
                {currentPlan.categoryLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="block text-[10px] text-gray-500 uppercase tracking-wider">YOUR CAPITAL</span>
                <span className="font-display text-2xl font-bold text-white">£{currentPlan.capital.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#d4af37] uppercase tracking-wider">ESTIMATED PAYOUT</span>
                <span className="font-display text-2xl font-black text-[#d4af37] shimmer-gold">£{currentPlan.roi.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-amber-500/10 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Net Trading Profit:</span>
                <span className="text-emerald-400 font-mono font-bold">+£{netProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Calculated Yield ROI:</span>
                <span className="text-[#d4af37] font-mono font-bold">+{yieldPercent}% Profit Ratio</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Maturity Cycle:</span>
                <span className="text-white font-mono">{currentPlan.durationLabel} ({currentPlan.durationHours} hrs)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-500/5">
            <button
              id="calc-submit-btn"
              onClick={() => onSelectPlan(currentPlan)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] py-3 text-xs font-extrabold uppercase tracking-widest text-[#0c0d12] hover:brightness-110 cursor-pointer shadow-md shadow-amber-500/10"
            >
              <span>LOCK IN INVESTMENT</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-mono">
              <Shield className="h-3.5 w-3.5 text-amber-500/50" />
              <span>{getDurationLabelDetail(currentPlan.category)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
