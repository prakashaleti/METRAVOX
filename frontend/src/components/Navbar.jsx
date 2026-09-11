import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Scale, 
  Bell, 
  User, 
  ChevronDown, 
  ShieldCheck, 
  RotateCcw, 
  LogOut, 
  Menu, 
  X,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  QrCode
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getExpiryAlertInfo } from '../services/storage';

export default function Navbar({ onToggleSidebar }) {
  const { currentRole, user, logout, isAuthenticated } = useAuth();
  const { certificateExpirySummary, certificates = [], applications = [] } = useApp();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeExpiry = React.useMemo(() => {
    if (currentRole === ROLES.CONSUMER) {
      if (!user) return { urgent: [], warning: [], reminder: [], expired: [], valid: [], totalActionRequired: 0 };
      const userClean = (user.email || '').trim().toLowerCase();
      const userNameClean = (user.name || '').trim().toLowerCase();
      const userIdClean = user.id ? String(user.id) : null;

      const userCerts = (certificates || []).filter((c) => {
        const emailMatch = userClean && c.applicantEmail && c.applicantEmail.trim().toLowerCase() === userClean;
        const nameMatch = userNameClean && c.applicantName && c.applicantName.trim().toLowerCase() === userNameClean;
        const uidMatch = userIdClean && c.applicantUid && String(c.applicantUid) === userIdClean;
        return emailMatch || nameMatch || uidMatch;
      });

      const urgent = [], warning = [], reminder = [], expired = [], valid = [];
      userCerts.forEach((cert) => {
        const info = getExpiryAlertInfo(cert.expiryDate);
        const enriched = { ...cert, expiryInfo: info };
        if (info.severity === 'expired') expired.push(enriched);
        else if (info.severity === 'urgent') urgent.push(enriched);
        else if (info.severity === 'warning') warning.push(enriched);
        else if (info.severity === 'reminder') reminder.push(enriched);
        else valid.push(enriched);
      });
      return {
        urgent, warning, reminder, expired, valid,
        totalActionRequired: urgent.length + warning.length + expired.length,
        allExpiringSoon: [...expired, ...urgent, ...warning, ...reminder]
      };
    }
    return certificateExpirySummary;
  }, [certificates, currentRole, user, certificateExpirySummary]);

  const totalAlerts = activeExpiry.totalActionRequired;

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm no-print">
      {/* 1. Official National Tricolor Bar */}
      <div className="bg-slate-900 text-slate-200 text-[11px] py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF9933]"></span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-white"></span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#138808]"></span>
          </div>
          <span className="font-semibold tracking-wide text-slate-300">
            GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-400">
          <span className="hover:text-white transition-colors cursor-pointer">Legal Metrology Act, 2009</span>
          <span>•</span>
          <span className="text-teal-400 font-mono">National Portal (v2.6)</span>
        </div>
      </div>

      {/* 2. Primary Portal Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-teal-900 via-teal-700 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-900/20 group-hover:scale-105 transition-transform">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-teal-950 font-serif">
                    METRA<span className="text-teal-600">VOX</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    ONLINE VERIFICATION
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-tight hidden sm:block">
                  Statutory Verification System for Weighing & Measuring Instruments
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile / Camera QR Scanner Link */}
            <Link
              to="/scan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all border border-teal-200 shadow-sm"
              title="Scan Instrument QR Code"
            >
              <QrCode className="w-4 h-4 text-teal-700" />
              <span className="hidden sm:inline">Scan QR</span>
            </Link>

            {/* Quick Public Verification Link */}
            <Link
              to="/track"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50/70 rounded-lg transition-colors border border-transparent hover:border-teal-200"
            >
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Track Application
            </Link>

            {/* Notification Drawer Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="View Notifications"
              >
                <Bell className="w-5 h-5" />
                {totalAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-700" />
                      <h4 className="font-bold text-sm text-slate-900">Notifications & Alerts</h4>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {totalAlerts} Actionable
                    </span>
                  </div>

                  <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                    {activeExpiry.expired.map((c) => (
                      <Link
                        key={c.certificateNumber}
                        to={`/certificates/${c.certificateNumber}`}
                        onClick={() => setNotificationOpen(false)}
                        className="block p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-red-900 mb-0.5">
                          <span>Expired Certificate</span>
                          <span className="font-mono text-[10px]">Overdue</span>
                        </div>
                        <p className="text-[11px] text-red-700 line-clamp-1">{c.instrumentType} ({c.certificateNumber})</p>
                      </Link>
                    ))}

                    {activeExpiry.urgent.map((c) => (
                      <Link
                        key={c.certificateNumber}
                        to={`/certificates/${c.certificateNumber}`}
                        onClick={() => setNotificationOpen(false)}
                        className="block p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-orange-900 mb-0.5">
                          <span>Expiring in {c.expiryInfo?.remainingDays ?? ''} days</span>
                          <span className="font-mono text-[10px]">Urgent</span>
                        </div>
                        <p className="text-[11px] text-orange-700 line-clamp-1">{c.instrumentType} ({c.modelNumber})</p>
                      </Link>
                    ))}

                    {activeExpiry.warning.map((c) => (
                      <Link
                        key={c.certificateNumber}
                        to={`/certificates/${c.certificateNumber}`}
                        onClick={() => setNotificationOpen(false)}
                        className="block p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-0.5">
                          <span>15-Day Renewal Notice</span>
                          <span className="font-mono text-[10px]">Warning</span>
                        </div>
                        <p className="text-[11px] text-amber-800 line-clamp-1">{c.instrumentType}</p>
                      </Link>
                    ))}

                    {totalAlerts === 0 && (
                      <div className="py-6 text-center text-slate-500 text-xs">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
                        All verified instruments are up-to-date.
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setNotificationOpen(false)}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900"
                    >
                      View All Alerts & Activity Log →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* System Dual-Sync Status Pill */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cloud & API Sync: <strong className="text-emerald-700 font-semibold">Active</strong></span>
            </div>

            {/* User Account Menu (Secure - Role Locked, No Switching) */}
            {location.pathname !== '/login' && isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 text-teal-950 transition-colors cursor-pointer"
                  title="My Account Menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user?.avatar || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-[10px] uppercase font-bold text-teal-700 block leading-tight">
                      {currentRole === ROLES.CONSUMER ? 'Applicant' : currentRole === ROLES.OFFICER ? 'Officer' : 'Admin'}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[130px] block">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-teal-700" />
                </button>

                {/* Profile & Session Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
                    {/* User Card */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                          {user?.avatar || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email}</p>
                          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            currentRole === ROLES.CONSUMER ? 'bg-teal-100 text-teal-800' : currentRole === ROLES.OFFICER ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {user?.roleTitle || currentRole}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>View My Profile</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-500" />
                        <span>Account & Security</span>
                      </Link>
                    </div>

                    {/* Sign Out Action */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Account</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : location.pathname === '/login' ? (
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-sm"
              >
                <span>Register Trader</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-sm"
              >
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
