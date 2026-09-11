import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  Scale, 
  Award, 
  Building2, 
  Calendar, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TrackingTimeline from '../../components/TrackingTimeline';
import StatusBadge from '../../components/StatusBadge';

function formatAppDate(val) {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (val.toDate && typeof val.toDate === 'function') {
    return val.toDate().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  if (val.seconds) {
    return new Date(val.seconds * 1000).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  return String(val);
}

export default function ApplicationTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlId = searchParams.get('id') || '';
  const { applications } = useApp();

  const [inputVal, setInputVal] = useState(urlId || 'MV-2026-0941');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const targetId = urlId || inputVal;
    if (targetId) {
      const targetClean = targetId.trim().toLowerCase();
      const found = applications.find(a => a.id && a.id.toLowerCase() === targetClean);
      setSelectedApp(found || null);
    }
  }, [urlId, applications]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      const clean = inputVal.trim().toLowerCase();
      setSearchParams({ id: inputVal.trim() });
      const found = applications.find(a => a.id && a.id.toLowerCase() === clean);
      setSelectedApp(found || null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block">
            National Legal Metrology Tracking System
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
            Application Status & Stage Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1">
            Enter your unique Application ID to view the transparent step-by-step progress of your instrument verification.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. MV-2026-0941, MV-2026-0914"
              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none uppercase font-bold"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors"
          >
            Track Status
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-500">
          <span>Quick Demo IDs:</span>
          {['MV-2026-0941', 'MV-2026-0914', 'MV-2026-0889', 'MV-2026-0794'].map((demoId) => (
            <button
              key={demoId}
              type="button"
              onClick={() => {
                setInputVal(demoId);
                setSearchParams({ id: demoId });
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 rounded-lg font-mono font-medium transition-colors"
            >
              {demoId}
            </button>
          ))}
        </div>
      </div>

      {/* Tracking Result Card */}
      {selectedApp ? (
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    {selectedApp.id}
                  </span>
                  <StatusBadge status={selectedApp.status} size="md" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif mt-1">
                  {selectedApp.instrumentType}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedApp.manufacturer} • Model: {selectedApp.modelNumber} • S/N: <strong className="font-mono text-slate-700">{selectedApp.serialNumber}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/applications/${selectedApp.id}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  View Full Dossier
                </Link>
                {selectedApp.certificateId && (
                  <Link
                    to={`/certificates/${selectedApp.certificateId}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    Digital Certificate
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Applicant</span>
                <strong className="text-slate-800">{selectedApp.applicantName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Establishment</span>
                <strong className="text-slate-800">{selectedApp.businessName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Submitted On</span>
                <strong className="text-slate-800">{formatAppDate(selectedApp.submittedAt)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Officer</span>
                <strong className="text-teal-800">{selectedApp.assignedOfficer || 'Inspectorate Queue'}</strong>
              </div>
            </div>
          </div>

          {/* Detailed Visual Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Verification Progress Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Official audit log of all completed, active, and upcoming verification phases
              </p>
            </div>

            <TrackingTimeline timeline={selectedApp.timeline} currentStatus={selectedApp.status} />
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-500" />
          <h3 className="text-base font-bold text-slate-900">Application Not Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No active or archived verification application matches ID "{inputVal}". Please verify the application ID.
          </p>
        </div>
      )}
    </div>
  );
}
