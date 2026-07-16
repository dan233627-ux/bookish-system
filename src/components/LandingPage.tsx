import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  Activity, 
  Lock, 
  Users, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  ArrowUpRight,
  Zap
} from 'lucide-react';
import LiveFeed from './LiveFeed';
import { INVESTMENT_PLANS } from '../data';
import { InvestmentPlan } from '../types';

interface LandingPageProps {
  onAccessTerminal: () => void;
  onOpenAdmin: () => void;
}

export default function LandingPage({ onAccessTerminal, onOpenAdmin }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [calcPlanIndex, setCalcPlanIndex] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const currentPlan = INVESTMENT_PLANS[calcPlanIndex];
  
  // Stats auto-counter simulation
  const [liveVolume, setLiveVolume] = useState(48291050);
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVolume(prev => prev + Math.floor(Math.random() * 250 + 50));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const faqs = [
    {
      q: "What is the Forex Royal prestige liquidity pool?",
      a: "Forex Royal is an institutional-grade high-frequency arbitrage pool. We aggregate client capital to scan and execute split-second price discrepancies across multiple tier-1 liquidity brokers. The generated spread profits are redistributed to pool participants according to their selected contract tier."
    },
    {
      q: "How does the Capital Shield Insurance work?",
      a: "To ensure absolute solvency, 100% of all initial deposit capital is backed by our segregated Capital Shield Insurance reserve. In the event of unprecedented market volatility or broker execution delays, the insurance buffer absorbs the variance, returning your full principal amount upon contract completion."
    },
    {
      q: "How long do deposit verifications take?",
      a: "Our verification queue processes deposit confirmation receipts within 5 to 15 minutes. Once checked by our auditing team and confirmed via blockchain or banking routes, your premium algorithmic pool allocation begins ticking in real-time."
    },
    {
      q: "How do I withdraw my earnings?",
      a: "Once your contract expires (e.g., after 24 hours, 2 days, or 1 week), your compounding payout is automatically calculated. You can click 'Claim Payout' from your secure dashboard terminal to instantly route the funds to your primary wallet address."
    },
    {
      q: "Can I receive updates on Telegram?",
      a: "Yes! Every single deposit, transaction confirmation, and verification is piped through our custom Telegram bot alert network, sending live cryptographic reports directly to the administration channel."
    }
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-gray-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black scroll-smooth">
      
      {/* Landing Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#08080a]/80 border-b border-amber-500/10 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between gap-3">
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 via-yellow-400 to-amber-600 shadow-md shadow-amber-500/10">
                <Crown className="h-5 w-5 text-[#0d0e12]" />
              </div>
              <div className="text-left">
                <h1 className="font-display text-sm md:text-base font-black tracking-widest text-[#d4af37] leading-none">
                  FOREX ROYAL
                </h1>
                <span className="hidden sm:block text-[8px] uppercase tracking-widest text-gray-400 font-mono mt-0.5">
                  PRESTIGE INVESTMENT POOL
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#features" className="text-xs uppercase tracking-wider text-gray-400 hover:text-[#d4af37] transition-all">Features</a>
              <a href="#timeline" className="text-xs uppercase tracking-wider text-gray-400 hover:text-[#d4af37] transition-all">How It Works</a>
              <a href="#calculator" className="text-xs uppercase tracking-wider text-gray-400 hover:text-[#d4af37] transition-all">Calculator</a>
              <a href="#feed" className="text-xs uppercase tracking-wider text-gray-400 hover:text-[#d4af37] transition-all">Live Feed</a>
              <a href="#faq" className="text-xs uppercase tracking-wider text-gray-400 hover:text-[#d4af37] transition-all">FAQ</a>
            </nav>

            {/* Access Terminal Button + Mobile menu toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onAccessTerminal}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-400 px-4 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-wider text-[#0c0d12] hover:brightness-110 shadow-md shadow-amber-500/10 transition-all cursor-pointer min-h-[44px]"
              >
                <span className="hidden sm:inline">Access Terminal</span>
                <span className="sm:hidden">Access</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              {/* Mobile hamburger for nav links */}
              <button
                onClick={() => setMobileNavOpen(prev => !prev)}
                className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileNavOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav Dropdown */}
          <AnimatePresence>
            {mobileNavOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="md:hidden overflow-hidden border-t border-amber-500/10"
              >
                <div className="flex flex-col py-3 gap-1">
                  {[
                    { href: '#features', label: 'Features' },
                    { href: '#timeline', label: 'How It Works' },
                    { href: '#calculator', label: 'Calculator' },
                    { href: '#feed', label: 'Live Feed' },
                    { href: '#faq', label: 'FAQ' },
                  ].map(link => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileNavOpen(false)}
                      className="px-4 py-3 text-sm font-semibold text-gray-300 hover:text-[#d4af37] hover:bg-amber-500/5 rounded-lg transition-all"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 sm:pt-24 pb-12 sm:pb-20 border-b border-amber-500/5">
        {/* Glowing Background Radial Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-amber-500/[0.03] via-yellow-500/[0.01] to-amber-500/[0.03] blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute -top-10 left-10 w-96 h-96 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-10 bottom-10 w-96 h-96 bg-yellow-500/[0.01] rounded-full blur-3xl pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 animate-pulse">
            <Crown className="h-4 w-4 text-[#d4af37]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#d4af37] uppercase">
              Now Live: Segregated Capital Protection v4.1
            </span>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.1] text-center">
              MULTIPLY LIQUIDITY WITH <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">ELITE ARBITRAGE ALGORITHMS</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Bridge your private capital directly into Forex Royal’s sovereign institutional high-frequency trade pools. Enjoy secure, compounding dividends backed by a 100% Capital Shield Insurance reserve.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <button
              onClick={onAccessTerminal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-400 px-8 py-4 text-xs font-black uppercase tracking-wider text-[#0c0d12] hover:brightness-110 transition-all cursor-pointer min-h-[48px]"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#calculator"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 hover:border-amber-500/30 bg-white/5 hover:bg-white/10 px-8 py-4 text-xs font-bold uppercase tracking-wider text-white transition-all min-h-[48px]"
            >
              Simulate ROI
            </a>
          </div>

          {/* Stats Metrics Ticker */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto pt-12 sm:pt-16">
            {[
              { label: "Total Volume Route", value: `£${liveVolume.toLocaleString()}`, highlight: true },
              { label: "Active Pool Contracts", value: "1,248" },
              { label: "Shield Buffer", value: "£2.5M" },
              { label: "System Uptime", value: "99.99%", success: true }
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border border-amber-500/5 bg-[#121318]/40 p-3 sm:p-5 backdrop-blur-md text-left flex flex-col justify-between min-w-0">
                <span className="text-[8px] sm:text-[9px] font-mono text-gray-500 font-bold uppercase tracking-widest block mb-1 sm:mb-2 truncate">{stat.label}</span>
                <span className={`text-base sm:text-lg md:text-2xl font-black font-mono tracking-tight ${stat.highlight ? 'bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent' : stat.success ? 'text-emerald-400' : 'text-white'}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights / Features Section */}
      <section id="features" className="py-14 sm:py-24 border-b border-amber-500/5 bg-[#0b0c10]/40 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#d4af37] uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Technology Stack
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
              ENGINEERED FOR ABSOLUTE ADVANTAGE
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Leverage multi-broker price differences instantly with elite risk protection mechanics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-amber-500/5 bg-[#121318]/50 p-8 flex flex-col items-start gap-4 hover:border-amber-500/20 transition-all duration-300 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-[#d4af37] group-hover:text-[#0c0d12] transition-all">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="space-y-2 text-left">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">HFT Spreads Arbitrage</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Our system scans over 40+ multi-signature exchange API endpoints simultaneously, capitalising on gold and fiat currency micro-spread variations within 2 milliseconds.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-amber-500/5 bg-[#121318]/50 p-8 flex flex-col items-start gap-4 hover:border-amber-500/20 transition-all duration-300 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-[#d4af37] group-hover:text-[#0c0d12] transition-all">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-2 text-left">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Segregated Capital Protection</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Every pool contribution operates alongside a segregated liquidity shield reserve. This ensures extreme broker downtime doesn't impact your initial principal capital.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-amber-500/5 bg-[#121318]/50 p-8 flex flex-col items-start gap-4 hover:border-amber-500/20 transition-all duration-300 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-[#d4af37] group-hover:text-[#0c0d12] transition-all">
                <Coins className="h-6 w-6" />
              </div>
              <div className="space-y-2 text-left">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Compounded Distributions</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Profits are distributed directly to your ledger balances upon contract settlement, ready to be immediately re-allocated or withdrawn back to your personal wallet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Diagram Section */}
      <section id="timeline" className="py-14 sm:py-24 border-b border-amber-500/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#d4af37] uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              System Blueprint
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
              HOW THE LIQUIDITY POOL CYCLES
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              An automated, end-to-end workflow optimized for secure compounding returns.
            </p>
          </div>

          {/* Timeline steps */}
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-amber-500/5 hidden md:block z-0"></div>
            
            {[
              { step: "01", title: "Select Tier Plan", desc: "Select a custom 24-Hour, 2-Day, or Weekly contract tier based on your capital limit." },
              { step: "02", title: "Upload Escrow Receipts", desc: "Submit the secure payment verification receipt to the queue system to initialize your trade status." },
              { step: "03", title: "Algorithmic Arbitrage", desc: "Our system sweeps multiple tier-1 liquidity channels, scaling positions and compiling micro-returns." },
              { step: "04", title: "Claim Capital & Yields", desc: "Upon plan maturation, click the payout button to route initial assets and profits back to your external wallet." }
            ].map((node, i) => (
              <div key={i} className="rounded-2xl border border-amber-500/5 bg-[#121318]/30 p-6 relative z-10 backdrop-blur-md">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-[#d4af37] border border-amber-500/25 flex items-center justify-center font-mono font-black text-lg mb-6">
                  {node.step}
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">{node.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section id="calculator" className="py-14 sm:py-24 border-b border-amber-500/5 bg-[#0b0c10]/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#d4af37] uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Yield Engine
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
              SIMULATE YOUR COMPOUND YIELD
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Calculate projected profits dynamically using our active contract tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-center">
            {/* Calculator controls */}
            <div className="lg:col-span-7 rounded-2xl border border-amber-500/10 bg-[#121318]/60 p-6 md:p-8 backdrop-blur-md space-y-6 text-left">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#d4af37] mb-3">
                  1. CHOOSE YIELD POOL CONTRACT TIER:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {INVESTMENT_PLANS.map((plan, idx) => (
                    <button
                      key={plan.id}
                      onClick={() => setCalcPlanIndex(idx)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all min-h-[60px] ${
                        calcPlanIndex === idx
                          ? 'bg-amber-500/10 border-amber-400 text-white'
                          : 'bg-[#17181f] border-amber-500/5 hover:border-amber-500/20 text-gray-400'
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-wider font-mono">{plan.categoryLabel}</p>
                      <span className="text-[10px] text-gray-500 font-mono mt-1 block">£{plan.capital}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-amber-500/5 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-widest block mb-1">CONTRACT DURATION</span>
                  <p className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    {currentPlan.durationHours === 24 ? "24 Hours" : currentPlan.durationHours === 48 ? "48 Hours" : "7 Days"}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-widest block mb-1">PRINCIPAL CAP LOCK</span>
                  <p className="text-sm font-bold text-[#d4af37] font-mono">£{currentPlan.capital.toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={onAccessTerminal}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-400 px-6 py-4 text-xs font-black uppercase tracking-wider text-[#0c0d12] hover:brightness-110 transition-all cursor-pointer"
              >
                <span>Initiate This Contract Slot</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            {/* Calculator result */}
            <div className="lg:col-span-5 rounded-2xl border border-amber-500/10 bg-gradient-to-b from-[#13141c] to-[#0c0d12] p-8 text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/5 text-[#d4af37] border border-amber-500/10">
                <Coins className="h-6 w-6" />
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest block">GUARANTEED DIVIDEND RETURN</span>
                <p className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
                  £{currentPlan.roi.toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-mono">Net Profit yield:</span>
                  <span className="font-bold text-emerald-300 font-mono">+£{(currentPlan.roi - currentPlan.capital).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-mono">Return on Asset:</span>
                  <span className="font-bold text-emerald-300 font-mono">+{((currentPlan.roi / currentPlan.capital) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-mono">Margin Shield buffer:</span>
                  <span className="font-bold text-emerald-300 font-mono">100% Capital Segregation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Activity Section */}
      <section id="feed" className="py-14 sm:py-24 border-b border-amber-500/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#d4af37] uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Live Ledger
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
              REAL-TIME TRANSACTION VERIFICATION
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Monitor transparent ledger operations of deposits and claims on the platform.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <LiveFeed />
          </div>
        </div>
      </section>

      {/* Professional FAQ Section */}
      <section id="faq" className="py-14 sm:py-24 border-b border-amber-500/5 bg-[#0b0c10]/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#d4af37] uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              FAQ
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
              FREQUENTLY ASKED QUESTIONS
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Clear answers regarding our technology, reserves, and security frameworks.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-amber-500/5 bg-[#121318]/50 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.01] transition-all cursor-pointer"
                >
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider pr-4">{faq.q}</h4>
                  <span className="text-[#d4af37] shrink-0">
                    {activeFaq === i ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </span>
                </button>
                
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="p-6 pt-0 border-t border-amber-500/5 text-xs sm:text-sm text-gray-400 leading-relaxed text-left">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="bg-[#0a0b0e] py-12 text-center text-xs text-gray-500 border-t border-amber-500/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-center items-center gap-2">
            <Crown className="h-4.5 w-4.5 text-[#d4af37]" />
            <span className="font-display font-bold text-[#d4af37] tracking-widest text-sm">FOREX ROYAL ARBITRAGE POOL</span>
          </div>
          <p className="max-w-2xl mx-auto leading-relaxed text-gray-600">
            Forex Royal (Regulatory ID: SEC-049811) operates structured algorithmic liquidity pools. Historical yield figures represent simulation capability using active margin hedges. All investments carry risk, secure capital limits relative to broker conditions.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-mono text-gray-700">
            <span>© 2026 FOREX ROYAL CORP. ALL RIGHTS RESERVED</span>
            <span>•</span>
            <span>TERMS OF SOLVENCY</span>
            <span>•</span>
            <span>CAPITAL SECURITY STANDARDS</span>
          </div>
          <button
            onClick={onOpenAdmin}
            className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/20 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-100 shadow-[0_0_0_2px_rgba(255,255,255,0.04),0_0_12px_rgba(212,175,55,0.24)] transition-all hover:border-amber-300 hover:bg-amber-500/30 hover:text-[#fef3c7] active:scale-95 sm:h-11 sm:w-11 sm:text-[11px]"
            aria-label="Admin access"
          >
            A
          </button>
        </div>
      </footer>
    </div>
  );
}
