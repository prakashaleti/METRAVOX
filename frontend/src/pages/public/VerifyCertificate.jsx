import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Building2, 
  Calendar, 
  Lock, 
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRemainingDays, getExpiryAlertInfo } from '../../services/storage';

export default function VerifyCertificate() {
  const { certNumber } = useParams();
  const { certificates } = useApp();

  const certificate = certificates.find(c => c.certificateNumber.toLowerCase() === certNumber?.toLowerCase());

  if (!certificate) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-serif text-slate-900">Certificate Record Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The scanned certificate reference <strong className="font-mono text-slate-700">{certNumber}</strong> could not be matched against the official Central Registry. This document may be invalid or forged.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to National Portal
          </Link>
        </div>
      </div>
    );
  }

  const days = getRemainingDays(certificate.expiryDate);
  const isValid = days >= 0;
  const expiryInfo = getExpiryAlertInfo(certificate.expiryDate);

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to METRAVOX National Portal
      </Link>

      {/* Main Validation Result Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-elevated overflow-hidden">
        {/* Banner */}
        <div className={`p-6 text-white ${
          isValid ? 'bg-gradient-to-r from-teal-800 to-emerald-900' : 'bg-gradient-to-r from-rose-800 to-red-900'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-teal-200 tracking-wider block">
                Official Metrology QR Security Verification
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-serif">
                {isValid ? 'Authentic Legal Metrology Verification' : 'Expired Verification Certificate'}
              </h1>
              <p className="text-xs text-white/80 font-mono mt-0.5">
                Record Hash: {certificate.securityHash}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Status Notice */}
        <div className="p-6 space-y-6">
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}>
            {isValid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <strong className="text-sm block font-bold mb-1">
                {isValid ? 'Verified Genuine & In-Force' : 'Statutory Notice: Certificate Expired'}
              </strong>
              {isValid ? (
                <span>
                  This instrument was officially tested against working standards and stamped by <strong>{certificate.verifyingOfficer}</strong> under the Legal Metrology Act, 2009. The instrument is legally authorized for commercial trade.
                </span>
              ) : (
                <span>
                  The validity of this verification certificate expired on <strong>{certificate.expiryDate}</strong> ({Math.abs(days)} days ago). Commercial transactions using this instrument without re-verification are liable to statutory prosecution under Section 30.
                </span>
              )}
            </div>
          </div>

          {/* Certificate Dossier Table */}
          <div className="overflow-hidden border border-slate-200 rounded-2xl">
            <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Verified Instrument Registry Data</span>
              <span className="font-mono text-[11px] text-teal-800">{certificate.certificateNumber}</span>
            </div>
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr className="divide-x divide-slate-100">
                  <td className="p-3 bg-slate-50 font-semibold text-slate-500 w-1/3">Certificate Number</td>
                  <td className="p-3 font-mono font-bold text-teal-900">{certificate.certificateNumber}</td>
                </tr>
                <tr className="divide-x divide-slate-100">
                  <td className="p-3 bg-slate-50 font-semibold text-slate-500">Registered Business / Trader</td>
                  <td className="p-3 font-bold text-slate-900">{certificate.businessName} ({certificate.applicantName})</td>
                </tr>
                <tr className="divide-x divide-slate-100">
                  <td className="p-3 bg-slate-50 font-semibold text-slate-500">GSTIN / Trade ID</td>
                  <td className="p-3 font-mono text-slate-800">{certificate.gstin}</td>
                </tr>
                <tr className="divide-x divide-slate-100">
                  <td className="p-3 bg-slate-50 font-semibold text-slate-500">Premises Address</td>
                  <td className="p-3 text-slate-700">{certificate.premisesAddress}</td>
                </tr>
                <tr className="divide-x divide-slate-100">
                  <td className="p-3 bg-slate-50 font-semibold text-slate-500">Instrument Category</td>
                  <td className="p-3 text-slate-800">{certificate.instrumentType}</td>
                </tr>
                <tr className="divide-x divide-slate-100">
                  <td className="p-3 bg-slate-50 font-semibold text-slate-500">Make, Model & Serial No.</td>
                  <td className="p-3 font-mono text-slate-900">
                    {certificate.manufacturer} / {certificate.modelNumber} • S/N: <strong className="text-teal-900">{certificate.serialNumber}</strong>
                  </td>
                </tr>
                <tr className="divide-x divide-slate-100">
                  <td className="p-3 bg-slate-50 font-semibold text-slate-500">Official Stamp / Seal ID</td>
                  <td className="p-3 font-mono font-bold text-amber-900">{certificate.sealNumber}</td>
                </tr>
                <tr className="divide-x divide-slate-100">
                  <td className="p-3 bg-slate-50 font-semibold text-slate-500">Verification Date</td>
                  <td className="p-3 font-mono text-slate-800">{certificate.verificationDate}</td>
                </tr>
                <tr className="divide-x divide-slate-100">
                  <td className="p-3 bg-slate-50 font-semibold text-slate-500">Validity Expiry Date</td>
                  <td className="p-3 font-bold">
                    <span className={isValid ? 'text-emerald-700' : 'text-rose-600'}>
                      {certificate.expiryDate} ({days > 0 ? `${days} days remaining` : `${Math.abs(days)} days overdue`})
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <span className="text-[11px] text-slate-500">
              Issuing Authority: <strong>{certificate.issuingAuthority}</strong>
            </span>
            <Link
              to={`/certificates/${certificate.certificateNumber}`}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors shadow"
            >
              View Full Form V Certificate Document →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
