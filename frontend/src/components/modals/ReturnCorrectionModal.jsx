import React, { useState } from 'react';
import { AlertTriangle, X, Send, FileWarning } from 'lucide-react';

export default function ReturnCorrectionModal({ application, isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [suggestedChecklist, setSuggestedChecklist] = useState([
    'Upload Section 22 Government Model Approval Certificate with correct model number',
    'Attach clear photograph of serial number nameplate attached to instrument',
    'Submit clear purchase tax invoice showing date and buyer GSTIN'
  ]);
  const [selectedChecks, setSelectedChecks] = useState([]);

  if (!isOpen || !application) return null;

  const handleToggleCheck = (item) => {
    if (selectedChecks.includes(item)) {
      setSelectedChecks(selectedChecks.filter((c) => c !== item));
    } else {
      setSelectedChecks([...selectedChecks, item]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalReason = reason.trim();
    if (selectedChecks.length > 0) {
      finalReason = `Required Corrections:\n${selectedChecks.map(c => '• ' + c).join('\n')}\n\nOfficer Remarks: ${finalReason || 'Please furnish the missing/corrected items.'}`;
    }
    if (!finalReason) {
      alert('Please specify the reason for return.');
      return;
    }
    onConfirm(application.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Return Application for Correction</h3>
              <p className="text-xs text-amber-100">Application ID: {application.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>Notice to Officer:</strong> Returning this application will notify the applicant (<strong>{application.applicantName}</strong>) via their dashboard and email. The application status will be changed to <em>Returned for Correction</em> until the applicant resubmits.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Common Deficiencies Checklist (Optional)
            </label>
            <div className="space-y-1.5">
              {suggestedChecklist.map((item, idx) => (
                <label key={idx} className="flex items-start gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChecks.includes(item)}
                    onChange={() => handleToggleCheck(item)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Reason / Officer Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail the exact missing documents, discrepancies in specifications, or required corrections..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              Return to Applicant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
