import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  Scale, 
  Upload, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Trash2, 
  IndianRupee, 
  AlertCircle,
  FileCheck2,
  Eye,
  Download,
  X,
  FileUp,
  Sparkles,
  Paperclip,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const STATUTORY_DOC_CATEGORIES = [
  'Model Approval Certificate (Govt. of India)',
  'Purchase Tax Invoice / Bill of Sale',
  'Premises GST & Trade License',
  'Previous Stamping / Verification Certificate',
  'Technical Specification / Calibration Report',
  'General Supporting Document'
];

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function NewApplication() {
  const { user } = useAuth();
  const { submitApplication } = useApp();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(STATUTORY_DOC_CATEGORIES[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Establishment
    applicantName: user?.name || 'prakash',
    businessName: user?.organization || 'Prakash Industrial & Trade Enterprises',
    gstin: user?.gstin || '32AABCP9871F1Z2',
    email: user?.email || 'prakash01.aleti@gmail.com',
    phone: user?.phone || '+91 98470 12345',
    address: user?.address || 'Plot 14-B, Industrial Development Area, Kalamassery',
    district: user?.district || 'Ernakulam',
    state: user?.state || 'Kerala',
    pincode: '683109',

    // Step 2: Instrument Specs
    instrumentCategory: 'Electronic Weighing Scales',
    instrumentType: 'Class III Electronic Platform Scale',
    instrumentClass: 'Class III (Medium Accuracy)',
    capacity: '150 kg (e = 20 g, Min = 400 g)',
    manufacturer: 'Essae-Teraoka Pvt Ltd',
    modelNumber: 'DS-215 / HD-Industrial',
    serialNumber: `SN-2025-${Math.floor(10000 + Math.random() * 90000)}`,
    yearOfManufacture: 2025,
    verificationNature: 'Re-verification / Periodic Renewal',
    inspectionVenue: 'Trader Premises (On-site)',

    // Step 3: Documents (Starts empty for real uploads)
    documents: [],

    // Step 4: Fee & Declaration
    feeAmount: 850,
    declarationAccepted: true
  });

  // Handle instrument category change to auto-suggest classes and fee
  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    let type = 'Class III Electronic Platform Scale';
    let cls = 'Class III (Medium Accuracy)';
    let fee = 850;
    let cap = '150 kg (e = 20 g)';

    if (cat === 'Weighbridges & Heavy Scales') {
      type = 'Heavy Commercial Weighbridge';
      cls = 'Class III (Medium Accuracy)';
      fee = 4200;
      cap = '60,000 kg (e = 10 kg)';
    } else if (cat === 'Precision & Analytical Balances') {
      type = 'Precision Laboratory Analytical Balance';
      cls = 'Class I (Special Accuracy)';
      fee = 1500;
      cap = '220 g (e = 1 mg, d = 0.1 mg)';
    } else if (cat === 'Dispensing Pumps & Flow Meters') {
      type = 'Multi-Nozzle Automated Fuel Dispenser';
      cls = 'Class 0.5 (Commercial Fuel Dispenser)';
      fee = 2400;
      cap = '50 Litres / min';
    } else if (cat === 'Non-Automatic Mechanical Scales') {
      type = 'Mechanical Counter Scale / Beam Scale';
      cls = 'Class IIII';
      fee = 450;
      cap = '50 kg (e = 50 g)';
    }

    setFormData((prev) => ({
      ...prev,
      instrumentCategory: cat,
      instrumentType: type,
      instrumentClass: cls,
      feeAmount: fee,
      capacity: cap
    }));
  };

  // Real File Upload Handler (reads actual files via FileReader into Base64)
  const handleFileChange = (filesList) => {
    const files = Array.from(filesList || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newDoc = {
          id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          name: file.name,
          size: formatFileSize(file.size),
          rawSize: file.size,
          type: file.type || 'application/pdf',
          category: selectedCategory,
          dataUrl: reader.result,
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setFormData((prev) => ({
          ...prev,
          documents: [...prev.documents, newDoc]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleRemoveDocument = (idOrIdx) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((d, i) => (d.id ? d.id !== idOrIdx : i !== idOrIdx))
    }));
  };

  const handleDownloadDoc = (doc) => {
    if (!doc.dataUrl) {
      alert(`Document ${doc.name} content not available.`);
      return;
    }
    const a = document.createElement('a');
    a.href = doc.dataUrl;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAttachDemoDocs = () => {
    const sampleDocs = [
      {
        id: 'doc-demo-1',
        name: 'Model_Approval_Certificate_IND_2025.pdf',
        size: '1.2 MB',
        type: 'application/pdf',
        category: 'Model Approval Certificate (Govt. of India)',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNzgKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRECihtb2RlbCBBcHByb3ZhbCBDZXJ0aWZpY2F0ZSAtIERlcGFydG1lbnQgb2YgTGVnYWwgTWV0cm9sb2d5KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDE5NSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjMyNQolJUVPRg==',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'doc-demo-2',
        name: 'Purchase_Tax_Invoice_Commercial_Scale.pdf',
        size: '840 KB',
        type: 'application/pdf',
        category: 'Purchase Tax Invoice / Bill of Sale',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNzgKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRECiBUYXggSW52b2ljZSAtIFByYWthc2ggSW5kdXN0cmlhbCAmIFRyYWRlIEVudGVycHJpc2VzKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDE5NSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjMyNQolJUVPRg==',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'doc-demo-3',
        name: 'Premises_GST_Trade_License.pdf',
        size: '2.1 MB',
        type: 'application/pdf',
        category: 'Premises GST & Trade License',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNzgKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRECiAoR1NUIFRyYWRlIExpY2Vuc2UgLSBQcmFrYXNoIEluZHVzdHJpYWwpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE4IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDEyNSAwMDAwMCBuIAowMDAwMDAwMTk1IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMzI1CiUlRU9GCg==',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...sampleDocs]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.declarationAccepted) {
      alert('Please check the statutory declaration to proceed.');
      return;
    }

    const created = submitApplication(formData);

    // Trigger celebratory confetti for prototype satisfaction
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    // Navigate to tracking page
    navigate(`/track?id=${created.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold text-teal-700 tracking-wider block">
            Statutory Verification Form
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            Lodge Verification Application
          </h1>
          <p className="text-xs text-slate-500">
            Legal Metrology Act, 2009 • Section 24 Verification & Stamping
          </p>
        </div>

        {/* Wizard Stepper Indicators */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              onClick={() => step < currentStep && setCurrentStep(step)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                currentStep === step
                  ? 'bg-teal-700 text-white shadow-md ring-2 ring-teal-200'
                  : currentStep > step
                  ? 'bg-emerald-100 text-emerald-800 cursor-pointer'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Body */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card">
        {/* STEP 1: Applicant & Establishment Details */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-serif flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-700" />
                Step 1: Applicant & Establishment Details
              </h3>
              <p className="text-xs text-slate-500">
                Registered commercial establishment details where the instrument is installed
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Applicant Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.applicantName}
                  onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Business / Trading Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  GSTIN / Trade Identification <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Enforcement District / Jurisdiction <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="Ernakulam">Ernakulam (Enforcement Zone 04)</option>
                  <option value="Thiruvananthapuram">Thiruvananthapuram Central</option>
                  <option value="Kozhikode">Kozhikode North</option>
                  <option value="Thrissur">Thrissur Division</option>
                  <option value="Kannur">Kannur Coastal</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Premises / Installation Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Mobile Contact</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Official Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                Proceed to Instrument Specs <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Instrument Technical Data */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-serif flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-700" />
                Step 2: Instrument Specifications & Classification
              </h3>
              <p className="text-xs text-slate-500">
                Technical metrological parameters as per manufacturer approval certificate
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Instrument Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.instrumentCategory}
                  onChange={handleCategoryChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-semibold text-slate-900"
                >
                  <option value="Electronic Weighing Scales">Electronic Weighing Scales (Class III)</option>
                  <option value="Weighbridges & Heavy Scales">Weighbridges & Heavy Industrial Scales</option>
                  <option value="Precision & Analytical Balances">Precision & Analytical Balances (Class I/II)</option>
                  <option value="Dispensing Pumps & Flow Meters">Dispensing Pumps & Commercial Flow Meters</option>
                  <option value="Non-Automatic Mechanical Scales">Non-Automatic Mechanical Counter Scales</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Specific Instrument Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.instrumentType}
                  onChange={(e) => setFormData({ ...formData, instrumentType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Accuracy Class</label>
                <input
                  type="text"
                  value={formData.instrumentClass}
                  onChange={(e) => setFormData({ ...formData, instrumentClass: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Rated Capacity / Interval (e) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Manufacturer / Make <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Model Designation Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.modelNumber}
                  onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Machine Serial Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nature of Verification <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.verificationNature}
                  onChange={(e) => setFormData({ ...formData, verificationNature: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="Initial Verification">Initial Verification (New Instrument)</option>
                  <option value="Re-verification / Periodic Renewal">Periodic Re-verification (Annual Renewal)</option>
                  <option value="Post-Repair Re-verification">Post-Repair Re-verification</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Desired Inspection Venue
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                    formData.inspectionVenue === 'Trader Premises (On-site)' ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="venue"
                      checked={formData.inspectionVenue === 'Trader Premises (On-site)'}
                      onChange={() => setFormData({ ...formData, inspectionVenue: 'Trader Premises (On-site)' })}
                      className="text-teal-600"
                    />
                    <span>On-Site Trader Premises (Recommended for heavy scales)</span>
                  </label>
                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                    formData.inspectionVenue === 'Legal Metrology Standards Laboratory' ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="venue"
                      checked={formData.inspectionVenue === 'Legal Metrology Standards Laboratory'}
                      onChange={() => setFormData({ ...formData, inspectionVenue: 'Legal Metrology Standards Laboratory' })}
                      className="text-teal-600"
                    />
                    <span>Legal Metrology Standards Lab (Applicant brings instrument)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                Proceed to Document Upload <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Document Uploads */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-serif flex items-center gap-2">
                  <Upload className="w-5 h-5 text-teal-700" />
                  Step 3: Statutory Document Uploads
                </h3>
                <p className="text-xs text-slate-500">
                  Attach Model Approval Certificate, Purchase Invoice, and Previous Verification Certificate
                </p>
              </div>

              {/* Quick Sample Attachment for instant testing */}
              <button
                type="button"
                onClick={handleAttachDemoDocs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl border border-teal-200 transition-colors shadow-xs shrink-0"
                title="Automatically attaches sample statutory test documents for instant review"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Attach Sample Documents
              </button>
            </div>

            {/* Document Category Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Document Classification
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                {STATUTORY_DOC_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Real File Drag & Drop Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-teal-500 bg-teal-50/80 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50/70 hover:bg-slate-50 hover:border-teal-600'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                onChange={(e) => handleFileChange(e.target.files)}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-3 shadow-inner">
                <FileUp className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-900 mb-1">
                Click to browse files or drag and drop here
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mb-3">
                Selected category: <span className="font-semibold text-teal-800">{selectedCategory}</span>
              </p>
              <span className="inline-block text-[10px] font-medium text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                Supports PDF, PNG, JPG, WEBP, DOCX (Max 15MB per file)
              </span>
            </div>

            {/* Document List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Attached Documents ({formData.documents.length})
                </span>
                {formData.documents.length === 0 && (
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    At least 1 document recommended
                  </span>
                )}
              </div>

              {formData.documents.length === 0 ? (
                <div className="p-6 text-center border border-slate-200 rounded-2xl bg-white text-slate-400 text-xs">
                  No documents attached yet. Click above to upload or use "Attach Sample Documents".
                </div>
              ) : (
                formData.documents.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 truncate block max-w-xs sm:max-w-md">
                            {doc.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                            {doc.category || 'General Document'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {doc.size} {doc.uploadedAt ? `• Uploaded ${doc.uploadedAt}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {doc.dataUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                      )}
                      {doc.dataUrl && (
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(doc)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(doc.id || idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                Proceed to Fee & Declaration <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Fee & Declaration */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-serif flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-700" />
                Step 4: Statutory Fee & Applicant Declaration
              </h3>
              <p className="text-xs text-slate-500">
                Review automated verification fee calculation and submit binding declaration
              </p>
            </div>

            {/* Fee Computation Card */}
            <div className="p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-300 block">
                  Statutory Fee Schedule XII
                </span>
                <h4 className="text-base font-bold font-serif">{formData.instrumentType}</h4>
                <p className="text-xs text-slate-300">
                  Capacity: {formData.capacity} • Venue: {formData.inspectionVenue}
                </p>
              </div>

              <div className="text-right sm:text-right bg-white/10 px-5 py-3 rounded-xl border border-white/20">
                <span className="text-[10px] text-teal-200 block uppercase font-bold">Total Payable Fee</span>
                <span className="text-2xl font-extrabold text-white font-mono flex items-center justify-end">
                  <IndianRupee className="w-5 h-5" />
                  {formData.feeAmount}.00
                </span>
                <span className="text-[10px] text-teal-300">Included online gateway settlement</span>
              </div>
            </div>

            {/* Summary Review */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Applicant</span>
                <strong className="text-slate-800">{formData.applicantName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">GSTIN</span>
                <strong className="text-slate-800 font-mono">{formData.gstin}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Make / Model</span>
                <strong className="text-slate-800">{formData.manufacturer} / {formData.modelNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Serial No.</span>
                <strong className="text-slate-800 font-mono text-teal-800">{formData.serialNumber}</strong>
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.declarationAccepted}
                  onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                  className="mt-1 rounded text-teal-700 focus:ring-teal-500"
                />
                <span className="text-xs text-amber-950 leading-relaxed font-medium">
                  <strong>Statutory Declaration:</strong> I hereby solemnly declare that the particulars furnished above are true and complete to the best of my knowledge. The instrument is intended exclusively for authorized commercial weighing and complies with the Legal Metrology (General) Rules, 2011. I undertake to produce the instrument with necessary testing facilities on the scheduled inspection date.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Application & Pay Fee
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-teal-700 shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{previewDoc.name}</h4>
                  <span className="text-[10px] text-slate-500">{previewDoc.category} • {previewDoc.size}</span>
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
