import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Layers, Activity } from 'lucide-react';

// --- API config (mirrored from xauusd-ma-tracker.js) ------------------------
const API_KEY = "c68959d72163e40f9e6e13b6fbdca18a99673df1083ee963776112d98002bf55";
const BASE_URL = "https://api.gold-api.com";
const POLL_INTERVAL_MS = 10_000;
const FAST_PERIOD = 5;
const SLOW_PERIOD = 20;
const MAX_POINTS = 120;

interface ChartPoint {
  time: string;
  rawTime: number;
  price: number;
  fastMA: number | null;
  slowMA: number | null;
}

type Timeline = '1H' | '6H' | '24H';

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function computeMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  return mean(prices.slice(prices.length - period));
}

export default function RoyalChart() {
  const [activeTimeline, setActiveTimeline] = useState<Timeline>('1H');
  const [allPoints, setAllPoints] = useState<ChartPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [highPrice, setHighPrice] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('—');
  const [apiStatus, setApiStatus] = useState<'connecting' | 'live' | 'error'>('connecting');

  const firstPriceRef = useRef<number | null>(null);

  const fetchLatestPrice = useCallback(async (): Promise<{ price: number; updatedAt: string }> => {
    const res = await fetch(`${BASE_URL}/price/XAU`, {
      headers: { 'x-api-key': API_KEY },
    });
    if (!res.ok) throw new Error(`gold-api.com error: ${res.status}`);
    return res.json();
  }, []);

  const tick = useCallback(async () => {
    try {
      const data = await fetchLatestPrice();
      const price = data.price;
      const rawTime = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
      const timeLabel = new Date(rawTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setAllPoints(prev => {
        const prices = [...prev.map(p => p.price), price];
        const fastMA = computeMA(prices, FAST_PERIOD);
        const slowMA = computeMA(prices, SLOW_PERIOD);

        const newPoint: ChartPoint = { time: timeLabel, rawTime, price, fastMA, slowMA };
        const updated = [...prev, newPoint];
        return updated.length > MAX_POINTS ? updated.slice(-MAX_POINTS) : updated;
      });

      if (firstPriceRef.current === null) firstPriceRef.current = price;
      const diff = parseFloat((price - (firstPriceRef.current ?? price)).toFixed(2));
      const pct = parseFloat(((diff / (firstPriceRef.current ?? price)) * 100).toFixed(2));

      setCurrentPrice(price);
      setPriceChange(diff);
      setPriceChangePercent(pct);
      setHighPrice(h => (h === null || price > h ? price : h));
      setLastUpdateTime(timeLabel);
      setApiStatus('live');
    } catch (err) {
      console.error('[RoyalChart] fetch failed:', (err as Error).message);
      setApiStatus('error');
    }
  }, [fetchLatestPrice]);

  useEffect(() => {
    tick();
    const timer = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      clearInterval(timer);
    };
  }, [tick]);

  useEffect(() => {
    firstPriceRef.current = allPoints.length > 0 ? allPoints[0].price : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimeline]);

  const visibleData = (() => {
    if (allPoints.length === 0) return [];
    const now = Date.now();
    const cutoffMs: Record<Timeline, number> = {
      '1H':  60 * 60 * 1_000,
      '6H':  6 * 60 * 60 * 1_000,
      '24H': 24 * 60 * 60 * 1_000,
    };
    const cutoff = now - cutoffMs[activeTimeline];
    const filtered = allPoints.filter(p => p.rawTime >= cutoff);
    return filtered.length < 2 ? allPoints.slice(-30) : filtered;
  })();

  const padding = { top: 30, right: 44, bottom: 35, left: 52 };
  const svgW = 700;
  const svgH = 260;
  const plotW = svgW - padding.left - padding.right;
  const plotH = svgH - padding.top - padding.bottom;

  const prices = visibleData.map(d => d.price);
  const allMaValues = [
    ...visibleData.map(d => d.fastMA).filter(Boolean) as number[],
    ...visibleData.map(d => d.slowMA).filter(Boolean) as number[],
  ];
  const allValues = [...prices, ...allMaValues];
  const minY = allValues.length ? Math.min(...allValues) * 0.9995 : 0;
  const maxY = allValues.length ? Math.max(...allValues) * 1.0005 : 1;
  const rangeY = maxY - minY || 1;

  const gx = (i: number) =>
    padding.left + (i / Math.max(visibleData.length - 1, 1)) * plotW;

  const gy = (v: number) =>
    padding.top + plotH - ((v - minY) / rangeY) * plotH;

  const buildPath = (getVal: (d: ChartPoint) => number | null) => {
    let d = '';
    let started = false;
    for (let i = 0; i < visibleData.length; i++) {
      const v = getVal(visibleData[i]);
      if (v === null) continue;
      d += started ? ` L ${gx(i).toFixed(1)} ${gy(v).toFixed(1)}` : `M ${gx(i).toFixed(1)} ${gy(v).toFixed(1)}`;
      started = true;
    }
    return d;
  };

  const pricePath = buildPath(d => d.price);
  const fastPath  = buildPath(d => d.fastMA);
  const slowPath  = buildPath(d => d.slowMA);

  let areaPath = '';
  if (visibleData.length > 1) {
    areaPath = `M ${gx(0).toFixed(1)} ${(padding.top + plotH).toFixed(1)} ` +
      pricePath.replace(/^M/, 'L') +
      ` L ${gx(visibleData.length - 1).toFixed(1)} ${(padding.top + plotH).toFixed(1)} Z`;
  }

  const yTicks = [minY, (minY + maxY) / 2, maxY];

  const xTicks: { i: number; label: string }[] = [];
  if (visibleData.length > 1) {
    const step = Math.max(1, Math.floor(visibleData.length / 4));
    for (let i = 0; i < visibleData.length; i += step) {
      xTicks.push({ i, label: visibleData[i].time.slice(0, 5) });
    }
    const last = visibleData.length - 1;
    if (xTicks[xTicks.length - 1]?.i !== last) xTicks.push({ i: last, label: visibleData[last].time.slice(0, 5) });
  }

  const isPositive = priceChange >= 0;

  return (
    <div id="royal-chart-container" className="rounded-2xl border border-amber-500/10 bg-[#121318]/60 p-6 backdrop-blur-md">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-amber-500/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 border border-amber-500/10">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">XAU/USD (Gold Spot)</h3>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono">POOL ASSET</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono flex items-center gap-1 ${
                apiStatus === 'live'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : apiStatus === 'error'
                  ? 'bg-rose-500/10 text-rose-400'
                  : 'bg-gray-500/10 text-gray-400'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  apiStatus === 'live' ? 'bg-emerald-400 animate-ping' : apiStatus === 'error' ? 'bg-rose-400' : 'bg-gray-400 animate-pulse'
                }`} />
                {apiStatus === 'live' ? 'LIVE' : apiStatus === 'error' ? 'API ERR' : 'CONNECTING'}
              </span>
            </div>
            <p className="text-xs text-gray-400">Live data · gold-api.com · 10s poll</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#17181f] p-1 rounded-lg border border-amber-500/5">
          {(['1H', '6H', '24H'] as Timeline[]).map(tl => (
            <button
              id={`btn-timeline-${tl}`}
              key={tl}
              onClick={() => setActiveTimeline(tl)}
              className={`px-3 py-1 text-xs font-bold font-mono rounded-md transition-all cursor-pointer ${
                activeTimeline === tl
                  ? 'bg-[#d4af37] text-[#0c0d12]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tl}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <span className="block text-[10px] uppercase font-bold text-gray-500 font-mono">SPOT VALUE</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-white font-mono">
              {currentPrice !== null ? `$${currentPrice.toFixed(2)}` : '—'}
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0 mb-1" />
          </div>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-gray-500 font-mono">CHG ({activeTimeline})</span>
          <span className={`text-sm font-bold font-mono mt-0.5 block ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent}%)
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-gray-500 font-mono">SESSION HIGH</span>
          <span className="text-sm font-bold text-gray-300 font-mono mt-0.5 block">
            {highPrice !== null ? `$${highPrice.toFixed(2)}` : '—'}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-gray-500 font-mono">POOL SPREAD</span>
          <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">
            0.1 pips (Institutional)
          </span>
        </div>
      </div>

      <div className="relative mt-4" id="svg-chart-wrapper">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#d4af37" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0"  />
            </linearGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {yTicks.map((v, i) => (
            <line
              key={i}
              x1={padding.left} y1={gy(v).toFixed(1)}
              x2={svgW - padding.right} y2={gy(v).toFixed(1)}
              stroke="rgba(212,175,55,0.06)" strokeDasharray="4 4"
            />
          ))}

          {yTicks.map((v, i) => (
            <text
              key={i}
              x={padding.left - 6} y={parseFloat(gy(v).toFixed(1)) + 4}
              textAnchor="end" fontSize="9" fill="rgba(156,163,175,0.6)" fontFamily="monospace"
            >
              {v.toFixed(0)}
            </text>
          ))}

          {xTicks.map(({ i, label }) => (
            <text
              key={i}
              x={gx(i).toFixed(1)} y={svgH - 6}
              textAnchor="middle" fontSize="8.5" fill="rgba(156,163,175,0.5)" fontFamily="monospace"
            >
              {label}
            </text>
          ))}

          {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

          {slowPath && (
            <path
              d={slowPath}
              fill="none"
              stroke="#d946ef"
              strokeWidth="1.5"
              strokeDasharray="5 3"
              strokeLinecap="round"
              opacity="0.85"
            />
          )}

          {fastPath && (
            <path
              d={fastPath}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeLinecap="round"
              filter="url(#cyanGlow)"
              opacity="0.9"
            />
          )}

          {pricePath && (
            <path
              d={pricePath}
              fill="none"
              stroke="#d4af37"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#goldGlow)"
            />
          )}

          {hoveredPoint && (() => {
            const idx = visibleData.indexOf(hoveredPoint);
            if (idx < 0) return null;
            return (
              <line
                x1={gx(idx).toFixed(1)} y1={padding.top}
                x2={gx(idx).toFixed(1)} y2={padding.top + plotH}
                stroke="rgba(212,175,55,0.3)" strokeDasharray="4 3"
              />
            );
          })()}

          {visibleData.map((d, i) => {
            const isHovered = hoveredPoint === d;
            return (
              <circle
                key={i}
                cx={gx(i).toFixed(1)}
                cy={gy(d.price).toFixed(1)}
                r={isHovered ? 5.5 : visibleData.length > 60 ? 1.5 : 3}
                fill={isHovered ? '#ffffff' : '#d4af37'}
                stroke="#121318"
                strokeWidth={isHovered ? 2 : 1}
                className="transition-all duration-100 cursor-pointer"
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {currentPrice !== null && prices.length > 0 && (
            <>
              <line
                x1={padding.left} y1={gy(currentPrice).toFixed(1)}
                x2={svgW - padding.right} y2={gy(currentPrice).toFixed(1)}
                stroke="rgba(212,175,55,0.18)" strokeDasharray="2 4"
              />
              <rect
                x={svgW - padding.right + 2} y={parseFloat(gy(currentPrice).toFixed(1)) - 8}
                width={38} height={16} rx={3}
                fill="#d4af37" opacity="0.12"
              />
              <text
                x={svgW - padding.right + 21} y={parseFloat(gy(currentPrice).toFixed(1)) + 4}
                textAnchor="middle" fontSize="8.5" fill="#d4af37" fontFamily="monospace" fontWeight="bold"
              >
                {currentPrice.toFixed(0)}
              </text>
            </>
          )}
        </svg>

        <AnimatePresence>
          {hoveredPoint && (() => {
            const idx = visibleData.indexOf(hoveredPoint);
            const pct = idx >= 0 ? (idx / Math.max(visibleData.length - 1, 1)) * 80 + 10 : 50;
            return (
              <motion.div
                key="tooltip"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-10 rounded-lg border border-amber-500/25 bg-[#171821] p-3 shadow-xl pointer-events-none text-left min-w-[130px]"
                style={{ left: `${pct}%`, bottom: '75%' }}
              >
                <span className="block text-[9px] font-mono font-bold text-gray-500 uppercase">{hoveredPoint.time}</span>
                <span className="block text-sm font-black text-amber-400 font-mono">${hoveredPoint.price.toFixed(2)}</span>
                {hoveredPoint.fastMA !== null && (
                  <span className="block text-[9px] font-mono text-cyan-400 mt-0.5">
                    Fast MA: ${hoveredPoint.fastMA.toFixed(2)}
                  </span>
                )}
                {hoveredPoint.slowMA !== null && (
                  <span className="block text-[9px] font-mono text-fuchsia-400">
                    Slow MA: ${hoveredPoint.slowMA.toFixed(2)}
                  </span>
                )}
                <span className="block text-[8px] text-emerald-400 uppercase tracking-widest font-mono mt-1">Live Pool Bid</span>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {apiStatus === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Activity className="h-6 w-6 text-amber-400 animate-pulse" />
              <span className="text-xs text-gray-500 font-mono">Fetching live gold data...</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500 font-mono">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-emerald-500" />
          <span>Real-time gold-api.com feed · {FAST_PERIOD}/{SLOW_PERIOD}-tick MA overlay</span>
        </span>
        <span>Updated: {lastUpdateTime}</span>
      </div>
    </div>
  );
}
