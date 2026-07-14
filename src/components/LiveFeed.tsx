import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';
import { INITIAL_TRANSACTIONS } from '../data';
import { Activity, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';

export default function LiveFeed() {
  const [feed, setFeed] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Periodic injection of mock trades to show lively community action
  useEffect(() => {
    const usernames = [
      'Sterling_Scalp', 'Prince_FX', 'Lady_Mercia', 'GoldenBull', 'Duchess_Trade', 
      'Baron_Of_Forex', 'Vanguard_Cap', 'AlphaRoyal', 'Apex_Pool', 'QueenGold_7'
    ];
    const plans = [
      { label: '24 Hours Pool', range: [500, 800] },
      { label: '2 Days Pool', range: [900, 1500] },
      { label: '7 Days Weekly Pool', range: [2000, 10000] }
    ];

    const interval = setInterval(() => {
      const type = Math.random() > 0.45 ? 'deposit' : 'payout';
      const user = usernames[Math.floor(Math.random() * usernames.length)];
      const randomPlan = plans[Math.floor(Math.random() * plans.length)];
      const amount = Math.floor(Math.random() * (randomPlan.range[1] - randomPlan.range[0])) + randomPlan.range[0];

      const newTx: Transaction = {
        id: `tx-live-${Date.now()}`,
        username: user,
        type,
        amount: type === 'deposit' ? amount : Math.floor(amount * 8.5), // Payouts are massive multipliers based on plans!
        planLabel: randomPlan.label,
        timestamp: 'Just now',
        status: 'completed'
      };

      setFeed(prev => [newTx, ...prev.slice(0, 9)]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="live-feed-section" className="rounded-2xl border border-amber-500/10 bg-[#121318]/60 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-amber-500/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 border border-amber-500/10">
            <Activity className="h-5 w-5 animate-pulse text-amber-400" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">LIVE ROYAL ACTIVITY</h3>
            <p className="text-xs text-gray-400">Verifiable pool ledger & processed dividends</p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-400 font-mono">
          <Check className="h-3 w-3" />
          Sync Live
        </span>
      </div>

      {/* Transaction list layout */}
      <div className="mt-5 space-y-3 overflow-y-auto max-h-[380px] pr-1" id="live-transactions-list">
        <AnimatePresence initial={false}>
          {feed.map((tx) => {
            const isDeposit = tx.type === 'deposit';
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -15, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 15, height: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center justify-between rounded-xl border border-amber-500/5 bg-[#17181f]/80 p-3.5 hover:border-amber-500/15 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${
                    isDeposit 
                      ? 'bg-amber-500/10 text-amber-400' 
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {isDeposit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">{tx.username}</span>
                      <span className={`text-[9px] uppercase font-bold px-1.5 rounded font-mono ${
                        isDeposit 
                          ? 'bg-amber-500/5 text-[#d4af37]' 
                          : 'bg-emerald-500/5 text-emerald-400'
                      }`}>
                        {isDeposit ? 'Deposit' : 'ROI Payout'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">{tx.planLabel} • {tx.timestamp}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-mono text-sm font-black block ${
                    isDeposit ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    £{tx.amount.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] text-gray-500 font-mono">
                    <Check className="h-2.5 w-2.5 text-emerald-500" />
                    Confirmed
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
