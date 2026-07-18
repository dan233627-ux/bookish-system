import { useEffect, useMemo, useState, useRef } from 'react';
import { ArrowLeft, MessageCircleMore, Paperclip, SendHorizonal, ShieldCheck } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface AdminMessagesPageProps {
  onBack: () => void;
}

interface SupportThread {
  id: string; // DB uuid
  userId?: string | null;
  user: string;
  topic: string;
  status: string;
  preview: string;
  time: string;
}

interface MessageEntry {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  time: string;
}

const initialThreads: SupportThread[] = [
  {
    id: 1,
    user: 'Alicia',
    topic: 'Withdrawal support',
    status: 'Open',
    preview: 'I need help completing the withdrawal fee payment.',
    time: '09:14',
  },
  {
    id: 2,
    user: 'Marcus',
    topic: 'Deposit verification',
    status: 'Pending',
    preview: 'Please confirm whether my proof screenshot was received.',
    time: '08:40',
  },
];

const threadMessages: Record<number, MessageEntry[]> = {
  1: [
    { id: 1, sender: 'user', text: 'I need help completing the withdrawal fee payment.', time: '09:14' },
    { id: 2, sender: 'admin', text: 'I can help with that. Please confirm the wallet address and the selected crypto method.', time: '09:16' },
  ],
  2: [
    { id: 1, sender: 'user', text: 'Please confirm whether my proof screenshot was received.', time: '08:40' },
    { id: 2, sender: 'admin', text: 'We have received it and are reviewing it now.', time: '08:43' },
  ],
};

export default function AdminMessagesPage({ onBack }: AdminMessagesPageProps) {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const selectedThreadIdRef = useRef<string | null>(selectedThreadId);

  useEffect(() => {
    selectedThreadIdRef.current = selectedThreadId;
  }, [selectedThreadId]);
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const loadThreads = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('support_threads').select('*').order('created_at', { ascending: false });
        setThreads((data || []).map((t: any) => ({ id: t.id, userId: t.user_id, user: t.username || (t.user_id ?? 'user'), topic: t.topic, status: t.status, preview: '', time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })));
        if (data && data.length > 0) {
          const first = data[0];
          setSelectedThreadId(first.id);
          const { data: msgs } = await supabase.from('support_messages').select('*').eq('thread_id', first.id).order('created_at', { ascending: true });
          setMessages((msgs || []).map((m: any) => ({ id: m.id, sender: m.sender === 'admin' ? 'admin' : 'user', text: m.message, time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })));
        }
      } catch (e) {
        console.error('Failed to load threads', e);
      } finally {
        setLoading(false);
      }
    };

    void loadThreads();

    // subscribe to new threads and messages
    const threadChannel = supabase.channel('support_threads').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_threads' }, (payload: any) => {
      const t = payload.new;
      setThreads(prev => [{ id: t.id, userId: t.user_id, user: t.username || t.user_id, topic: t.topic, status: t.status, preview: '', time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
    }).subscribe();

    const msgChannel = supabase.channel('support_messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, (payload: any) => {
      const m = payload.new;
      // only append if it's for the currently selected thread (use ref to get latest)
      if (m.thread_id === selectedThreadIdRef.current) {
        setMessages(prev => {
          if (prev.some(x => x.id === m.id)) return prev;
          return [...prev, { id: m.id, sender: m.sender === 'admin' ? 'admin' : 'user', text: m.message, time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
        });
      }
    }).subscribe();

    return () => {
      try { threadChannel.unsubscribe(); msgChannel.unsubscribe(); } catch (e) {}
    };
  }, []);

  const selectedThread = useMemo(() => threads.find((thread) => thread.id === selectedThreadId) || threads[0], [threads, selectedThreadId]);

  const handleReply = () => {
    const trimmed = reply.trim();
    if (!trimmed) return;
    // optimistic admin reply immediately
    const tempId = `admin-temp-${Date.now()}`;
    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const optimistic: MessageEntry = { id: tempId, sender: 'admin', text: trimmed, time: nowLabel };
    setMessages((prev) => [...prev, optimistic]);
    setReply('');

    (async () => {
      try {
        if (!selectedThreadId) {
          console.warn('No thread selected to reply to');
          return;
        }

        const { data: inserted, error } = await supabase.from('support_messages').insert({ thread_id: selectedThreadId, sender: 'admin', message: trimmed }).select().single();
        if (error) throw error;

        if (inserted) {
          // replace optimistic message with DB row
          setMessages((prev) => prev.map((m) => m.id === tempId ? ({ id: inserted.id, sender: inserted.sender === 'admin' ? 'admin' : 'user', text: inserted.message, time: new Date(inserted.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }) : m));
        }
      } catch (e) {
        console.error('Failed to send admin reply', e);
        // leave optimistic message but could mark as failed later
      }
    })();
  };

  const handleViewProfile = async () => {
    if (!selectedThread) return;
    setShowProfile(true);
    // try to fetch profile row if there's a profiles table
    try {
      if (selectedThread.userId) {
        const [{ data: profileDataRes }, { data: investmentsRes }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', selectedThread.userId).maybeSingle(),
          supabase.from('investments').select('*').eq('user_id', selectedThread.userId).order('start_date', { ascending: false })
        ]);

        const profileRow = profileDataRes?.data || null;
        const investments = investmentsRes || [];
        setProfileData({ ...(profileRow || { id: selectedThread.userId, username: selectedThread.user }), investments });
      } else {
        setProfileData({ id: null, username: selectedThread.user, investments: [] });
      }
    } catch (e) {
      setProfileData({ id: selectedThread.userId || null, username: selectedThread.user, investments: [] });
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] px-4 py-6 text-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <button
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#d4af37] transition-all hover:bg-amber-500/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to admin portal
        </button>

        <div className="overflow-hidden rounded-[28px] border border-amber-500/15 bg-[#0d0e12]/90 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
          <div className="border-b border-amber-500/10 bg-gradient-to-r from-[#16181f] to-[#101116] px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#d4af37]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin messaging hub
                </div>
                <h1 className="font-display text-2xl font-black uppercase tracking-wide text-white">Support Messages</h1>
                <p className="mt-2 text-sm text-gray-400">Review client messages, respond professionally, and keep every conversation organized.</p>
              </div>
              <div className="rounded-2xl border border-amber-500/10 bg-[#121318]/70 px-4 py-3 text-sm text-gray-300">
                <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-gray-500">Active threads</span>
                <span className="text-xl font-black text-[#d4af37]">{threads.length}</span>
              </div>
            </div>
          </div>

          <div className="grid min-h-[620px] gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="border-b border-amber-500/10 bg-[#0f1117] p-4 xl:border-b-0 xl:border-r">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-gray-500">Inbox</p>
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-300">{threads.length} active</span>
              </div>
              <div className="space-y-2">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition-all ${
                      selectedThreadId === thread.id
                        ? 'border-amber-400/40 bg-amber-500/10'
                        : 'border-white/10 bg-[#121318]/60 hover:border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{thread.user}</p>
                      <span className="text-[10px] text-gray-500">{thread.time}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#d4af37]">{thread.topic}</p>
                    <p className="mt-1 truncate text-xs text-gray-400">{thread.preview}</p>
                    <div className="mt-2 inline-flex rounded-full border border-amber-500/10 bg-[#0b0c10] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                      {thread.status}
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <section className="flex flex-col bg-[#0c0d12]">
              <div className="flex items-center justify-between border-b border-amber-500/10 px-4 py-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                    <MessageCircleMore className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedThread?.user || 'Support thread'}</p>
                    <p className="text-xs text-gray-500">{selectedThread?.topic || 'Client conversation'}</p>
                  </div>
                </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleViewProfile} className="rounded-2xl border border-white/10 bg-[#121318] px-3 py-1 text-xs text-gray-300 hover:bg-[#171821]">View profile</button>
                    <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-300">
                      {selectedThread?.status || 'Open'}
                    </div>
                  </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.06),_transparent_60%)] p-4 sm:p-5">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-lg sm:max-w-[75%] ${message.sender === 'admin'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#071018]'
                      : 'border border-amber-500/10 bg-[#121318] text-gray-200'}`}>
                      <p className="leading-relaxed">{message.text}</p>
                      <p className={`mt-2 text-[10px] ${message.sender === 'admin' ? 'text-[#071018]/70' : 'text-gray-500'}`}>{message.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {showProfile && profileData && (
                <div className="absolute right-6 top-24 w-80 rounded-2xl border border-amber-500/10 bg-[#0c0d12] p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">User profile</h3>
                    <button onClick={() => setShowProfile(false)} className="text-sm text-gray-400">Close</button>
                  </div>
                  <div className="mt-3 text-sm text-gray-300">
                    <p className="font-semibold">Username</p>
                    <p className="truncate">{profileData.username || profileData.email || '—'}</p>
                    <p className="mt-2 font-semibold">User ID</p>
                    <p className="truncate text-xs text-gray-400">{profileData.id}</p>

                    <div className="mt-3">
                      <p className="font-semibold">Investments</p>
                      {profileData.investments && profileData.investments.length > 0 ? (
                        <ul className="mt-2 space-y-2 text-xs">
                          {profileData.investments.slice(0,5).map((inv: any) => (
                            <li key={inv.id} className="rounded-md border border-white/5 px-2 py-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{inv.plan_label || inv.category || 'Investment'}</span>
                                <span className="text-gray-400">{inv.status}</span>
                              </div>
                              <div className="mt-1 text-gray-300">£{Number(inv.capital || 0).toLocaleString()} → £{Number(inv.roi || 0).toLocaleString()}</div>
                            </li>
                          ))}
                          {profileData.investments.length > 5 && (
                            <li className="text-xs text-gray-400">+{profileData.investments.length - 5} more</li>
                          )}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-gray-400">No investments found for this user.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-amber-500/10 bg-[#101116] p-3 sm:p-4">
                <label className="mb-2 block text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-gray-500">Reply</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    placeholder="Write a professional response to the client..."
                    className="min-h-[90px] flex-1 rounded-2xl border border-amber-500/10 bg-[#0c0d12] px-3 py-3 text-sm text-white outline-none transition-all focus:border-amber-400"
                  />
                  <div className="flex flex-col gap-2 sm:w-[140px]">
                    <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-500/15 bg-[#121318] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
                      <Paperclip className="h-4 w-4" />
                      Attach
                    </button>
                    <button
                      onClick={handleReply}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-400 px-3 py-2 text-sm font-black uppercase tracking-wider text-[#0a0b0e] transition-all hover:brightness-110"
                    >
                      <SendHorizonal className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
