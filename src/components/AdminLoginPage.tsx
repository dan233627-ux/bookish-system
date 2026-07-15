import { FormEvent, useState } from 'react';
import { ArrowLeft, Lock, ShieldCheck, Check, Eye, EyeOff } from 'lucide-react';

interface AdminLoginPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
  adminPassword: string;
}

export default function AdminLoginPage({ onBack, onLoginSuccess, adminPassword }: AdminLoginPageProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!password) {
      setError('Please enter the admin password.');
      return;
    }

    if (password !== adminPassword) {
      setError('Invalid admin password.');
      return;
    }

    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-amber-500/15 bg-[#0c0d12]/90 p-6 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#d4af37]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#d4af37]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Access
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              Approval Console
            </h1>
            <p className="text-sm text-gray-400">
              Use the admin password to access the pending transaction approval portal.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">
                Admin password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#121318]/90 px-4 py-3 text-sm text-white outline-none transition-all focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-400 px-4 py-3 text-sm font-black uppercase tracking-wider text-[#0c0d12] hover:brightness-110 transition-all"
            >
              <Check className="h-4 w-4" />
              Enter Approval Portal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
