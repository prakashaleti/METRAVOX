import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Scale, 
  FileText, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Award, 
  ArrowLeft, 
  ShieldCheck, 
  ExternalLink,
  Send,
  Upload,
  UserCheck,
  Eye,
  Download,
  X
} from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import TrackingTimeline from '../../components/TrackingTimeline';
import ReturnCorrectionModal from '../../components/modals/ReturnCorrectionModal';
import ScheduleInspectionModal from '../../components/modals/ScheduleInspectionModal';
import RecordInspectionModal from '../../components/modals/RecordInspectionModal';

export default function ApplicationDetails() {
  const { id } = useParams();
  const { currentRole } = useAuth();
  const { 
    applications, 
    resubmitApplication, 
    returnApplication, 
    scheduleVerification, 
    approveAndGenerateCertificate, 
    rejectApplication 
  } = useApp();
  const navigate = useNavigate();

  const application = applications.find(a => a.id.toLowerCase() === id?.toLowerCase());

  // Resubmission state for applicant
  const [applicantNotes, setApplicantNotes] = useState('');
  const [correctionFile, setCorrectionFile] = useState('');

  // Modals state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const handleDownloadDoc = (doc) => {
    if (!doc.dataUrl) {
      alert(`Document file content is not available for local download.`);
      return;
    }
    const a = document.createElement('a');
    a.href = doc.dataUrl;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!application) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-lg mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 mx-auto text-amber-500" />
        <h3 className="text-lg font-bold text-slate-900">Application Not Found</h3>
        <p className="text-xs text-slate-500">Could not find record for ID #{id}.</p>
        <Link to="/applications" className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold inline-block">
          Return to Applications
        </Link>
      </div>
    );
  }

  const isOfficerOrAdmin = currentRole === ROLES.OFFICER || currentRole === ROLES.ADMIN;
  const isReturned = application.status === 'Returned for Correction';

  const handleResubmit = (e) => {
    e.preventDefault();
    if (!applicantNotes.trim()) {
      alert('Please specify the correction notes.');
      return;
    }
    resubmitApplication(application.id, applicantNotes.trim());
    setApplicantNotes('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link to="/applications" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {application.id}
            </span>
            <StatusBadge status={application.status} size="md" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1">
            {application.instrumentType}
          </h1>
          <p className="text-xs text-slate-500">
            Applicant: <strong className="text-slate-800">{application.applicantName}</strong> ({application.businessName}) • Submitted on {application.submittedAt}
          </p>
        </div>

        {/* Action Buttons based on Role & Status */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/track?id=${application.id}`}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            Live Timeline
          </Link>

          {/* If Certificate Generated, direct jump to certificate */}
          {application.certificateId && (
            <Link
              to={`/certificates/${application.certificateId}`}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              View Form V Certificate
            </Link>
          )}

          {/* Officer controls */}
          {isOfficerOrAdmin && (
            <>
              {(application.status === 'Application Submitted' || application.status === 'Under Review') && (
                <>
                  <button
                    onClick={() => setReturnModalOpen(true)}
                    className="px-3.5 py-2 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl transition-colors"
                  >
                    Return for Correction
                  </button>
                  <button
                    onClick={() => setScheduleModalOpen(true)}
                    className="px-4 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Accept & Schedule
                  </button>
                </>
              )}

              {application.status === 'Verification Scheduled' && (
                <button
                  onClick={() => setInspectModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  Record Inspection & Issue Stamp
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Returned for Correction Alert Banner & Resubmission Box */}
      {isReturned && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                Action Required by Applicant
              </span>
              <h3 className="text-base font-bold text-amber-950">
                Officer Correction Request & Scrutiny Observations
              </h3>
              <p className="text-xs text-amber-900 mt-1 whitespace-pre-line leading-relaxed font-medium bg-white/60 p-3 rounded-xl border border-amber-200">
                {application.returnReason}
              </p>
            </div>
          </div>

          {/* Applicant Resubmission Form */}
          <form onSubmit={handleResubmit} className="pt-2 border-t border-amber-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Resubmit with Corrections
            </h4>
            <textarea
              required
              rows={3}
              value={applicantNotes}
              onChange={(e) => setApplicantNotes(e.target.value)}
              placeholder="Explain how you addressed the officer remarks and details of corrected documents..."
              className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Attach new document name..."
                  value={correctionFile}
                  onChange={(e) => setCorrectionFile(e.target.value)}
                  className="text-xs p-2 bg-white border border-slate-300 rounded-lg outline-none w-64"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (correctionFile.trim()) {
                      application.documents.push({ name: correctionFile, size: '1.2 MB', type: 'application/pdf' });
                      setCorrectionFile('');
                    }
                  }}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg"
                >
                  Add File
                </button>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Resubmit Application for Scrutiny
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Details + Documents + Visual Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dossier Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instrument Specifications */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-serif flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-700" />
                Instrument Technical Dossier
              </h3>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {application.instrumentClass}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <strong className="text-slate-900 block">{application.instrumentCategory || 'Legal Metrology'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Manufacturer</span>
                <strong className="text-slate-900 block">{application.manufacturer}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Model Number</span>
                <strong className="text-slate-900 block font-mono">{application.modelNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Serial Number</span>
                <strong className="text-teal-900 block font-mono font-bold">{application.serialNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Rated Capacity</span>
                <strong className="text-slate-900 block">{application.capacity}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Verification Nature</span>
                <strong className="text-slate-900 block">{application.verificationNature}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Inspection Venue</span>
                <strong className="text-slate-900 block">{application.inspectionVenue}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Fee Paid</span>
                <strong className="text-emerald-700 font-bold block">₹ {application.feeAmount || 850}.00 (Settled)</strong>
              </div>
            </div>
          </div>

          {/* Applicant & Business Details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-serif flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-700" />
                Establishment & Premises
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Firm / Business Name</span>
                <strong className="text-slate-900">{application.businessName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">GSTIN / Registration</span>
                <strong className="text-slate-900 font-mono">{application.gstin}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Authorized Person</span>
                <strong className="text-slate-900">{application.applicantName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">District / Zone</span>
                <strong className="text-slate-900">{application.district}, {application.state}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Premises Address</span>
                <p className="text-slate-700">{application.address}, {application.district} - {application.pincode}</p>
              </div>
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 font-serif flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-700" />
                Attached Statutory Documents ({application.documents?.length || 0})
              </h3>
            </div>

            <div className="space-y-2.5">
              {(!application.documents || application.documents.length === 0) ? (
                <div className="p-4 text-center border border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-xs">
                  No statutory documents recorded for this application.
                </div>
              ) : (
                application.documents.map((doc, idx) => (
                  <div key={doc.id || idx} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 truncate block max-w-xs sm:max-w-md">{doc.name}</span>
                          {doc.category && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                              {doc.category}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{doc.size || '1.1 MB'} • Digitally verified</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (doc.dataUrl) {
                            setPreviewDoc(doc);
                          } else {
                            alert(`File "${doc.name}" was uploaded in a legacy simulation without raw binary data.`);
                          }
                        }}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        Preview
                      </button>
                      {doc.dataUrl && (
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(doc)}
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Test Observations (if completed) */}
          {application.inspectionData && (
            <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-card space-y-4">
              <div className="border-b border-emerald-100 pb-3 flex items-center justify-between">
                <h3 className="font-bold text-base text-emerald-950 font-serif flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  Official Field Inspection Findings
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {application.inspectionData.verdict || 'PASSED'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Inspector</span>
                  <strong className="text-slate-800">{application.inspectionData.inspector}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Affixed Seal No.</span>
                  <strong className="text-amber-900 font-mono font-bold">{application.inspectionData.sealNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tolerance Schedule</span>
                  <strong className="text-slate-800">{application.inspectionData.mpeTolerance}</strong>
                </div>
              </div>

              {application.inspectionData.tests && (
                <div className="overflow-x-auto border border-slate-200 rounded-xl mt-3">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-2">Standard Load</th>
                        <th className="p-2">Reading</th>
                        <th className="p-2">Error</th>
                        <th className="p-2">Tolerance MPE</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {application.inspectionData.tests.map((t, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{t.load}</td>
                          <td className="p-2">{t.reading}</td>
                          <td className="p-2 font-mono text-emerald-700">{t.error}</td>
                          <td className="p-2">{t.mpe}</td>
                          <td className="p-2 font-bold text-emerald-700">PASS</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Visual Progress Timeline (1 Col) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card h-fit">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-base text-slate-900 font-serif flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-700" />
              Stage Audit Timeline
            </h3>
            <p className="text-xs text-slate-500">Live progress of statutory verification</p>
          </div>

          <TrackingTimeline timeline={application.timeline} currentStatus={application.status} />
        </div>
      </div>

      {/* Officer Execution Modals */}
      <ReturnCorrectionModal
        application={application}
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={(id, reason) => returnApplication(id, reason)}
      />

      <ScheduleInspectionModal
        application={application}
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onConfirm={(id, scheduleData) => scheduleVerification(id, scheduleData)}
      />

      <RecordInspectionModal
        application={application}
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        onApprove={(id, inspectionData) => {
          const res = approveAndGenerateCertificate(id, inspectionData);
          if (res?.certificate) {
            navigate(`/certificates/${res.certificate.certificateNumber}`);
          }
        }}
        onReject={(id, reason) => rejectApplication(id, reason)}
      />

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-teal-700 shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{previewDoc.name}</h4>
                  <span className="text-[10px] text-slate-500">{previewDoc.category || 'Document'} • {previewDoc.size || '1.1 MB'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50 rounded-2xl p-4 flex items-center justify-center min-h-[300px]">
              {previewDoc.type?.startsWith('image/') || previewDoc.dataUrl?.startsWith('data:image/') ? (
                <img
                  src={previewDoc.dataUrl}
                  alt={previewDoc.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-xs"
                />
              ) : previewDoc.type === 'application/pdf' || previewDoc.dataUrl?.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewDoc.dataUrl}
                  title={previewDoc.name}
                  className="w-full h-[55vh] rounded-xl border border-slate-200"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600">
                    Inline preview not supported for this file format ({previewDoc.type || 'Document'}).
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDownloadDoc(previewDoc)}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download File to View
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDownloadDoc(previewDoc)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
