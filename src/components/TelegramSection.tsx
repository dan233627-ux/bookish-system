import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CommunityComment } from '../types';
import { INITIAL_COMMENTS } from '../data';
import { Send, MessageSquare, Heart, Award, Bell } from 'lucide-react';

export default function TelegramSection() {
  const [comments, setComments] = useState<CommunityComment[]>(INITIAL_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedRank, setSelectedRank] = useState<'Bronze' | 'Silver' | 'Gold' | 'VIP' | 'Royal Elite'>('Gold');

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommunityComment = {
      id: `comment-custom-${Date.now()}`,
      username: 'Royal_Member_' + Math.floor(Math.random() * 900 + 100),
      rank: selectedRank,
      avatarSeed: 'custom_' + Math.floor(Math.random() * 10),
      content: newCommentText,
      timestamp: 'Just now',
      likes: 0,
      hasLiked: false
    };

    setComments(prev => [newComment, ...prev]);
    setNewCommentText('');
  };

  const handleLike = (id: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          likes: c.hasLiked ? c.likes - 1 : c.likes + 1,
          hasLiked: !c.hasLiked
        };
      }
      return c;
    }));
  };

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'Royal Elite': return 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black border-transparent';
      case 'VIP': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Gold': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Silver': return 'bg-slate-400/10 text-slate-400 border-slate-400/20';
      default: return 'bg-amber-700/10 text-amber-600 border-amber-700/20';
    }
  };

  return (
    <div id="telegram-section-root" className="rounded-2xl border border-amber-500/10 bg-[#121318]/60 p-6 backdrop-blur-md">
      {/* Announcements Header Banner */}
      <div className="mb-6 rounded-xl border border-amber-500/15 bg-gradient-to-r from-amber-500/5 to-yellow-600/5 p-4 flex gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
          <Bell className="h-5 w-5 animate-bounce" />
        </div>
        <div className="text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] font-mono">
            PINNED COMMUNITY ANNOUNCEMENT
          </span>
          <p className="mt-1 text-xs text-gray-300 leading-relaxed font-sans">
            🎉 All payouts for completed cycles are fully distributed! Members can reinvest within 10 minutes of maturity or withdraw. Our liquidity pools are protected under our capital shield protocol. Active trading is fully operational 24/7.
          </p>
        </div>
      </div>

      {/* Main Forum Header */}
      <div className="flex items-center gap-3 border-b border-amber-500/10 pb-4 mb-5">
        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 border border-amber-500/10">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">ROYAL TESTIMONIAL FEED</h3>
          <p className="text-xs text-gray-400">Member insights and direct payout reports</p>
        </div>
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSend} className="space-y-3 mb-6" id="add-comment-form">
        <textarea
          id="testimonial-textarea"
          rows={2}
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Share your payout success, trade reports, or community feedback..."
          className="w-full rounded-xl border border-amber-500/10 bg-[#17181f] p-3 text-xs text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20 transition-all font-sans"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Custom Royal Rank Selection for test comment */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-gray-500 font-mono">YOUR SIMULATED RANK:</span>
            <div className="flex gap-1">
              {(['Gold', 'VIP', 'Royal Elite'] as const).map(rank => (
                <button
                  id={`btn-rank-${rank}`}
                  type="button"
                  key={rank}
                  onClick={() => setSelectedRank(rank)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border transition-all cursor-pointer ${
                    selectedRank === rank
                      ? 'bg-amber-400 text-black border-amber-400'
                      : 'bg-transparent text-gray-400 border-gray-800'
                  }`}
                >
                  {rank}
                </button>
              ))}
            </div>
          </div>

          <button
            id="btn-publish-testimonial"
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0c0d12] hover:brightness-110 cursor-pointer"
          >
            <span>Publish Testimonial</span>
            <Send className="h-3 w-3" />
          </button>
        </div>
      </form>

      {/* Interactive feedback comments list */}
      <div className="space-y-4 overflow-y-auto max-h-[340px] pr-1" id="comments-testimonials-list">
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-amber-500/5 bg-[#17181f]/40 p-4 space-y-2 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-600 flex items-center justify-center text-[10px] font-black text-black uppercase">
                    {comment.username.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">{comment.username}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest border ${getRankBadgeColor(comment.rank)}`}>
                        {comment.rank}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono">{comment.timestamp}</span>
                  </div>
                </div>

                {/* Like Button */}
                <button
                  id={`btn-like-${comment.id}`}
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono transition-all cursor-pointer ${
                    comment.hasLiked
                      ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30 font-bold'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <Heart className={`h-3 w-3 ${comment.hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                  <span>{comment.likes}</span>
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed font-sans">{comment.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
