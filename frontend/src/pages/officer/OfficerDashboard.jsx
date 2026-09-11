import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Scale, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  FileText, 
  User, 
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import ReturnCorrectionModal from '../../components/modals/ReturnCorrectionModal';
import ScheduleInspectionModal from '../../components/modals/ScheduleInspectionModal';
import RecordInspectionModal from '../../components/modals/RecordInspectionModal';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const { 
    applications, 
    returnApplication, 
    scheduleVerification, 
    approveAndGenerateCertificate, 
    rejectApplication 
  } = useApp();

  const [filterTab, setFilterTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [activeModalApp, setActiveModalApp] = useState(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  const pendingReview = applications.filter(a => a.status === 'Application Submitted' || a.status === 'Under Review');
  const scheduled = applications.filter(a => a.status === 'Verification Scheduled');
  const inspections = applications.filter(a => a.status === 'Inspection in Progress');
  const returned = applications.filter(a => a.status === 'Returned for Correction');
  const completed = applications.filter(a => a.status === 'Certificate Generated' || a.status === 'Approved');

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.instrumentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'pending') return app.status === 'Application Submitted' || app.status === 'Under Review';
    if (filterTab === 'scheduled') return app.status === 'Verification Scheduled';
    if (filterTab === 'returned') return app.status === 'Returned for Correction';
    if (filterTab === 'completed') return app.status === 'Certificate Generated' || app.status === 'Approved';
    return true;
  });

  const handleOpenReturn = (app) => {
    setActiveModalApp(app);
    setReturnModalOpen(true);
  };

  const handleOpenSchedule = (app) => {
    setActiveModalApp(app);
    setScheduleModalOpen(true);
  };

  const handleOpenInspect = (app) => {
    setActiveModalApp(app);
    setInspectModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Officer Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                Legal Metrology Inspectorate
              </span>
              <span className="text-xs text-indigo-200 font-mono">Badge: {user.badgeNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              Officer Console • {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {user.roleTitle} • {user.organization}. Scrutinize applications, assign inspection slots, verify tolerance error limits, and issue Form V certificates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] uppercase text-indigo-200 block font-bold">Jurisdiction Zone</span>
              <span className="text-sm font-bold text-white font-mono">{user.district}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Officer Workload Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div 
          onClick={() => setFilterTab('pending')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Scrutiny Queue</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-900">{pendingReview.length}</span>
            <span className="text-xs text-indigo-600">Pending Scrutiny</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-indigo-700 font-bold flex items-center justify-between">
            <span>Filter Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => setFilterTab('scheduled')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card cursor-pointer hover:border-teal-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Inspections</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-teal-900">{scheduled.length}</span>
            <span className="text-xs text-teal-600">Ready for Field Test</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-teal-700 font-bold flex items-center justify-between">
            <span>Filter Scheduled</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => setFilterTab('returned')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card cursor-pointer hover:border-amber-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Returned for Correction</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-900">{returned.length}</span>
            <span className="text-xs text-amber-600">Awaiting Trader</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-amber-700 font-bold flex items-center justify-between">
            <span>Filter Returned</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => setFilterTab('completed')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Certificates Issued</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-900">{completed.length}</span>
            <span className="text-xs text-emerald-600">Stamped & Certified</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-bold flex items-center justify-between">
            <span>Filter Certified</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 3. Main Scrutiny & Verification Worklist */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Verification Dossier Management & Scrutiny Worklist
            </h3>
            <p className="text-xs text-slate-500">
              Review documents, accept/schedule, return for correction, or record verification test findings
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ID, trader, instrument..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-56 sm:w-64"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Scrutiny Queue' },
                { id: 'scheduled', label: 'Scheduled' },
                { id: 'returned', label: 'Returned' },
                { id: 'completed', label: 'Certified' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filterTab === tab.id
                      ? 'bg-white text-indigo-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Worklist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-4">App ID & Date</th>
                <th className="p-4">Applicant & Establishment</th>
                <th className="p-4">Instrument Specifications</th>
                <th className="p-4">Status</th>
                <th className="p-4">Documents</th>
                <th className="p-4 text-right">Officer Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Col 1: ID & Date */}
                    <td className="p-4 align-top">
                      <Link to={`/applications/${app.id}`} className="font-mono font-bold text-indigo-700 hover:underline block text-xs">
                        {app.id}
                      </Link>
                      <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                        {app.submittedAt}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{app.verificationNature}</span>
                    </td>

                    {/* Col 2: Applicant */}
                    <td className="p-4 align-top">
                      <strong className="text-slate-900 font-bold block">{app.applicantName}</strong>
                      <span className="text-slate-600 block">{app.businessName}</span>
                      <span className="font-mono text-[11px] text-slate-500 block">GSTIN: {app.gstin}</span>
                    </td>

                    {/* Col 3: Instrument */}
                    <td className="p-4 align-top">
                      <strong className="text-slate-900 block font-semibold">{app.instrumentType}</strong>
                      <span className="text-slate-500 block">{app.manufacturer} • {app.modelNumber}</span>
                      <span className="font-mono text-slate-500 block text-[11px]">S/N: {app.serialNumber}</span>
                      <span className="text-[11px] text-teal-700 font-medium block">Cap: {app.capacity}</span>
                    </td>

                    {/* Col 4: Status */}
                    <td className="p-4 align-top">
                      <StatusBadge status={app.status} size="sm" />
                      {app.scheduledDate && (
                        <div className="mt-1 text-[11px] text-teal-800 font-medium">
                          Slot: {app.scheduledDate}
                        </div>
                      )}
                      {app.returnReason && (
                        <div className="mt-1 text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 line-clamp-2 max-w-xs">
                          {app.returnReason}
                        </div>
                      )}
                    </td>

                    {/* Col 5: Documents */}
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{app.documents?.length || 0} Files</span>
                      </div>
                      <Link to={`/applications/${app.id}`} className="text-[11px] text-indigo-700 hover:underline block mt-0.5 font-bold">
                        Inspect Files →
                      </Link>
                    </td>

                    {/* Col 6: Action Buttons */}
                    <td className="p-4 align-top text-right">
                      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1.5">
                        <Link
                          to={`/applications/${app.id}`}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors"
                        >
                          Dossier
                        </Link>

                        {/* Officer Workflow Actions */}
                        {(app.status === 'Application Submitted' || app.status === 'Under Review') && (
                          <>
                            <button
                              onClick={() => handleOpenReturn(app)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-lg text-[11px] transition-colors"
                              title="Return for Missing / Incomplete Documents"
                            >
                              Return
                            </button>
                            <button
                              onClick={() => handleOpenSchedule(app)}
                              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-[11px] transition-colors shadow-sm"
                            >
                              Schedule Test
                            </button>
                          </>
                        )}

                        {app.status === 'Verification Scheduled' && (
                          <button
                            onClick={() => handleOpenInspect(app)}
                            className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg text-[11px] transition-colors shadow-sm flex items-center gap-1"
                          >
                            <Scale className="w-3 h-3" />
                            Record Test & Stamp
                          </button>
                        )}

                        {app.status === 'Certificate Generated' && (
                          <Link
                            to={`/certificates/${app.certificateId || 'CERT-LM-2026-004812'}`}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-[11px] transition-colors"
                          >
                            View Cert
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 text-xs">
                    No applications found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modals for Officer Execution */}
      <ReturnCorrectionModal
        application={activeModalApp}
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={(id, reason) => returnApplication(id, reason)}
      />

      <ScheduleInspectionModal
        application={activeModalApp}
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onConfirm={(id, scheduleData) => scheduleVerification(id, scheduleData)}
      />

      <RecordInspectionModal
        application={activeModalApp}
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        onApprove={(id, inspectionData) => approveAndGenerateCertificate(id, inspectionData)}
        onReject={(id, reason) => rejectApplication(id, reason)}
      />
    </div>
  );
}
