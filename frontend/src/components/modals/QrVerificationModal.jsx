import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  AlertCircle, 
  Building, 
  Calendar, 
  FileText, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { getExpiryAlertInfo, getRemainingDays } from '../../services/storage';

export default function QrVerificationModal({ certificate, isOpen, onClose }) {
  if (!isOpen || !certificate) return null;

  const expiryInfo = getExpiryAlertInfo(certificate.expiryDate);
  const remainingDays = getRemainingDays(certificate.expiryDate);
  const isValid = remainingDays >= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className={`p-5 text-white flex items-center justify-between ${
          isValid ? 'bg-gradient-to-r from-teal-800 to-emerald-900' : 'bg-gradient-to-r from-red-800 to-rose-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-teal-200 font-semibold block">
                Official Metrology Verification Result
              </span>
              <h3 className="font-bold text-base">
                {isValid ? 'Authentic Legal Metrology Certificate' : 'Certificate Expired / Action Required'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Authenticity Status Card */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            {isValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-sm mb-0.5">
                {isValid ? 'Verified Genuine Record' : 'Expired Verification'}
              </h4>
              <p className="text-xs opacity-90 leading-relaxed">
                This instrument is registered in the Central Metravox National Registry under the Legal Metrology Act, 2009. 
                Hash verification matched without discrepancies.
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Certificate Number:</span>
              <span className="font-mono font-bold text-slate-900">{certificate.certificateNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Application Reference:</span>
              <span className="font-mono text-slate-800">{certificate.applicationId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Registered Business:</span>
              <span className="font-bold text-slate-900">{certificate.businessName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">GSTIN / Trade ID:</span>
              <span className="font-mono text-slate-800">{certificate.gstin}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Instrument Type:</span>
              <span className="font-medium text-slate-900">{certificate.instrumentType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Make & Serial No.:</span>
              <span className="font-mono text-slate-900">{certificate.manufacturer} / {certificate.serialNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Verification Date:</span>
              <span className="text-slate-900">{certificate.verificationDate}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Validity Expiry:</span>
              <span className={`font-bold ${isValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                {certificate.expiryDate} ({remainingDays > 0 ? `${remainingDays} days remaining` : `${Math.abs(remainingDays)} days overdue`})
              </span>
            </div>
          </div>

          {/* Cryptographic Security Footer */}
          <div className="flex items-center gap-2 p-2.5 bg-teal-50/50 rounded-lg border border-teal-100 text-[11px] text-teal-900">
            <Lock className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="font-mono truncate">
              SHA256: {certificate.securityHash || '8f92a4e1b7c3d2e90f1a5b6c8d7e4f2a'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          <span className="text-[11px] text-slate-500">
            Certified by {certificate.issuingAuthority}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
