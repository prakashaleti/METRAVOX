import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Scale, Lock, Mail, KeyRound, ArrowRight, ArrowLeft, 
  CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck, 
  Clock, Sparkles, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { firestoreUsers } from '../services/firestoreService';
import { useApp } from '../context/AppContext';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset Password, 3 = Completed
  const [email, setEmail] = useState('prakash01.aleti@gmail.com');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [otpHelper, setOtpHelper] = useState('');

  const { addToast } = useApp();
  const navigate = useNavigate();

  // Step 1: Send OTP to email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessInfo(null);

    try {
      const res = await api.auth.requestPasswordReset(email.trim().toLowerCase());
      setSuccessInfo(res.message || `Verification OTP has been sent to ${email}.`);
      if (res.otp_preview) {
        setOtpHelper(res.otp_preview);
      }
      addToast(`Verification code sent to ${email}`, 'success', 'OTP Dispatched');
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch verification OTP. Please verify your email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Confirm OTP & set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otp.trim()) {
      setErrorMessage('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Reset password in Django backend
      await api.auth.confirmPasswordReset(cleanEmail, otp.trim(), newPassword);

      // 2. Synchronize password in Firestore users collection
      await firestoreUsers.resetPassword(cleanEmail, newPassword);

      addToast('Password has been reset successfully! You can now log in.', 'success', 'Password Updated');
      setStep(3);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password. Please check your OTP and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Portal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-800/80 border border-teal-500/30 text-white shadow-xl mb-3 backdrop-blur-sm">
            <Scale className="w-7 h-7 text-teal-300" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
            METRAVOX Applicant Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Department of Legal Metrology &bull; Self-Service Password Recovery
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 space-y-5">
          
          {/* Progress Indicator */}
          {step !== 3 && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  step >= 1 ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  1
                </span>
                <span className={`text-xs font-semibold ${step === 1 ? 'text-teal-900 font-bold' : 'text-slate-500'}`}>
                  Verify Email
                </span>
              </div>
              <div className="h-0.5 w-12 bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  step >= 2 ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  2
                </span>
                <span className={`text-xs font-semibold ${step === 2 ? 'text-teal-900 font-bold' : 'text-slate-500'}`}>
                  New Password
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Success / OTP Info Banner */}
          {successInfo && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{successInfo}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Code is valid for 15 minutes.
                </p>
              </div>
            </div>
          )}

          {/* Demonstration Helper */}
          {otpHelper && step === 2 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                <span>Demo OTP: <strong className="font-mono text-sm tracking-wider text-amber-800">{otpHelper}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(otpHelper)}
                className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* ── STEP 1: Enter Registered Email ────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <div className="mb-2">
                  <h2 className="text-lg font-bold text-slate-900">Reset Applicant Password</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the email registered with your METRAVOX trader or scale applicant account.
                  </p>
                </div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none font-medium transition-all text-slate-900"
                    placeholder="e.g. prakash01.aleti@gmail.com"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>Statutory Security Notice</span>
                </div>
                <p>
                  A 6-digit one-time verification password (OTP) will be dispatched to your email address and logged in compliance with Legal Metrology portal standards.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Verification OTP...</span>
                  </span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2: Enter OTP & New Password ────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <div className="mb-2">
                  <h2 className="text-lg font-bold text-slate-900">Enter OTP & Set New Password</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the code sent to <strong className="text-slate-800">{email}</strong> and configure your new password.
                  </p>
                </div>

                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  6-Digit Verification OTP
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3.5 py-3 text-sm font-mono tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none text-slate-900"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none font-mono text-slate-900"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none font-mono text-slate-900"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change Email</span>
                </button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-teal-800 to-emerald-700 hover:from-teal-900 hover:to-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synchronizing New Password...</span>
                  </span>
                ) : (
                  <>
                    <span>Confirm & Reset Password</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 3: Completed State ─────────────────────────────── */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Password Reset Completed!</h2>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Your credentials have been securely updated across both <strong>Cloud Firestore</strong> and the <strong>Django REST Auth Engine</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span>Updated Account: </span>
                <strong className="text-slate-900">{email}</strong>
              </div>

              <Link
                to="/login"
                className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Return to Login link */}
          {step !== 3 && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <Link
                to="/login"
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          National Legal Metrology Portal &bull; Government of India
        </p>

      </div>
    </div>
  );
}
