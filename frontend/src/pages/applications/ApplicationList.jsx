import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Files, 
  Search, 
  Filter, 
  FilePlus2, 
  ChevronRight, 
  SearchCheck, 
  Calendar, 
  AlertTriangle,
  ArrowRight,
  Download
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

export default function ApplicationList() {
  const { currentRole, user } = useAuth();
  const { applications = [] } = useApp();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');

  // Role-aware application list (Applicants see their dossiers, Officers/Admins see all)
  const scopedApps = React.useMemo(() => {
    if (currentRole === ROLES.CONSUMER) {
      if (!user) return [];
      const userClean = (user.email || '').trim().toLowerCase();
      const userNameClean = (user.name || '').trim().toLowerCase();
      const userIdClean = user.id ? String(user.id) : null;

      return applications.filter((a) => {
        const emailMatch = userClean && a.applicantEmail && a.applicantEmail.trim().toLowerCase() === userClean;
        const nameMatch = userNameClean && a.applicantName && a.applicantName.trim().toLowerCase() === userNameClean;
        const uidMatch = userIdClean && a.applicantUid && String(a.applicantUid) === userIdClean;
        return emailMatch || nameMatch || uidMatch;
      });
    }
    return applications;
  }, [applications, currentRole, user]);

  const filteredApps = React.useMemo(() => {
    const query = (searchQuery || '').trim().toLowerCase();

    return scopedApps.filter((app) => {
      if (!app) return false;

      // Safe multi-field text matching
      if (query) {
        const fieldsToSearch = [
          app.id,
          app.applicantName,
          app.businessName,
          app.instrumentType,
          app.serialNumber,
          app.gstin,
          app.manufacturer,
          app.modelNumber,
          app.status
        ];

        const hasMatch = fieldsToSearch.some(
          (field) => typeof field === 'string' && field.toLowerCase().includes(query)
        );

        if (!hasMatch) return false;
      }

      const status = app.status || '';
      if (activeFilter === 'review') {
        return status === 'Under Review' || status === 'Application Submitted';
      }
      if (activeFilter === 'scheduled') {
        return status === 'Verification Scheduled' || status === 'Inspection in Progress';
      }
      if (activeFilter === 'returned') {
        return status === 'Returned for Correction';
      }
      if (activeFilter === 'completed') {
        return status === 'Certificate Generated' || status === 'Approved';
      }
      return true;
    });
  }, [scopedApps, searchQuery, activeFilter]);

  const handleExportCSV = () => {
    if (!filteredApps.length) {
      alert('No applications to export.');
      return;
    }
    const headers = [
      'Application ID',
      'Applicant Name',
      'Business Name',
      'GSTIN',
      'Instrument Type',
      'Manufacturer',
      'Model',
      'Serial Number',
      'Status',
      'Submitted Date'
    ];
    const rows = filteredApps.map((a) => [
      `"${a.id || ''}"`,
      `"${a.applicantName || ''}"`,
      `"${a.businessName || ''}"`,
      `"${a.gstin || ''}"`,
      `"${a.instrumentType || ''}"`,
      `"${a.manufacturer || ''}"`,
      `"${a.modelNumber || ''}"`,
      `"${a.serialNumber || ''}"`,
      `"${a.status || ''}"`,
      `"${formatAppDate(a.submittedAt)}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `applications_registry_${new Date().toISOString().slice(0, 10)}.csv`);
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
            {currentRole === ROLES.CONSUMER ? 'Applicant Registry' : 'Official Scrutiny Queue'}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            {currentRole === ROLES.CONSUMER ? 'My Applications & Dossiers' : 'Verification Applications Registry'}
          </h1>
          <p className="text-xs text-slate-500">
            Track and manage submitted weighing and measuring instrument dossiers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Download CSV report"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          <Link
            to="/applications/new"
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <FilePlus2 className="w-4 h-4" />
            New Application
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, trader, serial number, make..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: `All (${scopedApps.length})` },
            { id: 'review', label: 'Under Review' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'returned', label: 'Correction Needed' },
            { id: 'completed', label: 'Certified' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-4">Application ID</th>
                <th className="p-4">Applicant & Establishment</th>
                <th className="p-4">Instrument Details</th>
                <th className="p-4">Verification Stage</th>
                <th className="p-4">Submitted Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <tr key={app.id || Math.random()} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-teal-800">
                      <Link to={`/applications/${app.id}`} className="hover:underline">
                        {app.id || 'MV-PENDING'}
                      </Link>
                    </td>

                    <td className="p-4">
                      <strong className="text-slate-900 block font-bold">{app.applicantName || 'Applicant'}</strong>
                      <span className="text-slate-600 block">{app.businessName || 'Commercial Establishment'}</span>
                      <span className="font-mono text-[10px] text-slate-400">{app.gstin || '—'}</span>
                    </td>

                    <td className="p-4">
                      <strong className="text-slate-900 block">{app.instrumentType || 'Weighing Instrument'}</strong>
                      <span className="text-slate-500 block">
                        {(app.manufacturer || 'Standard')} • {(app.modelNumber || 'Model')}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">S/N: {app.serialNumber || 'SN-Pending'}</span>
                    </td>

                    <td className="p-4">
                      <StatusBadge status={app.status || 'Application Submitted'} size="sm" />
                      {app.status === 'Returned for Correction' && (
                        <span className="block text-[10px] text-amber-700 font-bold mt-1">
                          Applicant action required
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-500 font-mono">
                      {formatAppDate(app.submittedAt)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/track?id=${app.id}`}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <SearchCheck className="w-3.5 h-3.5 text-teal-600" />
                          Track
                        </Link>
                        <Link
                          to={`/applications/${app.id}`}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          Dossier
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 text-xs">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Files className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700">No applications matched your filter</p>
                      <p className="text-[11px] text-slate-400">
                        Try clearing your search term or apply for a new verification dossier.
                      </p>
                      <Link
                        to="/applications/new"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-bold mt-2"
                      >
                        <FilePlus2 className="w-3.5 h-3.5" /> Apply Now
                      </Link>
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
