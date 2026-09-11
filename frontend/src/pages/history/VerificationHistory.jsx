import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  Filter, 
  Award, 
  Calendar, 
  Scale, 
  CheckCircle2, 
  XCircle, 
  Download, 
  ExternalLink,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
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

export default function VerificationHistory() {
  const { currentRole, user } = useAuth();
  const { applications = [], certificates = [] } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('all');

  // Role-scoped records
  const scopedApps = React.useMemo(() => {
    if (currentRole === ROLES.CONSUMER && user?.email) {
      const userClean = user.email.trim().toLowerCase();
      const userNameClean = (user.name || '').trim().toLowerCase();
      const matched = applications.filter((a) => {
        const emailMatch = a.applicantEmail && a.applicantEmail.trim().toLowerCase() === userClean;
        const nameMatch = a.applicantName && a.applicantName.trim().toLowerCase() === userNameClean;
        const uidMatch = a.applicantUid && user.id && a.applicantUid === user.id;
        return emailMatch || nameMatch || uidMatch;
      });
      return matched.length > 0 ? matched : applications;
    }
    return applications;
  }, [applications, currentRole, user]);

  // Unified historical log of all application events, verification results, and issued certificates
  const historicalRecords = React.useMemo(() => {
    return scopedApps.map((app, idx) => {
      const cert = (certificates || []).find((c) => c.applicationId === app.id);
      let resultStr = 'PENDING VERIFICATION';
      if (app.status === 'Rejected') {
        resultStr = 'FAILED / REJECTED';
      } else if (cert || app.status === 'Approved' || app.status === 'Certificate Generated') {
        resultStr = 'PASSED & CERTIFIED';
      }

      return {
        id: app.id || `hist-${idx}`,
        applicationId: app.id || 'N/A',
        applicantName: app.applicantName || 'Applicant',
        businessName: app.businessName || 'Commercial Establishment',
        instrumentType: app.instrumentType || 'Weighing Instrument',
        serialNumber: app.serialNumber || 'SN-Pending',
        capacity: app.capacity || 'Standard',
        submittedDate: formatAppDate(app.submittedAt),
        verificationDate: formatAppDate(cert?.verificationDate || app.inspectionData?.inspectionDate || app.scheduledDate) || 'In Scrutiny',
        certificateNumber: cert?.certificateNumber || app.certificateId || null,
        sealNumber: cert?.sealNumber || app.inspectionData?.sealNumber || null,
        status: app.status || 'Under Scrutiny',
        result: resultStr,
        assignedOfficer: app.assignedOfficer || 'Legal Metrology Officer'
      };
    });
  }, [scopedApps, certificates]);

  const filteredHistory = React.useMemo(() => {
    const query = (searchTerm || '').trim().toLowerCase();

    return historicalRecords.filter((rec) => {
      if (query) {
        const fieldsToSearch = [
          rec.applicationId,
          rec.applicantName,
          rec.businessName,
          rec.instrumentType,
          rec.serialNumber,
          rec.certificateNumber,
          rec.sealNumber,
          rec.assignedOfficer
        ];

        const hasMatch = fieldsToSearch.some(
          (field) => typeof field === 'string' && field.toLowerCase().includes(query)
        );

        if (!hasMatch) return false;
      }

      const resUpper = (rec.result || '').toUpperCase();
      if (outcomeFilter === 'passed') return resUpper.includes('PASSED');
      if (outcomeFilter === 'rejected') return resUpper.includes('REJECTED');
      if (outcomeFilter === 'pending') return resUpper.includes('PENDING');
      return true;
    });
  }, [historicalRecords, searchTerm, outcomeFilter]);

  const handleExportAuditTrail = () => {
    if (!filteredHistory.length) {
      alert('No history records available to export.');
      return;
    }
    const headers = [
      'Application ID',
      'Applicant',
      'Business Establishment',
      'Instrument Specifications',
      'Serial Number',
      'Capacity',
      'Applied Date',
      'Verification Date',
      'Outcome / Result',
      'Certificate Number',
      'Seal Number',
      'Assigned Officer'
    ];
    const rows = filteredHistory.map((r) => [
      `"${r.applicationId}"`,
      `"${r.applicantName}"`,
      `"${r.businessName}"`,
      `"${r.instrumentType}"`,
      `"${r.serialNumber}"`,
      `"${r.capacity}"`,
      `"${r.submittedDate}"`,
      `"${r.verificationDate}"`,
      `"${r.result}"`,
      `"${r.certificateNumber || 'N/A'}"`,
      `"${r.sealNumber || 'N/A'}"`,
      `"${r.assignedOfficer}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statutory_verification_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold text-teal-700 tracking-wider block">
            Statutory Audit Log
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            {currentRole === ROLES.CONSUMER ? 'My Verification History' : 'Centralized Verification History'}
          </h1>
          <p className="text-xs text-slate-500">
            Historical repository of weighing and measuring instrument inspections, results, and certificates
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportAuditTrail}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          title="Download statutory audit log in CSV format"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Audit Trail
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search history by ID, trader, serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: `All History (${historicalRecords.length})` },
            { id: 'passed', label: 'Passed & Stamped' },
            { id: 'pending', label: 'In Progress' },
            { id: 'rejected', label: 'Rejected / Defective' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setOutcomeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                outcomeFilter === tab.id
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-4">App Ref & Date</th>
                <th className="p-4">Applicant & Establishment</th>
                <th className="p-4">Instrument Specifications</th>
                <th className="p-4">Verification Result</th>
                <th className="p-4">Certificate & Seal</th>
                <th className="p-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <Link to={`/applications/${rec.applicationId}`} className="font-mono font-bold text-teal-800 hover:underline block">
                        {rec.applicationId}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        Applied: {rec.submittedDate}
                      </span>
                    </td>

                    <td className="p-4">
                      <strong className="text-slate-900 block font-bold">{rec.applicantName}</strong>
                      <span className="text-slate-600 block">{rec.businessName}</span>
                    </td>

                    <td className="p-4">
                      <strong className="text-slate-900 block">{rec.instrumentType}</strong>
                      <span className="font-mono text-teal-900 text-[11px] block">S/N: {rec.serialNumber}</span>
                      <span className="text-[10px] text-slate-400 block">Cap: {rec.capacity}</span>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        rec.result.includes('PASSED')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : rec.result.includes('REJECTED')
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>
                        {rec.result.includes('PASSED') && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {rec.result.includes('REJECTED') && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                        {rec.result}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Inspector: {rec.assignedOfficer}
                      </span>
                    </td>

                    <td className="p-4">
                      {rec.certificateNumber ? (
                        <div>
                          <Link to={`/certificates/${rec.certificateNumber}`} className="font-mono font-bold text-teal-700 hover:underline flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-teal-600" />
                            {rec.certificateNumber}
                          </Link>
                          <span className="font-mono text-[10px] text-amber-800 block mt-0.5">
                            Seal: {rec.sealNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Certificate Issued</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        to={`/applications/${rec.applicationId}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-block"
                      >
                        Inspect Record
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 text-xs">
                    <div className="max-w-sm mx-auto space-y-2">
                      <History className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700">No verification history records found</p>
                      <p className="text-[11px] text-slate-400">
                        Adjust your search filters or check back after an inspection is completed.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
