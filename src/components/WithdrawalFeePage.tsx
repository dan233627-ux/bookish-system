import { useState, useEffect, type ChangeEvent, type DragEvent } from 'react';
import { ArrowLeft, ArrowRight, Copy, Check, Wallet, CreditCard, Upload, Image, Trash2 } from 'lucide-react';
import { ActiveInvestment } from '../types';
import { CRYPTO_WALLETS } from '../data';

interface WithdrawalFeePageProps {
  investment: ActiveInvestment;
  feeCurrency: 'TRX' | 'USDT' | 'BTC' | 'ETH';
  payoutWalletAddress: string;
  onBack: () => void;
  onSubmitReview?: (
    investmentId: string,
    screenshotBase64: string,
    feeCurrency: 'TRX' | 'USDT' | 'BTC' | 'ETH',
    payoutWalletAddress: string
  ) => Promise<boolean>;
}

const currencyAddressMap: Record<'TRX' | 'USDT' | 'BTC' | 'ETH', string> = {
  TRX: CRYPTO_WALLETS.TRX,
  USDT: CRYPTO_WALLETS.USDT_TRC20,
  BTC: CRYPTO_WALLETS.BTC,
  ETH: CRYPTO_WALLETS.ETH,
};

const displayCurrencyName: Record<'TRX' | 'USDT' | 'BTC' | 'ETH', string> = {
  TRX: 'TRX',
  USDT: 'USDT (TRC20)',
  BTC: 'BTC',
  ETH: 'ETH',
};

export default function WithdrawalFeePage({ investment, feeCurrency, payoutWalletAddress, onBack, onSubmitReview }: WithdrawalFeePageProps) {
  const [copied, setCopied] = useState(false);
  const [selectedFeeCurrency, setSelectedFeeCurrency] = useState<'TRX' | 'USDT' | 'BTC' | 'ETH'>(feeCurrency);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(investment.screenshotUrl || null);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasManualScreenshotChange, setHasManualScreenshotChange] = useState(false);

  const feeAddress = currencyAddressMap[selectedFeeCurrency];
  const withdrawalFeeAmount = Number(investment.capital.toFixed(2));
  const grossPayout = Number(investment.roi.toFixed(2));
  const isUnderReview = investment.status === 'withdraw_under_review';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(feeAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleCurrencySelect = (currency: 'TRX' | 'USDT' | 'BTC' | 'ETH') => {
    setSelectedFeeCurrency(currency);
    setCopied(false);
  };

  const processFile = (file: File) => {
    setUploadError('');
    setHasManualScreenshotChange(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  useEffect(() => {
    if (investment.screenshotUrl && !screenshotPreview && !hasManualScreenshotChange) {
      setScreenshotPreview(investment.screenshotUrl);
    }
  }, [investment.screenshotUrl, screenshotPreview, hasManualScreenshotChange]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClearScreenshot = () => {
    setScreenshotPreview(null);
    setUploadError('');
    setSuccessMessage(null);
    setHasManualScreenshotChange(false);
  };

  const handleSubmitReview = async () => {
    if (isUnderReview || !onSubmitReview) return;
    if (!screenshotPreview) {
      setUploadError('Please attach your withdrawal fee proof screenshot before submitting.');
      return;
    }

    setUploadError('');
    setIsSubmitting(true);
    const success = await onSubmitReview(investment.id, screenshotPreview, selectedFeeCurrency, payoutWalletAddress);
    setIsSubmitting(false);

    if (success) {
      setSuccessMessage('Payment proof sent successfully. Your withdrawal is now under review.');
    } else {
      setUploadError('Failed to submit the screenshot. Please try again.');
    }
  };

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
          <div className="border-b border-slate-700/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.35em] text-emerald-300">Withdrawal request submitted</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-white">Payment instructions</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                  Complete the fee transfer below and attach your proof screenshot. Your withdrawal will be queued for verification and released once approved.
                </p>
              </div>
              <div className="grid gap-2 sm:text-right">
                <span className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Contract</span>
                <p className="text-sm font-semibold uppercase text-emerald-300">{investment.planLabel} Pool</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-amber-500/10 bg-[#121318] p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Withdrawal fee</p>
                <p className="mt-2 text-3xl font-black text-white">£{withdrawalFeeAmount.toFixed(2)}</p>
                <p className="mt-2 text-xs text-gray-400">Fee equals your original invested capital amount.</p>
              </div>
              <div className="rounded-3xl border border-amber-500/10 bg-[#121318] p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Gross payout</p>
                <p className="mt-2 text-3xl font-black text-emerald-300">£{grossPayout.toFixed(2)}</p>
                <p className="mt-2 text-xs text-gray-400">Payout will be released once fee payment is confirmed.</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-3xl border border-slate-700/80 bg-slate-900 p-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-white">
                  <Wallet className="h-5 w-5 text-emerald-300" />
                  Payment details
                </div>
                <div className="mt-4 rounded-3xl bg-slate-950/85 p-4 text-sm text-slate-300">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Select payment currency</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {(['TRX', 'USDT', 'BTC', 'ETH'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handleCurrencySelect(method)}
                        className={`rounded-2xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.25em] transition-all ${
                          selectedFeeCurrency === method
                            ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                            : 'border-white/10 bg-[#0c0d12] text-gray-300 hover:border-emerald-500/20'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 space-y-4 rounded-3xl border border-slate-700/60 bg-[#0d1117] p-4 text-sm text-slate-300">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Payment currency</span>
                      <span className="font-semibold text-white">{selectedFeeCurrency}</span>
                    </div>
                    <div className="text-slate-400">
                      Please transfer the fee in your selected currency to the address shown below.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700/80 bg-slate-900 p-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-white">
                  <CreditCard className="h-5 w-5 text-emerald-300" />
                  Payout wallet address
                </div>
                <div className="mt-4 rounded-3xl bg-slate-950/85 p-4 text-sm text-slate-100 break-all">
                  {payoutWalletAddress || 'Not provided'}
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Your payout will be released here once the fee payment is confirmed.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700/80 bg-slate-900 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Fee wallet</p>
                  <p className="mt-2 text-sm font-semibold text-white">{displayCurrencyName[selectedFeeCurrency]}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200 hover:bg-emerald-500/20"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy address'}
                </button>
              </div>
              <div className="mt-4 break-all rounded-3xl bg-slate-950/85 p-4 text-sm text-slate-100 font-mono">
                {feeAddress}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700/80 bg-slate-900 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Proof of payment</p>
                  <p className="mt-2 text-sm font-semibold text-white">Upload screenshot for review</p>
                </div>
                {isUnderReview && (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                    Under review
                  </span>
                )}
              </div>

              <div
                className={`mt-4 rounded-3xl border-2 ${
                  isDragging ? 'border-emerald-400 bg-[#152018]' : 'border-dashed border-slate-600 bg-[#0b1114]'
                } p-6 text-center transition-colors`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {!screenshotPreview ? (
                  <div className="space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-slate-400">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-slate-300">Drag & drop a screenshot or receipt here, or click to choose a file.</p>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200 hover:bg-emerald-500/20">
                      Choose file
                      <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-[auto_1fr] items-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-slate-200">
                        <Image className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white">Screenshot selected</p>
                        <p className="text-sm text-slate-400">Review screenshot and submit it for verification.</p>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-700 bg-[#10151b] p-4">
                      <img src={screenshotPreview} alt="Withdrawal proof preview" className="mx-auto max-h-64 w-full rounded-2xl object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={handleClearScreenshot}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-[#161b22] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 hover:bg-slate-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove screenshot
                    </button>
                  </div>
                )}
              </div>

              {uploadError && <p className="mt-3 text-sm text-rose-400">{uploadError}</p>}
              {successMessage && <p className="mt-3 text-sm text-emerald-300">{successMessage}</p>}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={isUnderReview || isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#0b0c10] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUnderReview ? 'Withdrawal already under review' : isSubmitting ? 'Submitting...' : 'Submit proof for review'}
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-500/10 bg-[#0c0d12] px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-gray-300 hover:bg-white/5"
                >
                  Back to dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700/80 bg-slate-900 p-6 text-sm text-slate-400">
              <p className="font-semibold uppercase tracking-[0.25em] text-slate-300">Security notice</p>
              <p className="mt-3 leading-relaxed">
                Only send the fee to the address above. Once the payment is confirmed, your withdrawal request will move to the next stage and the payout will be released.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
