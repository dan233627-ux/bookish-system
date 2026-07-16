import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface AdminApprovalPageProps {
  onBack: () => void;
}

interface PendingInvestmentRecord {
  id: string;
  user_id: string;
  username?: string | null;
  plan_label: string;
  category: string;
  capital: number;
  roi: number;
  payment_method?: string | null;
  screenshot_url?: string | null;
  status: string;
  start_date?: string;
}

export default function AdminApprovalPage({ onBack }: AdminApprovalPageProps) {
  const [pendingInvestments, setPendingInvestments] = useState<PendingInvestmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadPendingInvestments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('status', 'pending')
        .order('start_date', { ascending: false });

      if (error) throw error;

      setPendingInvestments((data as PendingInvestmentRecord[]) || []);
    } catch (err) {
      console.error('Failed to load pending approvals', err);
      setPendingInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPendingInvestments();
  }, []);

  const updateStatus = async (id: string, nextStatus: 'active' | 'declined') => {
    setProcessingId(id);
    setNotice(null);

    try {
      const { error } = await supabase
        .from('investments')
        .update({ status: nextStatus })
        .eq('id', id);

      if (error) throw error;

      setPendingInvestments(prev => prev.filter(item => item.id !== id));
      setNotice(nextStatus === 'active' ? 'Transaction verified and moved to active.' : 'Transaction declined and removed from the queue.');
    } catch (err) {
      console.error('Failed to update approval', err);
      setNotice('The update failed. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-gray-100">
      <div className="mx-auto flex max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#d4af37] transition-all hover:bg-amber-500/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <div className="rounded-3xl border border-amber-500/15 bg-[#0c0d12]/80 p-6 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
          <div className="mb-6 flex flex-col gap-3 border-b border-amber-500/10 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#d4af37]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin approval queue
              </div>
              <h1 className="font-display text-2xl font-black uppercase tracking-wide text-white">
                VERIFY OR DECLINE PENDING DEPOSITS
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Review each pending transaction, verify the payment, or decline it if the evidence is not valid.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/10 bg-[#121318]/70 px-4 py-3 text-sm text-gray-300">
              <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-gray-500">
                Pending count
              </span>
              <span className="text-xl font-black text-[#d4af37]">{pendingInvestments.length}</span>
            </div>
          </div>

          {notice && (
            <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {notice}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/20 bg-[#121318]/50">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#d4af37]" />
              <p className="text-sm text-gray-400">Loading pending approvals...</p>
            </div>
          ) : pendingInvestments.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/20 bg-[#121318]/50 px-6 text-center">
              <CheckCircle2 className="mb-3 h-8 w-8 text-emerald-400" />
              <h2 className="text-lg font-bold uppercase tracking-wide text-white">No pending approvals</h2>
              <p className="mt-2 max-w-md text-sm text-gray-400">
                New deposits will appear here automatically when users submit a pending verification request.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {pendingInvestments.map(item => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-[#121318]/70 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#d4af37]">
                        {item.plan_label}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-white">{item.category?.toUpperCase() || 'INVESTMENT'}</h3>
                    </div>
                    <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
                      Pending
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-[#0c0d12]/70 p-3">
                      <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-gray-500">Amount</span>
                      <span className="mt-1 block font-black text-white">£{Number(item.capital || 0).toLocaleString()}</span>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#0c0d12]/70 p-3">
                      <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-gray-500">ROI</span>
                      <span className="mt-1 block font-black text-white">£{Number(item.roi || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-white/10 bg-[#0c0d12]/70 p-3 text-sm text-gray-300">
                    <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-gray-500">User</span>
                    <span className="mt-1 block truncate font-semibold text-white">{item.username?.trim() || item.user_id}</span>
                  </div>

                  {item.payment_method && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-[#0c0d12]/70 p-3 text-sm text-gray-300">
                      <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-gray-500">Method</span>
                      <span className="mt-1 block font-semibold text-white">{item.payment_method}</span>
                    </div>
                  )}

                  {item.screenshot_url ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-[#0c0d12]/70 p-3">
                      <span className="mb-2 block text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-gray-500">Proof image</span>
                      <img
                        src={item.screenshot_url}
                        alt="Payment proof"
                        className="max-h-60 w-full rounded-lg object-contain bg-black/20"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-[#0c0d12]/70 p-3 text-sm text-gray-500">
                      No screenshot attached.
                    </div>
                  )}

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => void updateStatus(item.id, 'active')}
                      disabled={processingId === item.id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-bold uppercase tracking-wider text-emerald-300 transition-all hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {processingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Verify
                    </button>
                    <button
                      onClick={() => void updateStatus(item.id, 'declined')}
                      disabled={processingId === item.id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-bold uppercase tracking-wider text-red-300 transition-all hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {processingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
