import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INVESTMENT_PLANS } from '../data';
import { Calculator, ArrowRight, Shield, TrendingUp } from 'lucide-react';
import { InvestmentPlan } from '../types';

interface RoiCalculatorProps {
  onSelectPlan: (plan: InvestmentPlan) => void;
}

export default function RoiCalculator({ onSelectPlan }: RoiCalculatorProps) {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [hoveredCurvePoint, setHoveredCurvePoint] = useState<{ time: string; value: number; index: number } | null>(null);
  
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

  // Generate Equity Curve
  const stepsCount = 10;
  const startCapital = currentPlan.capital;
  const endRoi = currentPlan.roi;
  const totalProfit = endRoi - startCapital;
  
  const curvePoints: { time: string; value: number }[] = [];
  for (let i = 0; i <= stepsCount; i++) {
    const fraction = i / stepsCount;
    // steady growth with a slight compounding exponential curve
    const growthFraction = Math.pow(fraction, 1.25);
    
    // add small realistic HFT arbitrage wiggles (noise)
    const wiggle = i === 0 || i === stepsCount ? 0 : Math.sin(i * 1.7) * (totalProfit * 0.018);
    const value = Math.round(startCapital + (totalProfit * growthFraction) + wiggle);
    
    let timeLabel = '';
    if (currentPlan.category === '24h') {
      timeLabel = `${Math.round(24 * fraction)}h`;
    } else if (currentPlan.category === '2day') {
      timeLabel = `${Math.round(48 * fraction)}h`;
    } else {
      timeLabel = `Day ${Math.round(7 * fraction)}`;
    }
    
    curvePoints.push({ time: timeLabel, value });
  }

  // SVG Geometry
  const width = 600;
  const height = 150;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 25;
  const plotW = width - paddingLeft - paddingRight;
  const plotH = height - paddingTop - paddingBottom;

  const minVal = startCapital * 0.95;
  const maxVal = endRoi * 1.05;
  const valRange = maxVal - minVal;

  const getX = (index: number) => paddingLeft + (index / stepsCount) * plotW;
  const getY = (val: number) => paddingTop + plotH - ((val - minVal) / valRange) * plotH;

  // Build SVG Paths
  let linePath = '';
  let areaPath = '';
  if (curvePoints.length > 0) {
    linePath = `M ${getX(0)} ${getY(curvePoints[0].value)}`;
    areaPath = `M ${getX(0)} ${paddingTop + plotH} L ${getX(0)} ${getY(curvePoints[0].value)}`;

    for (let i = 1; i < curvePoints.length; i++) {
      const cx = getX(i);
      const cy = getY(curvePoints[i].value);
      linePath += ` L ${cx.toFixed(1)} ${cy.toFixed(1)}`;
      areaPath += ` L ${cx.toFixed(1)} ${cy.toFixed(1)}`;
    }

    areaPath += ` L ${getX(curvePoints.length - 1)} ${paddingTop + plotH} Z`;
  }

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
                const isActive = currentPlan.category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      const firstIdxOfCat = INVESTMENT_PLANS.findIndex(p => p.category === cat);
                      if (firstIdxOfCat !== -1) {
                        setSelectedPlanIndex(firstIdxOfCat);
                      }
                    }}
                    className={`text-[10px] text-center font-bold font-mono py-2.5 rounded uppercase tracking-widest border cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-[#d4af37] text-[#0c0d12] border-transparent font-black shadow-md shadow-amber-500/10'
                        : 'bg-[#17181f] text-gray-400 border-amber-500/5 hover:border-amber-500/20 hover:text-white'
                    }`}
                  >
                    {cat === '24h' ? '24 Hours' : cat === '2day' ? '2 Days' : 'Weekly'}
                  </button>
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

          {/* Simulated Equity Curve SVG display */}
          <div className="border-t border-amber-500/5 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mb-2 uppercase tracking-wide">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <span>Simulated Compounding Equity Curve:</span>
            </div>
            <div className="relative rounded-xl border border-emerald-500/10 bg-[#0d0e12]/60 p-3 overflow-visible">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="equityGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid Horizontals */}
                {[minVal, (minVal + maxVal) / 2, maxVal].map((val, i) => (
                  <line
                    key={i}
                    x1={paddingLeft} y1={getY(val).toFixed(1)}
                    x2={width - paddingRight} y2={getY(val).toFixed(1)}
                    stroke="rgba(16, 185, 129, 0.05)" strokeDasharray="3 3"
                  />
                ))}

                {/* Y-axis values */}
                {[minVal, (minVal + maxVal) / 2, maxVal].map((val, i) => (
                  <text
                    key={i}
                    x={paddingLeft - 6} y={parseFloat(getY(val).toFixed(1)) + 3}
                    textAnchor="end" fontSize="8.5" fill="rgba(156,163,175,0.4)" fontFamily="monospace"
                  >
                    £{val.toFixed(0)}
                  </text>
                ))}

                {/* X-axis values */}
                {[0, Math.floor(stepsCount / 2), stepsCount].map(idx => (
                  <text
                    key={idx}
                    x={getX(idx).toFixed(1)} y={height - 6}
                    textAnchor="middle" fontSize="8" fill="rgba(156,163,175,0.4)" fontFamily="monospace"
                  >
                    {curvePoints[idx].time}
                  </text>
                ))}

                {/* Area fill */}
                {areaPath && (
                  <path d={areaPath} fill="url(#equityGrad)" />
                )}

                {/* Curve Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter="url(#equityGlow)"
                  />
                )}

                {/* Interactive Points / Hover Zones */}
                {curvePoints.map((pt, i) => {
                  const isHovered = hoveredCurvePoint?.index === i;
                  return (
                    <g key={i}>
                      {/* invisible larger hover zone */}
                      <circle
                        cx={getX(i).toFixed(1)}
                        cy={getY(pt.value).toFixed(1)}
                        r="12"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredCurvePoint({ ...pt, index: i })}
                        onMouseLeave={() => setHoveredCurvePoint(null)}
                      />
                      {/* actual dot */}
                      <circle
                        cx={getX(i).toFixed(1)}
                        cy={getY(pt.value).toFixed(1)}
                        r={isHovered ? 5 : 2.5}
                        fill={isHovered ? '#ffffff' : '#10b981'}
                        stroke="#0d0e12"
                        strokeWidth={isHovered ? 2 : 1}
                        className="pointer-events-none transition-all duration-100"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip inside SVG wrapper */}
              <AnimatePresence>
                {hoveredCurvePoint && (() => {
                  const pct = (hoveredCurvePoint.index / stepsCount) * 80 + 10;
                  return (
                    <motion.div
                      key="equity-tooltip"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute z-20 rounded border border-emerald-500/20 bg-[#161720] px-2 py-1 shadow-lg pointer-events-none text-left"
                      style={{ left: `${pct}%`, bottom: '68%' }}
                    >
                      <span className="block text-[8px] font-mono text-gray-500 uppercase">{hoveredCurvePoint.time}</span>
                      <span className="block text-xs font-bold text-emerald-400 font-mono">£{hoveredCurvePoint.value.toLocaleString()}</span>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
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
