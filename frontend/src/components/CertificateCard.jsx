import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  ShieldCheck, 
  Award, 
  Printer, 
  Download, 
  QrCode, 
  Calendar, 
  CheckCircle2, 
  ExternalLink,
  Hash,
  Scale
} from 'lucide-react';
import { getExpiryAlertInfo, getRemainingDays } from '../services/storage';

export default function CertificateCard({ certificate, onVerifyClick, onPrintClick }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const certRef = useRef(null);

  useEffect(() => {
    if (!certificate) return;
    // Generate QR code data URL pointing to verification link
    const verificationUrl = `${window.location.origin}/#/verify/${encodeURIComponent(certificate.certificateNumber)}`;
    QRCode.toDataURL(verificationUrl, {
      width: 160,
      margin: 1,
      color: {
        dark: '#0f766e',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [certificate]);

  if (!certificate) return null;

  const expiryInfo = getExpiryAlertInfo(certificate.expiryDate);
  const remainingDays = getRemainingDays(certificate.expiryDate);

  const handlePrint = () => {
    if (onPrintClick) {
      onPrintClick();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Ribbon (Hidden when printing) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${expiryInfo.badgeClass}`}>
            {expiryInfo.level} ({remainingDays > 0 ? `${remainingDays} days left` : `${Math.abs(remainingDays)} days overdue`})
          </span>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Security Hash: {certificate.securityHash?.slice(0, 12)}...
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onVerifyClick && (
            <button
              onClick={() => onVerifyClick(certificate)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
            >
              <QrCode className="w-4 h-4" />
              Scan / Validate QR
            </button>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Certificate
          </button>
        </div>
      </div>

      {/* Official Certificate Paper Document */}
      <div 
        ref={certRef}
        className="certificate-card relative bg-white text-slate-900 rounded-2xl border-4 border-double border-teal-800 p-6 sm:p-10 shadow-elevated overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(#0f766e08 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px'
        }}
      >
        {/* Subtle Watermark Emblem */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.035]">
          <Scale className="w-96 h-96 text-teal-900" />
        </div>

        {/* Certificate Header */}
        <div className="text-center border-b-2 border-teal-700/40 pb-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* National emblem placeholder badge */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-teal-800 to-teal-950 flex items-center justify-center shadow-md border-2 border-amber-300 text-white">
              <Scale className="w-6 h-6" />
            </div>
          </div>
          
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-slate-600">
            Government of India • Ministry of Consumer Affairs, Food & Public Distribution
          </p>
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-teal-950 font-serif mt-1">
            Department of Legal Metrology
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            (Under the Legal Metrology Act, 2009 & The Legal Metrology General Rules, 2011)
          </p>

          <div className="inline-block mt-4 px-6 py-1.5 bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 text-white rounded-md shadow-sm">
            <h1 className="text-sm sm:text-base font-bold uppercase tracking-widest font-serif">
              Certificate of Verification
            </h1>
            <p className="text-[10px] text-teal-100 tracking-wider">FORM V / SCHEDULE IX</p>
          </div>
        </div>

        {/* Certificate Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Certificate Number</span>
            <strong className="font-mono text-teal-900 font-bold text-sm block">
              {certificate.certificateNumber}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Application Reference</span>
            <strong className="font-mono text-slate-800 font-semibold block">
              {certificate.applicationId}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Verification Date</span>
            <strong className="text-slate-800 font-semibold block">
              {certificate.verificationDate}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Valid Until / Expiry</span>
            <strong className={`font-semibold block ${remainingDays <= 15 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}`}>
              {certificate.expiryDate}
            </strong>
          </div>
        </div>

        {/* Legal Text & Declarations */}
        <div className="text-xs sm:text-sm leading-relaxed text-slate-700 space-y-4 mb-6">
          <p>
            This is to certify that the weighing and measuring instrument described hereunder belonging to{' '}
            <strong className="text-slate-950 font-bold underline decoration-teal-500 underline-offset-4">
              {certificate.applicantName} ({certificate.businessName})
            </strong>{' '}
            holding GSTIN{' '}
            <span className="font-mono font-semibold text-slate-900">{certificate.gstin}</span>, situated at{' '}
            <span className="font-medium text-slate-900">{certificate.premisesAddress}</span>, has been officially inspected, tested, and verified in accordance with the provisions of the Legal Metrology Act, 2009 and the Rules made thereunder.
          </p>
        </div>

        {/* Instrument Specifications Table */}
        <div className="overflow-hidden border border-slate-300 rounded-xl mb-6">
          <div className="bg-teal-900 text-white px-4 py-2 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Verified Instrument Specifications</span>
            <span className="font-mono text-[11px] text-teal-200">Class: {certificate.instrumentClass}</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr className="divide-x divide-slate-200">
                <td className="p-3 bg-slate-50 font-semibold text-slate-600 w-1/3">Instrument Category & Type</td>
                <td className="p-3 font-medium text-slate-900">{certificate.instrumentType}</td>
              </tr>
              <tr className="divide-x divide-slate-200">
                <td className="p-3 bg-slate-50 font-semibold text-slate-600">Manufacturer / Make</td>
                <td className="p-3 font-medium text-slate-900">{certificate.manufacturer}</td>
              </tr>
              <tr className="divide-x divide-slate-200">
                <td className="p-3 bg-slate-50 font-semibold text-slate-600">Model & Serial Number</td>
                <td className="p-3 font-mono text-slate-900">
                  Model: <strong className="text-slate-950">{certificate.modelNumber}</strong> | Serial No: <strong className="text-teal-900">{certificate.serialNumber}</strong>
                </td>
              </tr>
              <tr className="divide-x divide-slate-200">
                <td className="p-3 bg-slate-50 font-semibold text-slate-600">Rated Capacity / Verification Interval (e)</td>
                <td className="p-3 font-medium text-slate-900">{certificate.capacity}</td>
              </tr>
              <tr className="divide-x divide-slate-200">
                <td className="p-3 bg-slate-50 font-semibold text-slate-600">Official Stamp / Seal Identification</td>
                <td className="p-3 font-mono font-bold text-amber-900">{certificate.sealNumber}</td>
              </tr>
              <tr className="divide-x divide-slate-200">
                <td className="p-3 bg-slate-50 font-semibold text-slate-600">Statutory Verification Fee Paid</td>
                <td className="p-3 font-medium text-slate-900">{certificate.feePaid} (Ref: {certificate.receiptNumber})</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Section: QR Code, Digital Signature, Issuing Authority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center pt-4 border-t-2 border-slate-200">
          {/* QR Code Verification */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Security Verification QR" className="w-20 h-20 rounded border bg-white p-1" />
            ) : (
              <div className="w-20 h-20 bg-slate-200 animate-pulse rounded" />
            )}
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-teal-950 block mb-0.5">Scan to Authenticate</span>
              <span className="text-slate-500 block mb-1">Scannable by enforcement officers and consumers.</span>
              <button
                onClick={() => onVerifyClick && onVerifyClick(certificate)}
                className="text-teal-700 font-bold hover:underline inline-flex items-center gap-0.5 no-print"
              >
                Verify online <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Security Seal Stamp */}
          <div className="text-center sm:border-x border-slate-200 px-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-teal-700 bg-teal-50/60 p-2 text-teal-900 shadow-inner mb-1">
              <div className="text-center">
                <ShieldCheck className="w-6 h-6 mx-auto text-teal-700" />
                <span className="text-[9px] font-bold uppercase tracking-tighter block">SEALED & TESTED</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-mono font-medium">METRAVOX SECURE ENCLAVE</p>
          </div>

          {/* Digital Signature */}
          <div className="text-right sm:text-right text-xs">
            <div className="inline-block border-b-2 border-slate-800 pb-1 mb-1 font-serif italic text-sm text-slate-900 font-bold">
              {certificate.verifyingOfficer}
            </div>
            <p className="font-bold text-slate-900 text-xs">{certificate.officerDesignation}</p>
            <p className="text-[11px] text-slate-600">{certificate.issuingAuthority}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Digitally Signed on {certificate.verificationDate}
            </p>
          </div>
        </div>

        {/* Footer Legal Warning */}
        <div className="mt-6 pt-3 border-t border-slate-200 text-[10px] text-slate-500 text-center leading-relaxed">
          Notice: Tampering with seals or alteration of this certificate is a punishable offence under Section 30 of the Legal Metrology Act, 2009. 
          This certificate must be prominently exhibited at the place of business where the instrument is installed.
        </div>
      </div>
    </div>
  );
}
