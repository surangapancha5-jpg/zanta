import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types/game';
import {
  generateAndSendOtp,
  verifyOtp,
  findRegisteredUser,
  normalizePhone,
} from '../services/authService';
import { sounds } from '../services/soundEffects';
import { Phone, User, ShieldCheck, ArrowRight, RotateCcw, CheckCircle2, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [phone, setPhone] = useState<string>('0771234567');
  const [username, setUsername] = useState<string>('නිමල් ගොවි මහතා');
  const [otpValue, setOtpValue] = useState<string>('');
  const [latestGeneratedOtp, setLatestGeneratedOtp] = useState<string | null>(null);
  const [showSmsBanner, setShowSmsBanner] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number>(45);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [returningUser, setReturningUser] = useState<UserProfile | null>(null);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Check if entered phone already has an account
  useEffect(() => {
    const norm = normalizePhone(phone);
    if (norm.length >= 9) {
      const existing = findRegisteredUser(norm);
      if (existing) {
        setReturningUser(existing);
        if (!username || username === 'නිමල් ගොවි මහතා') {
          setUsername(existing.username);
        }
      } else {
        setReturningUser(null);
      }
    } else {
      setReturningUser(null);
    }
  }, [phone]);

  // Resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  // Auto focus OTP input when step changes
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpInputRef.current?.focus(), 200);
    }
  }, [step]);

  if (!isOpen) return null;

  const handleRequestOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const norm = normalizePhone(phone);
    if (!norm || norm.length < 9) {
      setErrorMsg('කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 0771234567)');
      sounds.play('error');
      return;
    }

    if (!username.trim()) {
      setErrorMsg('කරුණාකර ඔබගේ නම ඇතුළත් කරන්න');
      sounds.play('error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = generateAndSendOtp(norm, username);
      setIsSubmitting(false);

      if (res.success && res.otp) {
        setLatestGeneratedOtp(res.otp);
        setShowSmsBanner(true);
        setStep('otp');
        setResendCountdown(45);
        sounds.play('click');
      } else {
        setErrorMsg(res.message || 'OTP යැවීමට නොහැකි විය.');
        sounds.play('error');
      }
    }, 400);
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (otpValue.trim().length !== 6) {
      setErrorMsg('කරුණාකර ඉලක්කම් 6 කින් යුත් OTP කේතය සම්පූර්ණයෙන් ඇතුළත් කරන්න.');
      sounds.play('error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = verifyOtp(phone, otpValue, username);
      setIsSubmitting(false);

      if (res.success && res.user) {
        sounds.play('levelUp');
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'OTP කේතය වැරදියි. කරුණාකර නැවත පරීක්ෂා කරන්න.');
        sounds.play('error');
      }
    }, 400);
  };

  const handleAutoFillOtp = () => {
    if (latestGeneratedOtp) {
      setOtpValue(latestGeneratedOtp);
      sounds.play('click');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-950/95 backdrop-blur-md overflow-y-auto">
      {/* Simulated Incoming SMS Banner Notification */}
      {showSmsBanner && latestGeneratedOtp && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-50 bg-stone-900 border-2 border-amber-400 rounded-2xl shadow-2xl p-3.5 text-stone-100 animate-bounce duration-500">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex justify-between items-center text-[10px] text-stone-400 mb-0.5">
                <span className="font-bold text-amber-300">📩 කෙටි පණිවිඩය (SMS) • දැන් ලැබුණි</span>
                <span>GOVI-SMS</span>
              </div>
              <p className="text-stone-200 leading-snug">
                ඔබගේ Govi Gamana පිවිසුම් OTP අංකය:{' '}
                <strong className="text-yellow-300 font-mono text-sm tracking-widest bg-yellow-950/60 px-1.5 py-0.5 rounded border border-yellow-500/40">
                  {latestGeneratedOtp}
                </strong>
              </p>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-500/50 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  ස්වයංක්‍රීයව ඇතුළත් කරන්න (Auto Fill)
                </button>
                <button
                  type="button"
                  onClick={() => setShowSmsBanner(false)}
                  className="text-[10px] text-stone-400 hover:text-stone-200 px-1.5 py-0.5"
                >
                  වසන්න
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="bg-stone-900/95 border border-amber-500/40 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative my-auto">
        {/* Farm Emblem */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20 border-2 border-yellow-200 mb-3">
            🌾
          </div>
          <h2 className="text-lg font-black text-amber-200 tracking-wide">ගොවි ගමන (Govi Gamana)</h2>
          <p className="text-xs text-stone-400 mt-1">
            {step === 'credentials'
              ? 'ක්‍රීඩාවට පිවිසීමට ඔබගේ තොරතුරු ලබාදෙන්න'
              : 'දුරකථනයට ලැබුණු OTP අංකය ලබාදෙන්න'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 bg-rose-950/60 border border-rose-500/60 rounded-xl p-2.5 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="leading-tight">{errorMsg}</p>
          </div>
        )}

        {/* Step 1: Phone + Username */}
        {step === 'credentials' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            {/* Phone input */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                දුරකථන අංකය (Phone Number)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07X XXX XXXX"
                  className="w-full bg-stone-950/80 border border-stone-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono tracking-wide"
                  required
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                ශ්‍රී ලංකා ජංගම දුරකථන අංකය (උදා: 0712345678 හෝ 0771234567)
              </p>
            </div>

            {/* Returning user notice */}
            {returningUser && (
              <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-bold">නැවත පැමිණි ගොවි මහතා හඳුනා ගැනිණි!</p>
                  <p className="text-[10px] text-emerald-400/80">
                    ඔබගේ පෙර ගොවිපොළ, කොයින් සහ දත්ත ආරක්ෂිතව පවතී.
                  </p>
                </div>
              </div>
            )}

            {/* Username input */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                ගොවි නම (Farmer / User Name)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ඔබගේ නම (උදා: නිමල් / සුනිල්)"
                className="w-full bg-stone-950/80 border border-stone-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                required
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>කේතය සූදානම් වෙමින්...</span>
              ) : (
                <>
                  <span>OTP කේතය ලබාගන්න</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between items-center text-stone-400">
                <span>දුරකථන අංකය:</span>
                <span className="font-mono text-amber-300 font-bold">{normalizePhone(phone)}</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>ගොවි නම:</span>
                <span className="text-emerald-300 font-bold">{username}</span>
              </div>
            </div>

            {/* OTP input */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                ඉලක්කම් 6 OTP කේතය (Enter 6-Digit OTP)
              </label>
              <input
                ref={otpInputRef}
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full bg-stone-950 border-2 border-amber-400/80 rounded-xl py-3 text-center text-2xl font-mono tracking-widest text-yellow-300 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>

            {/* Countdown / Resend */}
            <div className="flex items-center justify-between text-xs text-stone-400">
              {resendCountdown > 0 ? (
                <span>නැවත කේතයක්: <strong className="text-amber-400 font-mono">{resendCountdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRequestOtp()}
                  className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  නැවත OTP එකක් එවන්න
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setErrorMsg(null);
                }}
                className="text-stone-400 hover:text-stone-200 underline text-[11px]"
              >
                අංකය වෙනස් කරන්න
              </button>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isSubmitting || otpValue.trim().length !== 6}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>තහවුරු කරමින්...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>තහවුරු කර ක්‍රීඩාවට පිවිසෙන්න</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Safe Storage Note */}
        <div className="mt-4 pt-3 border-t border-stone-800 text-center">
          <p className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ෆෝන් එක ඕෆ් කර පසුව ඕන් කළද ඔබගේ ගොවිපොළ ඒ විදිහටම සුරැකේ!
          </p>
        </div>
      </div>
    </div>
  );
};
