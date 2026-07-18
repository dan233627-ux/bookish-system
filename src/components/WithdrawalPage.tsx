import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';
import { ActiveInvestment } from '../types';

interface WithdrawalPageProps {
  investment: ActiveInvestment;
  defaultFeeCurrency?: 'TRX' | 'USDT' | 'BTC' | 'ETH';
  defaultPayoutWalletAddress?: string;
  onBack: () => void;
  onSubmit: (id: string, feeCurrency: 'TRX' | 'USDT' | 'BTC' | 'ETH', payoutWalletAddress: string) => void;
}

export default function WithdrawalPage({ investment, defaultFeeCurrency = 'TRX', defaultPayoutWalletAddress = '', onBack, onSubmit }: WithdrawalPageProps) {
  const [feeCurrency, setFeeCurrency] = useState<'TRX' | 'USDT' | 'BTC' | 'ETH'>(defaultFeeCurrency);
  const [payoutWalletAddress, setPayoutWalletAddress] = useState(defaultPayoutWalletAddress);

  useEffect(() => {
    setFeeCurrency(defaultFeeCurrency);
    setPayoutWalletAddress(defaultPayoutWalletAddress);
  }, [defaultFeeCurrency, defaultPayoutWalletAddress]);

  return (
    <div className="min-h-screen bg-[#08080a] px-4 py-6 text-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-amber-200 hover:bg-amber-500/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <div className="overflow-hidden rounded-[28px] border border-amber-500/15 bg-[#0f1117]/90 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
          <div className="border-b border-amber-500/10 bg-gradient-to-r from-[#16181f] to-[#101116] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-emerald-300">Withdrawal details</p>
                <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-white">Finalize your withdrawal</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
                  Enter the payout wallet address and choose the crypto currency for your withdrawal. The fee payment instructions will appear on the next page.
                </p>
              </div>
              <div className="grid gap-2 sm:text-right">
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Contract</span>
                <p className="text-sm font-semibold uppercase text-amber-300">{investment.planLabel} Pool</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="rounded-3xl border border-amber-500/10 bg-[#121318] p-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Select payment currency</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(['TRX', 'USDT', 'BTC', 'ETH'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFeeCurrency(method)}
                    className={`rounded-2xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.25em] transition-all ${
                      feeCurrency === method
                        ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                        : 'border-white/10 bg-[#0c0d12] text-gray-300 hover:border-emerald-500/20'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-500/10 bg-[#121318] p-5 space-y-4">
              <div className="flex items-center gap-3 text-sm font-semibold text-white">
                <CreditCard className="h-5 w-5 text-emerald-300" />
                Payout wallet address
              </div>
              <input
                value={payoutWalletAddress}
                onChange={(e) => setPayoutWalletAddress(e.target.value)}
                placeholder="Paste your wallet address"
                className="w-full rounded-2xl border border-amber-500/10 bg-[#0c0d12] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
              />
              <p className="text-xs text-gray-400">This is where your payout will be released after fee payment is confirmed.</p>
            </div>

            <div className="rounded-3xl border border-amber-500/10 bg-[#121318] p-5 text-sm text-gray-300">
              <p className="leading-relaxed">
                Review your selected crypto and payout wallet address. The fee payment instructions will appear on the next page.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-500/10 bg-[#0c0d12] px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-gray-300 hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={() => onSubmit(investment.id, feeCurrency, payoutWalletAddress)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#0b0c10] hover:brightness-110"
              >
                Continue to payment
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
