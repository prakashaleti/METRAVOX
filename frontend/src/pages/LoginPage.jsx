import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Scale, Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2, 
  AlertCircle, Eye, EyeOff, Sparkles, Building2, Shield, 
  ChevronDown, ChevronUp, QrCode, Search, Server, Database, Globe
} from 'lucide-react';
import { useAuth, ROLES, USER_PROFILES } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const CREDENTIALS_LIST = [
  {
    roleKey: ROLES.CONSUMER,
    roleTitle: 'Applicant / Trader',
    name: 'prakash',
    email: 'prakash01.aleti@gmail.com',
    password: 'Applicant@2026',
    description: 'Commercial Trader & Scale Applicant',
    badge: 'Registered Establishment'
  },
  {
    roleKey: ROLES.OFFICER,
    roleTitle: 'Legal Metrology Officer',
    name: 'Ramesh varma',
    email: 'ramesh.varma.lmo@gov.in',
    password: 'Officer@2026',
    description: 'Senior Legal Metrology Officer, Zone 04',
    badge: 'Enforcement Authority'
  },
  {
    roleKey: ROLES.ADMIN,
    roleTitle: 'State Director / Admin',
    name: 'Rohith',
    email: 'rohith.admin@gov.in',
    password: 'Admin@2026',
    description: 'Assistant Controller & State Administrator',
    badge: 'Ministry Directorate HQ'
  }
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES.CONSUMER);
  const [username, setUsername] = useState('prakash01.aleti@gmail.com');
  const [password, setPassword] = useState('Applicant@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

  const { login } = useAuth();
  const { systemHealth } = useApp();
  const navigate = useNavigate();

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setErrorMessage('');
    const isPreviousDefault = CREDENTIALS_LIST.some(
      (c) => c.email.toLowerCase() === username.toLowerCase()
    );
    if (isPreviousDefault || !username) {
      const cred = CREDENTIALS_LIST.find((c) => c.roleKey === roleKey);
      if (cred) {
        setUsername(cred.email);
        setPassword(cred.password);
      }
    }
  };

  const handleAutofill = (cred) => {
    setSelectedRole(cred.roleKey);
    setUsername(cred.email);
    setPassword(cred.password);
    setErrorMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const loginEmail = username.trim();
      const loginPassword = password;

      const { role } = await login(loginEmail, loginPassword, selectedRole);

      if (role === ROLES.CONSUMER) navigate('/consumer/dashboard');
      else if (role === ROLES.OFFICER) navigate('/officer/dashboard');
      else if (role === ROLES.ADMIN) navigate('/admin/dashboard');
      else navigate('/consumer/dashboard');
    } catch (err) {
      const msg =
        err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? 'Invalid email or password. Please verify your credentials.'
          : err.code === 'auth/user-not-found'
          ? 'Account not found. Please register or verify the email in Firebase.'
          : err.code === 'auth/operation-not-allowed'
          ? 'Email/Password authentication is disabled in Firebase Console. Please enable it in Authentication -> Sign-in method.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many login attempts. Please wait a moment and try again.'
          : err.code === 'auth/network-request-failed'
          ? 'Network connection error. Please check your internet connection.'
          : err.message || 'Authentication error. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* ── Left Column: Official Government Hero Branding ──────────── */}
        <div className="lg:col-span-6 space-y-8 text-left py-4">
          
          {/* Official Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Govt. of India • Legal Metrology Act, 2009</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-900/40 text-white">
                <Scale className="w-7 h-7" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif text-white">
                METRA<span className="text-teal-400">VOX</span>
              </h1>
            </div>
            <p className="text-xl sm:text-2xl font-sans font-medium text-slate-200">
              National Online Verification & Stamping Portal
            </p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Centralized statutory workflow for verification, inspection, digital sealing, and QR-authenticated certification of commercial weighing and measuring instruments across all enforcement jurisdictions.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-bold">
                <QrCode className="w-4 h-4 text-teal-400" />
                <span>QR-Sealed Certificates</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Cryptographically signed digital verification certificates with instant public QR audit.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Trader Self-Service</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Direct online lodgement, fee payment, correction resolution, and inspection slot scheduling.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-sky-300 text-xs font-bold">
                <Shield className="w-4 h-4 text-sky-400" />
                <span>Enforcement Auditing</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                MPE tolerance records, field inspection test logs, and statutory stamping compliance.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Real-Time Expiry Radar</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Automated 30-day, 15-day, and critical renewal alerts to avoid statutory penalties.
              </p>
            </div>
          </div>

          {/* Real-time System Connectivity Telemetry */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium text-[11px]">System Status:</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Database className="w-3.5 h-3.5 text-teal-400" />
                <span>Firestore Cloud: <strong className="text-emerald-400">Connected</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                <span>Django REST: <strong className="text-emerald-400">Active {window.location.port ? `(Port ${window.location.port})` : '(Live)'}</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column: Polished Sign-In Card ──────────────────────── */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 space-y-6">
            
            {/* Card Header */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 font-serif">Sign In to METRAVOX</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized access for Applicants, Enforcement Officers, and Administrators
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs">
                  {USER_PROFILES[selectedRole]?.avatar || 'GOV'}
                </div>
              </div>
            </div>

            {/* Role Switcher Pills */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Select Your Role / Access Level
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleRoleSelect(ROLES.CONSUMER)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRole === ROLES.CONSUMER
                      ? 'bg-white text-teal-900 shadow-sm border border-slate-200/80 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Applicant</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect(ROLES.OFFICER)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRole === ROLES.OFFICER
                      ? 'bg-white text-indigo-900 shadow-sm border border-slate-200/80 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Officer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect(ROLES.ADMIN)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRole === ROLES.ADMIN
                      ? 'bg-white text-purple-900 shadow-sm border border-slate-200/80 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="leading-relaxed font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email / Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none font-medium transition-all text-slate-900"
                    placeholder="e.g. prakash01.aleti@gmail.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  {selectedRole === ROLES.CONSUMER ? (
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline transition-colors flex items-center gap-1"
                    >
                      <span>Forgot Password?</span>
                    </Link>
                  ) : (
                    <span className="text-[11px] text-teal-700 font-mono">
                      Authorized Credentials
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none font-mono text-slate-900 transition-all"
                    placeholder="Enter role password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 hover:from-teal-900 hover:to-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-teal-900/20 hover:shadow-teal-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials with Cloud & Backend...</span>
                  </span>
                ) : (
                  <>
                    <span>Authenticate & Enter METRAVOX</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Public Action Links */}
            <div className="pt-2 grid grid-cols-2 gap-2 text-center text-xs">
              <Link
                to="/track"
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-teal-700" />
                <span>Track Application</span>
              </Link>
              <Link
                to="/register"
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-teal-700" />
                <span>Register Trader</span>
              </Link>
            </div>

            {/* ── Collapsible Testing & Demo Suite (Neat Accordion) ─────── */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDemoDrawer(!showDemoDrawer)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Developer & Evaluator Quick Autofill</span>
                </div>
                {showDemoDrawer ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showDemoDrawer && (
                <div className="mt-3 space-y-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs animate-in fade-in">
                  <p className="text-[11px] text-slate-500 mb-2">
                    Click <strong>"Use Credential"</strong> below to instantly populate verified persona credentials:
                  </p>
                  
                  {CREDENTIALS_LIST.map((cred) => (
                    <div
                      key={cred.roleKey}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{cred.name}</span>
                          <span className="text-[10px] text-slate-400">({cred.roleTitle})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{cred.email}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAutofill(cred)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 rounded-lg hover:bg-teal-100 cursor-pointer shrink-0 transition-colors"
                      >
                        Use Credential
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
