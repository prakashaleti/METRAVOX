import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CertificateCard from '../../components/CertificateCard';
import QrVerificationModal from '../../components/modals/QrVerificationModal';

export default function CertificateDetail() {
  const { id } = useParams();
  const { certificates } = useApp();
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const certificate = certificates.find(c => c.certificateNumber.toLowerCase() === id?.toLowerCase());

  if (!certificate) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-lg mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-rose-500" />
        <h3 className="text-lg font-bold text-slate-900">Certificate Not Found</h3>
        <p className="text-xs text-slate-500">
          No certificate record found matching number "{id}".
        </p>
        <Link to="/certificates" className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold inline-block">
          Return to Certificates
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top navigation breadcrumb */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/certificates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Certificates Registry
        </Link>

        <span className="text-xs text-slate-500 font-mono">
          Certificate ID: <strong className="text-slate-900">{certificate.certificateNumber}</strong>
        </span>
      </div>

      {/* Official Certificate Presentation Card */}
      <CertificateCard
        certificate={certificate}
        onVerifyClick={() => setQrModalOpen(true)}
      />

      {/* QR Validation Modal */}
      <QrVerificationModal
        certificate={certificate}
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
}
