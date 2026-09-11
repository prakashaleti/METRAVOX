import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FilePlus2, 
  Files, 
  Award, 
  Clock, 
  AlertTriangle, 
  SearchCheck, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Scale, 
  Calendar,
  Building,
  QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import ExpiryAlertBanner from '../../components/ExpiryAlertBanner';
import StatusBadge from '../../components/StatusBadge';
import { getRemainingDays } from '../../services/storage';

export default function ConsumerDashboard() {
  const { user } = useAuth();
  const { applications, certificates, certificateExpirySummary } = useApp();

  const myApplications = applications;
  const myCertificates = certificates;

  const inReviewCount = myApplications.filter(a => a.status === 'Under Review' || a.status === 'Application Submitted').length;
  const returnedCount = myApplications.filter(a => a.status === 'Returned for Correction').length;
  const scheduledCount = myApplications.filter(a => a.status === 'Verification Scheduled').length;
  const activeCertsCount = myCertificates.filter(c => getRemainingDays(c.expiryDate) > 0).length;

  return (
    <div className="space-y-6">
      {/* 1. Welcome & Business Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-500/20 border border-teal-400/30 text-teal-300">
                Registered Trader Portal
              </span>
              <span className="text-xs text-teal-200 font-mono">GSTIN: {user.gstin}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {user.organization} • {user.district}, {user.state}. Manage weighing & measuring instrument verifications and statutory certificates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/applications/new"
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <FilePlus2 className="w-4 h-4" />
              Apply New Verification
            </Link>
            <Link
              to="/track"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <SearchCheck className="w-4 h-4 text-teal-300" />
              Track by App ID
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Expiry Alert System Banners */}
      <ExpiryAlertBanner />

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Applications</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{myApplications.length}</span>
            <span className="text-xs text-slate-500">across 2025-2026</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Scheduled: <strong className="text-teal-700 font-bold">{scheduledCount}</strong></span>
            <Link to="/applications" className="text-teal-700 hover:underline font-bold">View all →</Link>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Under Review</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-900">{inReviewCount}</span>
            <span className="text-xs text-indigo-600">With Officer</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            {returnedCount > 0 ? (
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {returnedCount} need correction
              </span>
            ) : (
              <span className="text-slate-500">Normal scrutiny</span>
            )}
            <Link to="/applications" className="text-indigo-700 hover:underline font-bold">Queue →</Link>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Certificates</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-900">{activeCertsCount}</span>
            <span className="text-xs text-emerald-600 font-medium">Verified Valid</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Stamping compliant</span>
            <Link to="/certificates" className="text-emerald-700 hover:underline font-bold">Certificates →</Link>
          </div>
        </div>

        {/* Card 4 */}
        <div className={`p-5 rounded-2xl border shadow-card transition-all ${
          certificateExpirySummary.totalActionRequired > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expiring / Overdue</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              certificateExpirySummary.totalActionRequired > 0 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${certificateExpirySummary.totalActionRequired > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {certificateExpirySummary.totalActionRequired}
            </span>
            <span className="text-xs text-slate-500">Instruments</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
            <span className="text-rose-700 font-bold">
              {certificateExpirySummary.urgent.length} urgent • {certificateExpirySummary.expired.length} expired
            </span>
            <Link to="/notifications" className="text-rose-700 hover:underline font-bold">Resolve →</Link>
          </div>
        </div>
      </div>

      {/* 4. Applications Status & Visual Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-serif">Recent Verification Applications</h3>
              <p className="text-xs text-slate-500">Track current status, scrutiny notes, and inspection schedules</p>
            </div>
            <Link to="/applications" className="text-xs font-bold text-teal-700 hover:underline">
              View All Applications →
            </Link>
          </div>

          <div className="space-y-3">
            {myApplications.slice(0, 4).map((app) => (
              <div 
                key={app.id} 
                className="p-4 rounded-xl border border-slate-200/80 hover:border-teal-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{app.id}</span>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">{app.instrumentType}</h4>
                  <p className="text-xs text-slate-500">
                    Make: {app.manufacturer} • Model: {app.modelNumber} • Serial: <span className="font-mono">{app.serialNumber}</span>
                  </p>
                  {app.status === 'Returned for Correction' && (
                    <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1.5 font-medium">
                      <strong>Correction Needed:</strong> {app.returnReason?.slice(0, 110)}...
                    </p>
                  )}
                  {app.status === 'Verification Scheduled' && (
                    <p className="text-xs text-teal-800 bg-teal-50 p-1.5 rounded-lg border border-teal-200 mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      Scheduled for {app.scheduledDate} ({app.scheduledSlot})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    to={`/track?id=${app.id}`}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                  >
                    <SearchCheck className="w-3.5 h-3.5 text-teal-600" />
                    Timeline
                  </Link>
                  <Link
                    to={`/applications/${app.id}`}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg border border-teal-200 transition-colors flex items-center gap-1"
                  >
                    Dossier
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Certified Instruments (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-serif">Verified Instruments</h3>
                <p className="text-xs text-slate-500">Legal certificates & validity</p>
              </div>
              <Link to="/certificates" className="text-xs font-bold text-teal-700 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {myCertificates.slice(0, 3).map((cert) => {
                const days = getRemainingDays(cert.expiryDate);
                const isOverdue = days < 0;
                const isCritical = days <= 7;

                return (
                  <div key={cert.certificateNumber} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-700">{cert.certificateNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOverdue
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : isCritical
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : days <= 15
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {isOverdue ? `Expired (${Math.abs(days)}d)` : `${days} days left`}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{cert.instrumentType}</h5>
                    <p className="text-[11px] text-slate-500">Seal: <span className="font-mono font-medium">{cert.sealNumber}</span></p>

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <Link
                        to={`/certificates/${cert.certificateNumber}`}
                        className="text-teal-700 hover:underline font-bold text-[11px] flex items-center gap-0.5"
                      >
                        Digital Certificate <ArrowRight className="w-3 h-3" />
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">Exp: {cert.expiryDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/applications/new"
              className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <FilePlus2 className="w-4 h-4" />
              Apply for Instrument Verification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
