import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, MessageCircleMore, SendHorizonal, ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface ContactAdminPageProps {
  onBack: () => void;
  username?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  time: string;
  pending?: boolean;
}

const initialMessages: ChatMessage[] = [];

export default function ContactAdminPage({ onBack, username = 'Valued Client' }: ContactAdminPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [topic, setTopic] = useState('Withdrawal support');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const quickTopics = useMemo(() => [
    'Withdrawal support',
    'Deposit verification',
    'Account help',
    'Plan question',
  ], []);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    // Persist message to Supabase (create thread if needed)
    // optimistic UI: add a temporary message immediately so user sees it
    const tempId = `temp-${Date.now()}`;
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const optimistic: ChatMessage = { id: tempId, sender: 'user', text: trimmed, time: timeLabel, pending: true };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');

    (async () => {
      try {
        let tId = threadId;
        if (!tId) {
          const { data: { user } } = await supabase.auth.getUser();
          const userId = user?.id ?? null;

          const { data: threadData, error: threadError } = await supabase
            .from('support_threads')
            .insert({ user_id: userId, username, topic })
            .select()
            .single();

          if (threadError) throw threadError;
          tId = threadData.id;
          setThreadId(tId);
        }

        const { data: inserted, error: msgError } = await supabase
          .from('support_messages')
          .insert({ thread_id: tId, sender: 'user', message: trimmed })
          .select()
          .single();

        if (msgError) throw msgError;

        // replace optimistic message with the DB row
        if (inserted) {
          setMessages((prev) => prev.map((m) => m.id === tempId ? ({ id: inserted.id, sender: inserted.sender === 'admin' ? 'admin' : 'user', text: inserted.message, time: new Date(inserted.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }) : m));

          // notify Telegram via server endpoint (fire-and-forget)
          try {
            const { data: { user } } = await supabase.auth.getUser();
            const notifyBody = {
              username: username || user?.email || user?.id,
              topic,
              message: inserted.message,
              threadId: inserted.thread_id,
              userId: user?.id || null,
            };

            void fetch('/api/notify-support', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(notifyBody),
            }).then(async (r) => {
              try { const j = await r.json(); console.log('[Notify Support] response', j); } catch (e) {}
            }).catch((err) => console.warn('[Notify Support] failed', err));
          } catch (e) {
            console.warn('[Notify Support] auth fetch failed', e);
          }
        }
      } catch (e) {
        console.error('Failed to send message', e);
        // mark optimistic message as not pending (failed)
        setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, pending: false } : m));
      }
    })();
  };

  useEffect(() => {
    let channel: any;
    const load = async () => {
      setLoading(true);
      // reset thread/messages when switching topics so we don't reuse an old thread
      setThreadId(null);
      setMessages([]);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        // try to find an existing thread for this user + topic
        const { data: existingThreads } = await supabase
          .from('support_threads')
          .select('*')
          .eq('user_id', user?.id ?? null)
          .eq('topic', topic)
          .order('created_at', { ascending: false })
          .limit(1);

        let tId: string | null = null;
        if (existingThreads && existingThreads.length > 0) {
          const t = existingThreads[0];
          tId = t.id;
          setThreadId(tId);

          const { data: msgs } = await supabase
            .from('support_messages')
            .select('*')
            .eq('thread_id', t.id)
            .order('created_at', { ascending: true });

          setMessages((msgs || []).map((m: any) => ({ id: m.id, sender: m.sender === 'admin' ? 'admin' : 'user', text: m.message, time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })));
        }

        // create realtime subscription only after we have a thread id
        if (tId) {
          // give the channel a unique name so we don't accidentally reuse an already-subscribed channel
          const channelName = `support_messages_${Math.random().toString(36).slice(2)}`;
          channel = supabase
            .channel(channelName)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, (payload: any) => {
                const newMsg = payload.new;
                if (!newMsg) return;
                if (newMsg.thread_id === tId) {
                  setMessages((prev) => {
                    // avoid duplicates if we already have this DB id
                    if (prev.some((m) => m.id === newMsg.id)) return prev;
                    return [...prev, { id: newMsg.id, sender: newMsg.sender === 'admin' ? 'admin' : 'user', text: newMsg.message, time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
                  });
                }
              })
            .subscribe();
        }
      } catch (e) {
        console.error('Failed to load support thread/messages', e);
      } finally {
        setLoading(false);
      }
    };

    void load();

    return () => {
      try {
        if (channel) {
          channel.unsubscribe();
          // try to remove channel from client to avoid duplicate subscriptions
          try { supabase.removeChannel(channel); } catch (e) {}
        }
      } catch (e) {}
    };
    // we only want to re-run when topic or username changes (not when threadId updates)
  }, [topic, username]);

  return (
    <div className="min-h-screen bg-[#08080a] px-4 py-6 text-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <button
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#d4af37] transition-all hover:bg-amber-500/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <div className="overflow-hidden rounded-[28px] border border-amber-500/15 bg-[#0d0e12]/90 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
          <div className="border-b border-amber-500/10 bg-gradient-to-r from-[#16181f] to-[#101116] px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure support channel
                </div>
                <h1 className="font-display text-2xl font-black uppercase tracking-wide text-white">Customer Support</h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-400">
                  Start a secure message with the Forex Royal admin team. Share your issue, receive guidance, and keep your request tracked in one place.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-500/10 bg-[#121318]/70 px-4 py-3 text-sm text-gray-300">
                <div className="flex items-center gap-2 text-[#d4af37]">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-semibold">Live support available</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Reply times are usually within minutes.</p>
                <a
                  href="https://t.me/SIRLEONARD1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/20 transition-all"
                >
                  Contact on Telegram
                  <ArrowUpRight className="h-3.5 w-3.5 text-amber-200" />
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="border-b border-amber-500/10 bg-[#0f1117] p-4 lg:border-b-0 lg:border-r">
              <div className="mb-4">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-gray-500">Quick topics</p>
              </div>
              <div className="space-y-2">
                {quickTopics.map((item) => (
                  <button
                    key={item}
                    onClick={() => setTopic(item)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                      topic === item
                        ? 'border-amber-400/40 bg-amber-500/10 text-amber-200'
                        : 'border-white/10 bg-[#121318]/60 text-gray-300 hover:border-amber-500/20'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-500/10 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                <p className="font-semibold">Current topic</p>
                <p className="mt-1 text-xs text-emerald-100/90">{topic}</p>
              </div>
            </aside>

            <section className="flex min-h-[480px] flex-col bg-[#0c0d12]">
              <div className="flex items-center justify-between border-b border-amber-500/10 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                    <MessageCircleMore className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Admin support room</p>
                    <p className="text-xs text-gray-500">{username}</p>
                  </div>
                </div>
                {/* Online badge removed as requested */}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.06),_transparent_60%)] p-4 sm:p-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-lg sm:max-w-[75%] ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#071018]'
                          : 'border border-amber-500/10 bg-[#121318] text-gray-200'
                      }`}
                    >
                      <p className="leading-relaxed">{message.text}</p>
                      <p className={`mt-2 text-[10px] ${message.sender === 'user' ? 'text-[#071018]/70' : 'text-gray-500'}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-amber-500/10 bg-[#101116] p-3 sm:p-4">
                <label className="mb-2 block text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-gray-500">
                  Your message
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    placeholder="Describe your issue clearly so the admin can respond faster..."
                    className="min-h-[90px] flex-1 rounded-2xl border border-amber-500/10 bg-[#0c0d12] px-3 py-3 text-sm text-white outline-none transition-all focus:border-amber-400"
                  />
                  <button
                    onClick={handleSend}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-400 px-4 py-3 text-sm font-black uppercase tracking-wider text-[#0a0b0e] transition-all hover:brightness-110"
                  >
                    <SendHorizonal className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
