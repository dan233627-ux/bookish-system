import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, RefreshCw, Layers, DollarSign } from 'lucide-react';

interface ChartPoint {
  time: string;
  price: number;
  volume: number;
}

export default function RoyalChart() {
  const [activeTimeline, setActiveTimeline] = useState<'1H' | '24H' | '1W'>('24H');
  const [currentPrice, setCurrentPrice] = useState(2408.45);
  const [priceChange, setPriceChange] = useState(12.84);
  const [priceChangePercent, setPriceChangePercent] = useState(0.53);
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  // Generate base data for the selected timeline
  const generateData = (timeline: '1H' | '24H' | '1W') => {
    const data: ChartPoint[] = [];
    let startPrice = 2390;
    let pointsCount = 15;

    if (timeline === '1H') {
      pointsCount = 12;
      startPrice = 2404;
    } else if (timeline === '1W') {
      pointsCount = 20;
      startPrice = 2350;
    }

    const now = new Date();
    for (let i = 0; i < pointsCount; i++) {
      const pointTime = new Date(now.getTime() - (pointsCount - i) * (timeline === '1H' ? 5 * 60 * 1000 : timeline === '24H' ? 90 * 60 * 1000 : 8 * 60 * 60 * 1000));
      const randomFactor = Math.sin(i / 2) * 8 + (Math.random() * 6 - 2) + (i * 1.5);
      const price = parseFloat((startPrice + randomFactor).toFixed(2));
      const volume = Math.floor(Math.random() * 50000) + 15000;

      data.push({
        time: pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price,
        volume
      });
    }
    return data;
  };

  useEffect(() => {
    const data = generateData(activeTimeline);
    setChartData(data);
    if (data.length > 0) {
      const last = data[data.length - 1];
      setCurrentPrice(last.price);
      // Calculate overall diff
      const first = data[0];
      const diff = parseFloat((last.price - first.price).toFixed(2));
      const percent = parseFloat(((diff / first.price) * 100).toFixed(2));
      setPriceChange(diff);
      setPriceChangePercent(percent);
    }
  }, [activeTimeline]);

  // Real-time ticking effect to simulate live trading action
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const lastIndex = next.length - 1;
        const tick = (Math.random() * 1.6 - 0.7);
        const newPrice = parseFloat((next[lastIndex].price + tick).toFixed(2));

        next[lastIndex] = {
          ...next[lastIndex],
          price: newPrice
        };

        setCurrentPrice(newPrice);
        
        // Recalculate price change from the first point
        const firstPrice = next[0].price;
        const diff = parseFloat((newPrice - firstPrice).toFixed(2));
        const percent = parseFloat(((diff / firstPrice) * 100).toFixed(2));
        setPriceChange(diff);
        setPriceChangePercent(percent);

        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // SVG Coordinates calculation
  const padding = 40;
  const width = 600;
  const height = 240;

  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.999;
  const maxPrice = Math.max(...prices) * 1.001;
  const priceRange = maxPrice - minPrice;

  const getX = (index: number) => {
    return padding + (index / (chartData.length - 1)) * (width - padding * 2);
  };

  const getY = (price: number) => {
    return height - padding - ((price - minPrice) / priceRange) * (height - padding * 2);
  };

  // Build the SVG path string for line and area fill
  let linePath = '';
  let areaPath = '';

  if (chartData.length > 0) {
    linePath = `M ${getX(0)} ${getY(chartData[0].price)}`;
    areaPath = `M ${getX(0)} ${height - padding} L ${getX(0)} ${getY(chartData[0].price)}`;

    for (let i = 1; i < chartData.length; i++) {
      linePath += ` L ${getX(i)} ${getY(chartData[i].price)}`;
      areaPath += ` L ${getX(i)} ${getY(chartData[i].price)}`;
    }

    areaPath += ` L ${getX(chartData.length - 1)} ${height - padding} Z`;
  }

  return (
    <div id="royal-chart-container" className="rounded-2xl border border-amber-500/10 bg-[#121318]/60 p-6 backdrop-blur-md">
      {/* Chart Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-amber-500/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 border border-amber-500/10">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">XAU/USD (Gold Spot)</h3>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono">POOL ASSET</span>
            </div>
            <p className="text-xs text-gray-400">Trading pool heavy allocation hedging asset</p>
          </div>
        </div>

        {/* Timeline Selectors */}
        <div className="flex items-center gap-1.5 bg-[#17181f] p-1 rounded-lg border border-amber-500/5">
          {(['1H', '24H', '1W'] as const).map(timeline => (
            <button
              id={`btn-timeline-${timeline}`}
              key={timeline}
              onClick={() => setActiveTimeline(timeline)}
              className={`px-3 py-1 text-xs font-bold font-mono rounded-md transition-all cursor-pointer ${
                activeTimeline === timeline
                  ? 'bg-[#d4af37] text-[#0c0d12]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {timeline}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Ticker Metrics */}
      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <span className="block text-[10px] uppercase font-bold text-gray-500 font-mono">SPOT VALUE</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-white font-mono">
              ${currentPrice.toFixed(2)}
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0 mb-1"></span>
          </div>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-gray-500 font-mono">CHG ({activeTimeline})</span>
          <span className={`text-sm font-bold font-mono mt-0.5 block ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent}%)
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-gray-500 font-mono">24H HIGH</span>
          <span className="text-sm font-bold text-gray-300 font-mono mt-0.5 block">
            ${(maxPrice * 0.999).toFixed(2)}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-gray-500 font-mono">POOL SPREAD</span>
          <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">
            0.1 pips (Institutional)
          </span>
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative mt-6" id="svg-chart-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Defs for premium gradients & glows */}
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
            </linearGradient>
            <filter id="goldLineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(212, 175, 55, 0.05)" strokeDasharray="3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(212, 175, 55, 0.05)" strokeDasharray="3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(212, 175, 55, 0.1)" />

          {/* Area under the line */}
          {areaPath && (
            <path d={areaPath} fill="url(#chartGlow)" />
          )}

          {/* Glowing Golden Forex Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#d4af37"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#goldLineGlow)"
            />
          )}

          {/* Hover interactive vertical line guide */}
          {hoveredPoint && (
            <line
              x1={getX(chartData.indexOf(hoveredPoint))}
              y1={padding}
              x2={getX(chartData.indexOf(hoveredPoint))}
              y2={height - padding}
              stroke="rgba(212, 175, 55, 0.3)"
              strokeDasharray="4"
            />
          )}

          {/* Dots on points */}
          {chartData.map((d, i) => {
            const isHovered = hoveredPoint?.time === d.time;
            return (
              <circle
                key={i}
                cx={getX(i)}
                cy={getY(d.price)}
                r={isHovered ? 6 : 3}
                fill={isHovered ? '#ffffff' : '#d4af37'}
                stroke="#121318"
                strokeWidth={isHovered ? 2 : 1}
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>

        {/* Floating Interactive Tooltip */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-10 rounded-lg border border-amber-500/25 bg-[#171821] p-3 shadow-xl pointer-events-none text-left"
              style={{
                left: `${(chartData.indexOf(hoveredPoint) / (chartData.length - 1)) * 80 + 10}%`,
                bottom: '75%'
              }}
            >
              <span className="block text-[9px] font-mono font-bold text-gray-500 uppercase">{hoveredPoint.time}</span>
              <span className="block text-sm font-black text-amber-400 font-mono">${hoveredPoint.price.toFixed(2)}</span>
              <span className="block text-[8px] text-emerald-400 uppercase tracking-widest font-mono mt-0.5">Active Pool Bid</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart Footer Indicator */}
      <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500 font-mono">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-emerald-500" />
          <span>Real-time algorithm performance feed</span>
        </span>
        <span>Latest Update: Just Now</span>
      </div>
    </div>
  );
}
