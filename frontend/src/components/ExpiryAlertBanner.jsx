import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  X, 
  ChevronRight,
  ShieldAlert,
  BellRing
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getRemainingDays, getExpiryAlertInfo } from '../services/storage';

export default function ExpiryAlertBanner({ certs = null }) {
  const { currentRole, user } = useAuth();
  const { certificateExpirySummary, certificates = [] } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  const activeSummary = React.useMemo(() => {
    let sourceCerts = certs;
    if (!sourceCerts && currentRole === ROLES.CONSUMER) {
      if (!user) return { urgent: [], warning: [], reminder: [], expired: [], totalActionRequired: 0, allExpiringSoon: [] };
      const userClean = (user.email || '').trim().toLowerCase();
      const userNameClean = (user.name || '').trim().toLowerCase();
      const userIdClean = user.id ? String(user.id) : null;

      sourceCerts = certificates.filter((c) => {
        const emailMatch = userClean && c.applicantEmail && c.applicantEmail.trim().toLowerCase() === userClean;
        const nameMatch = userNameClean && c.applicantName && c.applicantName.trim().toLowerCase() === userNameClean;
        const uidMatch = userIdClean && c.applicantUid && String(c.applicantUid) === userIdClean;
        return emailMatch || nameMatch || uidMatch;
      });
    }

    if (sourceCerts) {
      const urgent = [], warning = [], reminder = [], expired = [], valid = [];
      sourceCerts.forEach((cert) => {
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
  }, [certs, currentRole, user, certificates, certificateExpirySummary]);

  const { urgent, warning, reminder, expired } = activeSummary;
  const hasAlerts = urgent.length > 0 || warning.length > 0 || expired.length > 0 || reminder.length > 0;

  if (dismissed || !hasAlerts) return null;

  return (
    <div className="mb-6 space-y-3">
      {/* 1. Critical Expired Alert (if any) */}
      {expired.map((cert) => (
        <div 
          key={cert.certificateNumber}
          className="relative overflow-hidden bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-red-500"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-red-700 uppercase tracking-wider">
                  STATUTORY EXPIRY NOTICE
                </span>
                <span className="text-xs text-red-100 font-mono">{cert.certificateNumber}</span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white">
                Certificate for {cert.instrumentType} Expired {Math.abs(getRemainingDays(cert.expiryDate))} Days Ago
              </h4>
              <p className="text-xs text-red-100 mt-0.5">
                Serial No: <span className="font-mono font-medium">{cert.serialNumber}</span>. Continued commercial use without verification is illegal under Legal Metrology Act.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Link
              to={`/certificates/${cert.certificateNumber}`}
              className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/30 transition-colors"
            >
              View Details
            </Link>
            <Link
              to="/applications/new"
              className="px-4 py-2 text-xs font-bold bg-white hover:bg-red-50 text-red-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              Apply Re-verification
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ))}

      {/* 2. Urgent (1 - 7 Days) */}
      {urgent.map((cert) => (
        <div 
          key={cert.certificateNumber}
          className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-rose-400"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-rose-700 uppercase tracking-wider">
                  URGENT EXPIRATION • {getRemainingDays(cert.expiryDate)} DAYS LEFT
                </span>
                <span className="text-xs text-rose-100 font-mono">{cert.certificateNumber}</span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white">
                Verification Validity Expiring on {cert.expiryDate}
              </h4>
              <p className="text-xs text-rose-100 mt-0.5">
                {cert.instrumentType} ({cert.manufacturer} - {cert.modelNumber}). Action required to avoid business stoppage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Link
              to={`/certificates/${cert.certificateNumber}`}
              className="px-3.5 py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-xl transition-colors"
            >
              View Certificate
            </Link>
            <Link
              to="/applications/new"
              className="px-4 py-2 text-xs font-bold bg-white hover:bg-rose-50 text-rose-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              Schedule Renewal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ))}

      {/* 3. Warning (8 - 15 Days) */}
      {warning.map((cert) => (
        <div 
          key={cert.certificateNumber}
          className="bg-amber-500/15 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-4 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                  15-Day Renewal Notice
                </span>
                <span className="text-xs font-bold text-amber-900">Expires in {getRemainingDays(cert.expiryDate)} days</span>
              </div>
              <p className="text-xs text-amber-900 font-medium">
                {cert.instrumentType} • Certificate <strong>{cert.certificateNumber}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Link
              to={`/certificates/${cert.certificateNumber}`}
              className="text-xs font-bold text-amber-900 hover:text-amber-800 underline underline-offset-4 flex items-center gap-1"
            >
              Inspect Certificate <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/applications/new"
              className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              Apply Early Renewal
            </Link>
          </div>
        </div>
      ))}

      {/* 4. Reminder (16 - 30 Days) */}
      {reminder.map((cert) => (
        <div 
          key={cert.certificateNumber}
          className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block">
                30-Day Periodic Verification Window
              </span>
              <p className="text-xs text-blue-900">
                {cert.instrumentType} ({cert.serialNumber}) validity expires on <strong>{cert.expiryDate}</strong> ({getRemainingDays(cert.expiryDate)} days).
              </p>
            </div>
          </div>

          <Link
            to={`/certificates/${cert.certificateNumber}`}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-end sm:self-center shrink-0"
          >
            Review Certificate <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ))}
    </div>
  );
}
