import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { InvestmentPlan } from '../types';

interface PurchaseConfirmationProps {
  plan: InvestmentPlan;
  paymentMethod: string;
  username: string;
  onReturnToDashboard: () => void;
}

export default function PurchaseConfirmation({
  plan,
  paymentMethod,
  username,
  onReturnToDashboard,
}: PurchaseConfirmationProps) {
  return (
    <div className="min-h-screen bg-[#090a0e] text-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl rounded-3xl border border-amber-500/10 bg-[#101216]/95 p-8 shadow-2xl shadow-amber-500/10">
        <div className="flex items-center gap-3 text-amber-300 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-300">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-400 font-semibold">Purchase Confirmed</p>
            <h1 className="mt-2 text-3xl font-black text-white">Your package payment is verified</h1>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#0d0f16] p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[11px] uppercase text-gray-400 tracking-[0.28em]">Royal Username</p>
              <p className="text-base font-semibold text-white">{username}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] uppercase text-gray-400 tracking-[0.28em]">Selected Plan</p>
              <p className="text-base font-semibold text-white">{plan.categoryLabel}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#121622] p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Capital</p>
              <p className="mt-2 text-lg font-bold text-amber-300">£{plan.capital.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-[#121622] p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Projected ROI</p>
              <p className="mt-2 text-lg font-bold text-emerald-300">£{plan.roi.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-[#121622] p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Payment Method</p>
              <p className="mt-2 text-lg font-bold text-white">{paymentMethod}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-500/10 bg-[#141a24] p-5 text-sm leading-7 text-gray-300">
            <p className="font-semibold text-white">What happens next?</p>
            <p className="mt-2">
              Your payment confirmation has been received and logged successfully. Our verification team will review the transaction and contact you shortly with the activation details.
            </p>
            <p className="mt-2 text-amber-300 font-semibold">
              This purchase is verified and will be processed immediately.
            </p>
          </div>

          <button
            onClick={onReturnToDashboard}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[#0b0d10] transition hover:brightness-105"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
