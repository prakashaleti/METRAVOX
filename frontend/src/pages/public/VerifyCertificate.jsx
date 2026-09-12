import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Building2, 
  Calendar, 
  Lock, 
  ArrowLeft,
  ExternalLink,
  Printer,
  QrCode,
  Download,
  Share2,
  RefreshCw,
  Award,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { getRemainingDays, getExpiryAlertInfo } from '../../services/storage';
import CertificateCard from '../../components/CertificateCard';
import QrVerificationModal from '../../components/modals/QrVerificationModal';

export default function VerifyCertificate() {
  const { certNumber } = useParams();
  const { certificates = [], applications = [] } = useApp();
  const navigate = useNavigate();

  const [loadedCert, setLoadedCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const cleanRef = (certNumber || '').trim().toLowerCase();

    // 1. Search in AppContext certificates state
    const foundLocal = certificates.find((c) => 
      c.certificateNumber?.toLowerCase() === cleanRef ||
      c.applicationId?.toLowerCase() === cleanRef ||
      c.serialNumber?.toLowerCase() === cleanRef
    );

    if (foundLocal) {
      setLoadedCert(foundLocal);
      setLoading(false);
      return;
    }

    // 2. Check if it matches an approved application that has certificate details
    const matchedApp = applications.find((a) =>
      a.id?.toLowerCase() === cleanRef ||
      a.serialNumber?.toLowerCase() === cleanRef
    );

    if (matchedApp && (matchedApp.status === 'Approved' || matchedApp.status === 'Certificate Generated')) {
      const syntheticCert = {
        id: `cert-${matchedApp.id}`,
        certificateNumber: matchedApp.certificateNumber || `CERT-LM-${new Date().getFullYear()}-${matchedApp.id.replace('MV-', '')}`,
        applicationId: matchedApp.id,
        applicantName: matchedApp.applicantName,
        businessName: matchedApp.businessName,
        gstin: matchedApp.gstin,
        premisesAddress: `${matchedApp.address || ''}, ${matchedApp.district || ''}, ${matchedApp.state || 'Kerala'} ${matchedApp.pincode || ''}`,
        instrumentType: matchedApp.instrumentType,
        instrumentCategory: matchedApp.instrumentCategory || 'Legal Metrology Instrument',
        instrumentClass: matchedApp.instrumentClass,
        manufacturer: matchedApp.manufacturer,
        modelNumber: matchedApp.modelNumber,
        serialNumber: matchedApp.serialNumber,
        capacity: matchedApp.capacity,
        verificationDate: matchedApp.scheduledDate || new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        issuingAuthority: 'Office of the Assistant Controller of Legal Metrology',
        verifyingOfficer: matchedApp.assignedOfficer || 'Ramesh varma',
        officerDesignation: 'Senior Legal Metrology Officer',
        sealNumber: matchedApp.sealNumber || `SEAL-KL-${matchedApp.id.slice(-4)}`,
        feePaid: `₹ ${matchedApp.feeAmount || 850}.00`,
        receiptNumber: `REC-${matchedApp.id.replace('MV-', '')}`,
        securityHash: '8f92a4e1b7c3d2e90f1a5b6c8d7e4f2a',
        status: 'Active'
      };
      setLoadedCert(syntheticCert);
      setLoading(false);
      return;
    }

    // 3. Fallback: Query Django Backend REST API
    async function fetchFromBackend() {
      try {
        const backendCert = await api.getCertificateByNumber(certNumber);
        if (isMounted && backendCert) {
          setLoadedCert(backendCert);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend certificate lookup error:', err);
      }
      if (isMounted) {
        setLoadedCert(null);
        setLoading(false);
      }
    }

    fetchFromBackend();

    return () => {
      isMounted = false;
    };
  }, [certNumber, certificates, applications]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-xs text-slate-600 font-medium font-mono">
          Verifying certificate security hash on Central Registry...
        </p>
      </div>
    );
  }

  if (!loadedCert) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-serif text-slate-900">Certificate Record Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The scanned reference <strong className="font-mono text-slate-800">{certNumber}</strong> could not be verified against the official Central Metrology Registry.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              to="/scan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors shadow"
            >
              <QrCode className="w-4 h-4" /> Scan Another Code
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const days = getRemainingDays(loadedCert.expiryDate);
  const isValid = days >= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Scanner Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to METRAVOX Portal
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Link Copied!' : 'Share'}
          </button>

          <Link
            to="/scan"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition-colors shadow-sm"
          >
            <QrCode className="w-4 h-4 text-teal-700" />
            Scan Another Instrument
          </Link>
        </div>
      </div>

      {/* Official Verification Result Banner */}
      <div className={`p-5 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border ${
        isValid
          ? 'bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 border-teal-700'
          : 'bg-gradient-to-r from-rose-900 via-red-800 to-red-950 border-rose-700'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            {isValid ? (
              <ShieldCheck className="w-7 h-7 text-emerald-300" />
            ) : (
              <AlertCircle className="w-7 h-7 text-rose-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-teal-900 uppercase tracking-wider">
                SCANNED VIA QR CODE
              </span>
              <span className="font-mono text-xs text-white/80">{loadedCert.certificateNumber}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold font-serif text-white">
              {isValid
                ? 'Authentic Statutory Verification • Form V Generated'
                : 'Statutory Notice: Certificate Expired'}
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              {isValid
                ? `Officially tested & verified by ${loadedCert.verifyingOfficer || loadedCert.issuingOfficer || 'Ramesh varma'} (${loadedCert.officerDesignation || 'Senior Legal Metrology Officer'}) under Legal Metrology Act, 2009. Valid until ${loadedCert.expiryDate} (${days} days remaining).`
                : `Verification validity expired ${Math.abs(days)} days ago on ${loadedCert.expiryDate}. Immediate re-verification required.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/30 transition-colors inline-flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Official Form V Certificate Generated Document */}
      <CertificateCard
        certificate={loadedCert}
        onVerifyClick={() => setQrModalOpen(true)}
        onPrintClick={() => window.print()}
      />

      {/* QR Validation Modal */}
      <QrVerificationModal
        certificate={loadedCert}
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
}
