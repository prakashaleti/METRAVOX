import React, { useState } from 'react';
import { CheckCircle2, XCircle, Scale, ShieldCheck, X, FileText, Plus, Trash2 } from 'lucide-react';

export default function RecordInspectionModal({ application, isOpen, onClose, onApprove, onReject }) {
  const [decision, setDecision] = useState('approve');
  const [testStandard, setTestStandard] = useState('Standard Working Class M1/F1 Calibrated Weights');
  const [sealNumber, setSealNumber] = useState(`KL-07-SEAL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [toleranceMPE, setToleranceMPE] = useState('± 5.0 g (as per Table 6 of General Rules 2011)');
  const [remarks, setRemarks] = useState('Instrument verified against working standards. Readings are well within the Maximum Permissible Error (MPE) tolerance limits. Official lead security seal affixed to calibration adjustment port.');
  const [rejectionReason, setRejectionReason] = useState('Observed error exceeding maximum permissible tolerance (+14.2 g vs limit of ±5 g). Seal wire tamper detected on analog conversion board.');

  const [testReadings, setTestReadings] = useState([
    { load: '10 kg', reading: '10.000 kg', error: '0.0 g', mpe: '± 2.5 g', result: 'PASS' },
    { load: '50 kg', reading: '50.002 kg', error: '+ 2.0 g', mpe: '± 5.0 g', result: 'PASS' },
    { load: '150 kg (Max)', reading: '150.003 kg', error: '+ 3.0 g', mpe: '± 5.0 g', result: 'PASS' },
  ]);

  if (!isOpen || !application) return null;

  const handleAddRow = () => {
    setTestReadings([
      ...testReadings,
      { load: '100 kg', reading: '100.001 kg', error: '+ 1.0 g', mpe: '± 5.0 g', result: 'PASS' }
    ]);
  };

  const handleRemoveRow = (index) => {
    setTestReadings(testReadings.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...testReadings];
    updated[index][field] = value;
    setTestReadings(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (decision === 'approve') {
      onApprove(application.id, {
        inspectionDate: new Date().toISOString().split('T')[0],
        inspector: 'Ramesh varma',
        inspectorDesignation: 'Senior Legal Metrology Officer',
        testStandardUsed: testStandard,
        sealNumber: sealNumber,
        mpeTolerance: toleranceMPE,
        remarks: remarks,
        tests: testReadings,
        verdict: 'PASSED'
      });
    } else {
      if (!rejectionReason.trim()) {
        alert('Please provide a specific reason for rejection under the Legal Metrology Act.');
        return;
      }
      onReject(application.id, rejectionReason.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between shrink-0 ${
          decision === 'approve' ? 'bg-gradient-to-r from-teal-800 to-emerald-900' : 'bg-gradient-to-r from-rose-800 to-red-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Record Verification Observations & Findings</h3>
              <p className="text-xs text-white/80">Application: {application.id} • {application.instrumentType}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Decision Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Verification Outcome / Inspector Verdict <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('approve')}
                className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                  decision === 'approve'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-200'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 ${decision === 'approve' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs block">Approve & Issue Certificate</span>
                  <span className="text-[10px] font-normal opacity-80">Passed all MPE standards</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision('reject')}
                className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                  decision === 'reject'
                    ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-200'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className={`w-5 h-5 ${decision === 'reject' ? 'text-rose-600' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs block">Reject Instrument</span>
                  <span className="text-[10px] font-normal opacity-80">Defective / beyond tolerance</span>
                </div>
              </button>
            </div>
          </div>

          {decision === 'approve' ? (
            <>
              {/* Standards and Seal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Working Standards Reference
                  </label>
                  <input
                    type="text"
                    value={testStandard}
                    onChange={(e) => setTestStandard(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Affixed Security Seal Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono font-bold text-teal-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Test Readings Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Standard Load Test Readings & Error Determination
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-800 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Reading
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Standard Load</th>
                        <th className="p-2.5">Indicated Reading</th>
                        <th className="p-2.5">Observed Error</th>
                        <th className="p-2.5">Allowed MPE</th>
                        <th className="p-2.5 text-center">Result</th>
                        <th className="p-2.5 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {testReadings.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.load}
                              onChange={(e) => handleRowChange(idx, 'load', e.target.value)}
                              className="w-full p-1.5 border border-slate-200 rounded text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.reading}
                              onChange={(e) => handleRowChange(idx, 'reading', e.target.value)}
                              className="w-full p-1.5 border border-slate-200 rounded text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.error}
                              onChange={(e) => handleRowChange(idx, 'error', e.target.value)}
                              className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.mpe}
                              onChange={(e) => handleRowChange(idx, 'mpe', e.target.value)}
                              className="w-full p-1.5 border border-slate-200 rounded text-xs"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              PASS
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            {testReadings.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(idx)}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Inspection Observations & Sealing Notes
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </>
          ) : (
            /* Rejection Form */
            <div className="space-y-4">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900">
                <strong>Statutory Notice:</strong> Rejection prohibits commercial usage of this instrument until recalibrated and re-verified. The applicant will receive an official rejection order with grounds for appeal under Section 21 of the Act.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Statutory Grounds for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Specify exact error figures, non-compliance with Table schedules, physical damages, or tampered seals..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-lg shadow-md transition-all ${
                decision === 'approve'
                  ? 'bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800'
                  : 'bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-800 hover:to-red-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              {decision === 'approve' ? 'Approve & Issue Certificate' : 'Issue Rejection Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
