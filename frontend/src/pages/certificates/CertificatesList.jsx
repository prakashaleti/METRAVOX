import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Search, 
  Filter, 
  QrCode, 
  Download, 
  Printer, 
  ChevronRight, 
  ShieldCheck, 
  Calendar, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getRemainingDays, getExpiryAlertInfo } from '../../services/storage';
import QrVerificationModal from '../../components/modals/QrVerificationModal';

export default function CertificatesList() {
  const { currentRole, user } = useAuth();
  const { certificates = [] } = useApp();
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQrCert, setActiveQrCert] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const scopedCerts = React.useMemo(() => {
    if (currentRole === ROLES.CONSUMER) {
      if (!user) return [];
      const userClean = (user.email || '').trim().toLowerCase();
      const userNameClean = (user.name || '').trim().toLowerCase();
      const userIdClean = user.id ? String(user.id) : null;

      return certificates.filter((c) => {
        const emailMatch = userClean && c.applicantEmail && c.applicantEmail.trim().toLowerCase() === userClean;
        const nameMatch = userNameClean && c.applicantName && c.applicantName.trim().toLowerCase() === userNameClean;
        const uidMatch = userIdClean && c.applicantUid && String(c.applicantUid) === userIdClean;
        return emailMatch || nameMatch || uidMatch;
      });
    }
    return certificates;
  }, [certificates, currentRole, user]);

  const filteredCerts = scopedCerts.filter((cert) => {
    if (!cert) return false;
    const days = getRemainingDays(cert.expiryDate);
    const query = (searchQuery || '').trim().toLowerCase();
    const matchesSearch = !query || [
      cert.certificateNumber,
      cert.applicantName,
      cert.businessName,
      cert.instrumentType,
      cert.serialNumber,
      cert.sealNumber
    ].some(val => typeof val === 'string' && val.toLowerCase().includes(query));

    if (!matchesSearch) return false;
    if (filterType === 'active') return days > 30;
    if (filterType === 'expiring') return days >= 0 && days <= 30;
    if (filterType === 'expired') return days < 0;
    return true;
  });

  const handleOpenQr = (cert) => {
    setActiveQrCert(cert);
    setQrModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold text-teal-700 tracking-wider block">
            Central Digital Registry
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            Digital Certificates of Verification
          </h1>
          <p className="text-xs text-slate-500">
            Form V / Schedule IX Official Legal Metrology Verification Certificates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/applications/new"
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Apply for Renewal
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search certificate #, make, serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {[
            { id: 'all', label: `All (${scopedCerts.length})` },
            { id: 'active', label: 'Valid & Certified' },
            { id: 'expiring', label: 'Expiring Soon (<= 30d)' },
            { id: 'expired', label: 'Expired' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-4">Certificate #</th>
                <th className="p-4">Applicant & Establishment</th>
                <th className="p-4">Instrument Specifications</th>
                <th className="p-4">Verification Date</th>
                <th className="p-4">Validity / Expiry Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredCerts.length > 0 ? (
                filteredCerts.map((cert) => {
                  const days = getRemainingDays(cert.expiryDate);
                  const expiryInfo = getExpiryAlertInfo(cert.expiryDate);

                  return (
                    <tr key={cert.certificateNumber} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-teal-900">
                        <Link to={`/certificates/${cert.certificateNumber}`} className="hover:underline flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          {cert.certificateNumber}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          Ref: {cert.applicationId}
                        </span>
                      </td>

                      <td className="p-4">
                        <strong className="text-slate-900 block font-bold">{cert.applicantName}</strong>
                        <span className="text-slate-600 block">{cert.businessName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{cert.gstin}</span>
                      </td>

                      <td className="p-4">
                        <strong className="text-slate-900 block">{cert.instrumentType}</strong>
                        <span className="text-slate-500 block">{cert.manufacturer} • {cert.modelNumber}</span>
                        <span className="font-mono text-[11px] text-teal-800">S/N: {cert.serialNumber}</span>
                      </td>

                      <td className="p-4 text-slate-600 font-mono">
                        {cert.verificationDate}
                        <span className="text-[10px] text-slate-400 block font-sans">Seal: {cert.sealNumber}</span>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${expiryInfo.badgeClass}`}>
                          {expiryInfo.level}: {days > 0 ? `${days} days left` : `${Math.abs(days)}d overdue`}
                        </span>
                        <span className="block text-[11px] text-slate-500 font-mono mt-1">
                          Valid until {cert.expiryDate}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenQr(cert)}
                            className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-200"
                            title="Scan / Authenticate QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <Link
                            to={`/certificates/${cert.certificateNumber}`}
                            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            View Form V
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 text-xs">
                    No certificates matched your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Validation Modal */}
      <QrVerificationModal
        certificate={activeQrCert}
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
}
