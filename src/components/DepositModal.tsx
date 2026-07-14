import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, ShieldCheck, QrCode, CreditCard, ArrowRight, Wallet, Upload, Image, Trash2 } from 'lucide-react';
import { InvestmentPlan } from '../types';
import { CRYPTO_WALLETS } from '../data';

interface DepositModalProps {
  plan: InvestmentPlan | null;
  onClose: () => void;
  onConfirmDeposit: (username: string, plan: InvestmentPlan, screenshotBase64?: string | null, paymentMethod?: string) => void;
  defaultUsername?: string;
}

export default function DepositModal({ plan, onClose, onConfirmDeposit, defaultUsername = '' }: DepositModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'USDT' | 'BTC' | 'ETH' | 'BANK'>('USDT');
  const [username, setUsername] = useState(defaultUsername);
  const [isCopied, setIsCopied] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [customError, setCustomError] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step2Error, setStep2Error] = useState('');

  if (!plan) return null;

  const walletAddress = paymentMethod === 'USDT' 
    ? CRYPTO_WALLETS.USDT_TRC20 
    : paymentMethod === 'BTC' 
      ? CRYPTO_WALLETS.BTC 
      : paymentMethod === 'ETH' 
        ? CRYPTO_WALLETS.ETH 
        : 'Royal Bank Sort Code: 40-11-18, Acc: 91804257 (Ref: RoyalPool)';

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleNextStep = () => {
    if (!username.trim()) {
      setCustomError('Please enter your Royal Username or Name to associate with this investment.');
      return;
    }
    setCustomError('');
    setStep(2);
  };

  const handleMethodChange = (method: 'USDT' | 'BTC' | 'ETH' | 'BANK') => {
    setPaymentMethod(method);
    setStep2Error('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setScreenshot(file);
    setStep2Error('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  const handleSubmit = () => {
    if (!screenshot) {
      setStep2Error('Please upload your payment verification screenshot to confirm the deposit.');
      return;
    }
    setStep2Error('');
    onConfirmDeposit(username, plan, screenshotPreview, paymentMethod);
    onClose();
  };

  return (
    <div id="deposit-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        id="deposit-modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/20 bg-[#0d0e12] text-left shadow-2xl"
      >
        {/* Border golden top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600"></div>

        {/* Close Button */}
        <button
          id="btn-close-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white rounded-lg p-1.5 hover:bg-white/5 transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] font-mono">
              ALLOCATING TO {plan.categoryLabel}
            </span>
            <h3 className="font-display text-xl font-bold text-white mt-1">
              PROPOSAL CONTRACT VERIFICATION
            </h3>
          </div>

          {/* Stepper indicators */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[#d4af37]' : 'bg-gray-800'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[#d4af37]' : 'bg-gray-800'}`}></div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                {/* Plan Highlights */}
                <div className="rounded-xl border border-amber-500/10 bg-[#16171d] p-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-gray-500 font-mono">INVESTMENT CAPITAL</span>
                    <span className="text-lg font-black text-white font-display">£{plan.capital.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-[#d4af37] font-mono">GUARANTEED ROI</span>
                    <span className="text-lg font-black text-[#d4af37] font-display">£{plan.roi.toLocaleString()}</span>
                  </div>
                </div>

                {/* Username Input */}
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Your Royal Username:
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your telegram or dashboard name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-amber-500/10 bg-[#121318] px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none transition-all font-mono"
                  />
                  {customError && (
                    <p className="text-xs text-rose-400 font-mono mt-1">{customError}</p>
                  )}
                  <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                    This username will be displayed in the live payouts block and community channels upon successful verification.
                  </p>
                </div>

                {/* Submit button */}
                <button
                  id="btn-modal-next"
                  onClick={handleNextStep}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] py-3.5 text-xs font-extrabold uppercase tracking-widest text-[#0c0d12] hover:brightness-110 cursor-pointer"
                >
                  <span>Continue to Secure Deposit</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Selector for payment network */}
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    CHOOSE SECURE NETWORK:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {(['USDT', 'BTC', 'ETH', 'BANK'] as const).map(method => (
                      <button
                        id={`btn-payment-${method}`}
                        key={method}
                        onClick={() => handleMethodChange(method)}
                        className={`py-2 px-1 rounded-lg text-[10px] font-bold font-mono transition-all uppercase cursor-pointer border ${
                          paymentMethod === method
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-md shadow-amber-500/5'
                            : 'bg-[#121318] text-gray-400 border-amber-500/5 hover:border-amber-500/20'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wallet Details Display */}
                <div className="rounded-xl border border-amber-500/10 bg-[#16171d] p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/5 pb-3">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-amber-400" />
                      {paymentMethod === 'BANK' ? 'Royal Bank Coordinates' : `${paymentMethod} ADDRESS`}
                    </span>
                    <button
                      id="btn-copy-address"
                      onClick={handleCopy}
                      className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-1 text-[10px] font-mono text-[#d4af37] hover:bg-amber-500/20 transition-all cursor-pointer"
                    >
                      {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <p className="text-xs break-all text-white font-mono leading-relaxed select-all">
                    {walletAddress}
                  </p>

                  {paymentMethod !== 'BANK' && (
                    <div className="flex justify-center pt-2">
                      <div className="rounded-lg bg-white p-2">
                        <QrCode className="h-28 w-28 text-black" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Space for Transaction Screenshot */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    UPLOAD TRANSACTION SCREENSHOT / RECEIPT:
                  </label>
                  
                  {!screenshotPreview ? (
                    <div
                      id="screenshot-dropzone"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('screenshot-input')?.click()}
                      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-6 px-4 text-center cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-amber-400 bg-amber-500/5' 
                          : 'border-amber-500/20 bg-[#121318] hover:border-amber-500/40 hover:bg-amber-500/5'
                      }`}
                    >
                      <input
                        id="screenshot-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Upload className="h-7 w-7 text-amber-400/80 mb-2 animate-pulse" />
                      <p className="text-xs font-bold text-gray-300">
                        Drag & drop screenshot here, or <span className="text-[#d4af37] hover:underline">browse files</span>
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">
                        Supports PNG, JPG, JPEG (Max 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl border border-amber-500/20 bg-[#16171d] p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-12 w-12 rounded-lg bg-gray-800 overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                          <img src={screenshotPreview} alt="Screenshot Preview" className="h-full w-full object-cover" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white truncate font-mono">
                            {screenshot?.name || 'receipt_screenshot.png'}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {screenshot ? `${(screenshot.size / (1024 * 1024)).toFixed(2)} MB` : 'Custom File'}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        id="btn-remove-screenshot"
                        type="button"
                        onClick={clearScreenshot}
                        className="rounded-lg p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {step2Error && (
                    <p className="text-xs text-rose-400 font-mono mt-1">{step2Error}</p>
                  )}
                </div>

                {/* Final Checklist note */}
                <div className="rounded-lg border border-amber-500/5 bg-[#121318] p-3 flex gap-3">
                  <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Upon making the transfer of <strong className="text-white">£{plan.capital.toLocaleString()}</strong> and uploading your screenshot, click the button below to confirm. Your portfolio simulator will instantly initialize, and your earnings will compound in real-time.
                  </p>
                </div>

                {/* Bottom Action buttons */}
                <div className="flex gap-3">
                  <button
                    id="btn-modal-back"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-xl border border-gray-800 bg-[#121318] py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    id="btn-modal-submit"
                    onClick={handleSubmit}
                    className="flex-[2] rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 py-3 text-xs font-extrabold uppercase tracking-widest text-[#0c0d12] hover:brightness-110 cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    Confirm Deposit Verification
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
