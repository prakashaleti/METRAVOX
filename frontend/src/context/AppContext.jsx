import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getRemainingDays, getExpiryAlertInfo } from '../services/storage';
import { api } from '../services/api';
import {
  firestoreApplications,
  firestoreCertificates,
  firestoreTimeline
} from '../services/firestoreService';

const AppContext = createContext();

// Generate a human-readable application ID
const generateAppId = () =>
  `MV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

export const DEFAULT_APPLICATIONS = [
  {
    id: 'MV-2026-0941',
    applicantName: 'prakash',
    applicantEmail: 'prakash01.aleti@gmail.com',
    businessName: 'Prakash Industrial & Trade Enterprises',
    gstin: '32AABCP9871F1Z2',
    phone: '+91 98470 12345',
    address: 'Plot 14-B, Industrial Development Area, Kalamassery',
    district: 'Ernakulam',
    state: 'Kerala',
    pincode: '683109',
    instrumentCategory: 'Electronic Weighing Scales',
    instrumentType: 'Class III Electronic Platform Scale',
    instrumentClass: 'Class III (Medium Accuracy)',
    capacity: '150 kg (e = 20 g, Min = 400 g)',
    manufacturer: 'Essae-Teraoka Pvt Ltd',
    modelNumber: 'DS-215 / HD-Industrial',
    serialNumber: 'SN-2025-78412',
    yearOfManufacture: 2025,
    verificationNature: 'Re-verification / Periodic Renewal',
    inspectionVenue: 'Trader Premises (On-site)',
    status: 'Verification Scheduled',
    feeAmount: 850,
    scheduledDate: '2026-09-18',
    scheduledSlot: '10:30 AM - 12:00 PM',
    assignedOfficer: 'Ramesh varma',
    submittedAt: '10 Sep 2026',
    documents: [
      { name: 'Model_Approval_Certificate_IND.pdf', size: '1.2 MB', category: 'Model Approval Certificate' }
    ],
    timeline: [
      { stage: 'Application Submitted', date: '10 Sep 2026, 10:15 AM', status: 'completed', title: 'Application Submitted', description: 'Application registered successfully.', actor: 'prakash' },
      { stage: 'Under Review', date: '11 Sep 2026, 02:40 PM', status: 'completed', title: 'Document Scrutiny Verified', description: 'Model approval certificate verified compliant.', actor: 'Ramesh varma' },
      { stage: 'Verification Scheduled', date: '11 Sep 2026, 04:15 PM', status: 'current', title: 'Inspection Slot Scheduled', description: 'Field test slot allocated for 18 Sep 2026.', actor: 'Ramesh varma' }
    ]
  },
  {
    id: 'MV-2026-0819',
    applicantName: 'prakash',
    applicantEmail: 'prakash01.aleti@gmail.com',
    businessName: 'Prakash Industrial & Trade Enterprises',
    gstin: '32AABCP9871F1Z2',
    phone: '+91 98470 12345',
    address: 'Plot 14-B, Industrial Development Area, Kalamassery',
    district: 'Ernakulam',
    state: 'Kerala',
    pincode: '683109',
    instrumentCategory: 'Weighbridges & Heavy Scales',
    instrumentType: 'Heavy Commercial Weighbridge',
    instrumentClass: 'Class III (Medium Accuracy)',
    capacity: '60,000 kg (e = 10 kg)',
    manufacturer: 'Avery Weigh-Tronix India',
    modelNumber: 'BridgeMaster Pro-60T',
    serialNumber: 'SN-2025-11048',
    yearOfManufacture: 2025,
    verificationNature: 'Initial Verification',
    inspectionVenue: 'Trader Premises (On-site)',
    status: 'Certificate Generated',
    certificateId: 'KL-ERN-2026-004128',
    feeAmount: 4200,
    submittedAt: '02 Sep 2026',
    inspectionData: {
      inspectionDate: '06 Sep 2026',
      sealNumber: 'SEAL-KL-ERN-9081',
      inspector: 'Ramesh varma'
    },
    documents: [
      { name: 'Weighbridge_Design_Approval.pdf', size: '2.4 MB', category: 'Model Approval Certificate' }
    ],
    timeline: [
      { stage: 'Application Submitted', date: '02 Sep 2026', status: 'completed', title: 'Application Submitted', description: 'Lodged via portal.', actor: 'prakash' },
      { stage: 'Certificate Generated', date: '06 Sep 2026', status: 'completed', title: 'Digital Certificate Issued', description: 'Verified and stamped.', actor: 'Ramesh varma' }
    ]
  },
  {
    id: 'MV-2026-0655',
    applicantName: 'prakash',
    applicantEmail: 'prakash01.aleti@gmail.com',
    businessName: 'Prakash Industrial & Trade Enterprises',
    gstin: '32AABCP9871F1Z2',
    phone: '+91 98470 12345',
    address: 'Plot 14-B, Industrial Development Area, Kalamassery',
    district: 'Ernakulam',
    state: 'Kerala',
    pincode: '683109',
    instrumentCategory: 'Precision & Analytical Balances',
    instrumentType: 'Precision Laboratory Analytical Balance',
    instrumentClass: 'Class I (Special Accuracy)',
    capacity: '220 g (e = 1 mg, d = 0.1 mg)',
    manufacturer: 'Sartorius India Ltd',
    modelNumber: 'Entris II - Advanced',
    serialNumber: 'SN-2025-44910',
    yearOfManufacture: 2025,
    verificationNature: 'Re-verification / Periodic Renewal',
    inspectionVenue: 'Legal Metrology Standards Laboratory',
    status: 'Returned for Correction',
    returnReason: 'Legibility issue on purchase tax invoice copy. Please re-upload legible invoice showing serial number matching the physical machine stamp.',
    returnedAt: '05 Sep 2026, 03:20 PM',
    feeAmount: 1500,
    submittedAt: '04 Sep 2026',
    documents: [
      { name: 'Purchase_Tax_Invoice.pdf', size: '840 KB', category: 'Purchase Tax Invoice' }
    ],
    timeline: [
      { stage: 'Application Submitted', date: '04 Sep 2026', status: 'completed', title: 'Application Lodged', description: 'Initial submission.', actor: 'prakash' },
      { stage: 'Returned for Correction', date: '05 Sep 2026', status: 'current', title: 'Scrutiny Clarification', description: 'Invoice legibility clarification needed.', actor: 'Ramesh varma' }
    ]
  }
];

export const DEFAULT_CERTIFICATES = [
  {
    id: 'cert-001',
    certificateNumber: 'KL-ERN-2026-004128',
    applicationId: 'MV-2026-0819',
    applicantName: 'prakash',
    businessName: 'Prakash Industrial & Trade Enterprises',
    gstin: '32AABCP9871F1Z2',
    instrumentType: 'Heavy Commercial Weighbridge',
    serialNumber: 'SN-2025-11048',
    capacity: '60,000 kg (e = 10 kg)',
    verificationDate: '2026-09-06',
    expiryDate: '2027-09-05',
    sealNumber: 'SEAL-KL-ERN-9081',
    issuingOfficer: 'Ramesh varma',
    officerDesignation: 'Senior Legal Metrology Officer',
    jurisdiction: 'Ernakulam Central Zone 04, Kerala',
    status: 'VALID'
  }
];

export function AppProvider({ children }) {
  const [applications, setApplications] = useState(DEFAULT_APPLICATIONS);
  const [certificates, setCertificates] = useState(DEFAULT_CERTIFICATES);
  const [toasts, setToasts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemHealth, setSystemHealth] = useState({
    backendConnected: false,
    firestoreConnected: false,
    lastChecked: null
  });

  // ── 1. Real-time Firestore Listeners ─────────────────────────────────────
  useEffect(() => {
    const unsubApps = firestoreApplications.listen((apps) => {
      if (apps && apps.length > 0) {
        setApplications((prev) => {
          const appMap = new Map();
          prev.forEach(a => appMap.set(a.id, a));
          apps.forEach(a => appMap.set(a.id, a));
          return Array.from(appMap.values());
        });
      }
      setSystemHealth((prev) => ({ ...prev, firestoreConnected: true }));
    });

    const unsubCerts = firestoreCertificates.listen((certs) => {
      if (certs && certs.length > 0) {
        setCertificates((prev) => {
          const certMap = new Map();
          prev.forEach(c => certMap.set(c.certificateNumber || c.id, c));
          certs.forEach(c => certMap.set(c.certificateNumber || c.id, c));
          return Array.from(certMap.values());
        });
      }
    });

    return () => {
      unsubApps();
      unsubCerts();
    };
  }, []);

  // ── 2. Django REST Backend Connection & Health Check ────────────────────
  useEffect(() => {
    let isMounted = true;

    async function syncBackend() {
      try {
        const stats = await api.getDashboardStats();
        if (isMounted && stats) {
          setSystemHealth((prev) => ({
            ...prev,
            backendConnected: true,
            lastChecked: new Date()
          }));
        }

        // Also fetch any existing applications and certificates from Django DB
        const [apiApps, apiCerts] = await Promise.all([
          api.getApplications(),
          api.getCertificates()
        ]);

        if (isMounted) {
          if (apiApps && apiApps.length > 0) {
            setApplications((prev) => (prev.length === 0 ? apiApps : prev));
          }
          if (apiCerts && apiCerts.length > 0) {
            setCertificates((prev) => (prev.length === 0 ? apiCerts : prev));
          }
        }
      } catch (err) {
        if (isMounted) {
          setSystemHealth((prev) => ({ ...prev, backendConnected: false }));
        }
      }
    }

    syncBackend();
    const interval = setInterval(syncBackend, 25000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ── Toast helpers ────────────────────────────────────────────────────────
  const addToast = (message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Submit new application (Dual-Sync: Firestore + Django REST) ──────────
  const submitApplication = async (formData) => {
    const appId = generateAppId();
    const now = new Date();

    const appPayload = {
      ...formData,
      id: appId,
      status: 'Application Submitted',
      submittedAt: now.toISOString().split('T')[0],
      feeStatus: 'Paid (Online - METRAPAY)',
      timeline: [
        {
          stage: 'Application Submitted',
          date: now.toLocaleString(),
          status: 'completed',
          title: 'Application Submitted',
          description: 'Application successfully registered in National Portal.',
          actor: formData.applicantName || 'Applicant'
        },
        {
          stage: 'Under Review',
          date: 'Pending',
          status: 'upcoming',
          title: 'Document Scrutiny',
          description: 'Awaiting review by Legal Metrology Officer.',
          actor: 'Legal Metrology Officer'
        },
        {
          stage: 'Verification Scheduled',
          date: 'Pending',
          status: 'upcoming',
          title: 'Inspection Slot Allocation',
          description: 'Date and inspector will be allocated.',
          actor: 'Legal Metrology Officer'
        },
        {
          stage: 'Verification / Inspection',
          date: 'Pending',
          status: 'upcoming',
          title: 'Physical Testing',
          description: 'Inspection of standards and tolerance.',
          actor: 'Officer'
        },
        {
          stage: 'Certificate Generated',
          date: 'Pending',
          status: 'upcoming',
          title: 'Digital Certificate',
          description: 'Official digital seal & QR certificate.',
          actor: 'System'
        }
      ]
    };

    // Immediate optimistic update
    setApplications((prev) => [appPayload, ...prev]);

    try {
      // 1. Save to Cloud Firestore
      const saved = await firestoreApplications.create(appPayload);

      await firestoreTimeline.addEvent(saved.id || appId, {
        stage: 'Application Submitted',
        title: 'Application Submitted',
        description: 'Application successfully registered.',
        actor: formData.applicantName || 'Applicant',
        status: 'completed'
      });

      // 2. Dual-Sync: Save to Django REST backend & Database
      api.createApplication(appPayload)
        .then(() => console.info('Dual-Sync: Application synced to Django REST'))
        .catch((e) => console.warn('Dual-Sync note (Django sync queued):', e.message));

      addToast(
        `Application ${appId} lodged successfully! Synced to Cloud Database and Backend.`,
        'success',
        'Submission Received'
      );
      return saved;
    } catch (err) {
      console.warn('Firestore write failed, trying Django direct:', err.message);
      // Fallback: Django direct
      api.createApplication(appPayload).catch(() => {});
      addToast(
        `Application ${appId} submitted via backup pipeline.`,
        'info',
        'Submitted'
      );
      return appPayload;
    }
  };

  // Helper: find application
  const findApp = (id) =>
    applications.find((a) => a.id === id || a.id?.toLowerCase() === id?.toLowerCase());

  // ── Resubmit application (Dual-Sync) ─────────────────────────────────────
  const resubmitApplication = async (id, applicantNotes) => {
    const app = findApp(id);
    if (!app) return null;

    const timelineEvent = {
      stage: 'Under Review',
      date: new Date().toLocaleString(),
      status: 'current',
      title: 'Application Resubmitted with Corrections',
      description: `Applicant notes: ${applicantNotes}. Re-submitted for officer scrutiny.`,
      actor: (app.applicantName || 'Applicant') + ' (Applicant)'
    };

    const updatedTimeline = [...(app.timeline || []), timelineEvent];

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'Under Review', applicantCorrectionNotes: applicantNotes, timeline: updatedTimeline }
          : a
      )
    );

    // 1. Cloud Firestore update
    const firestoreDocId = app.firestoreId || app.id;
    firestoreApplications.update(firestoreDocId, {
      status: 'Under Review',
      applicantCorrectionNotes: applicantNotes,
      timeline: updatedTimeline
    }).catch((e) => console.warn('Firestore resubmit note:', e.message));

    // 2. Django Backend update
    api.resubmitApplication(id, applicantNotes).catch(() => {});

    addToast(`Application ${id} resubmitted for officer scrutiny.`, 'success', 'Resubmitted');
  };

  // ── Officer: Return for Correction (Dual-Sync) ───────────────────────────
  const returnApplication = async (id, reason) => {
    const app = findApp(id);
    if (!app) return null;

    const timelineEvent = {
      stage: 'Returned for Correction',
      date: new Date().toLocaleString(),
      status: 'current',
      title: 'Returned for Correction',
      description: reason,
      actor: 'Legal Metrology Officer (Ramesh varma)'
    };

    const updatedTimeline = [...(app.timeline || []), timelineEvent];

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'Returned for Correction', returnReason: reason, returnedAt: new Date().toLocaleString(), timeline: updatedTimeline }
          : a
      )
    );

    // 1. Cloud Firestore
    const firestoreDocId = app.firestoreId || app.id;
    firestoreApplications.update(firestoreDocId, {
      status: 'Returned for Correction',
      returnReason: reason,
      returnedAt: new Date().toLocaleString(),
      timeline: updatedTimeline
    }).catch((e) => console.warn('Firestore return note:', e.message));

    // 2. Django Backend
    api.returnApplication(id, reason).catch(() => {});

    addToast(`Application ${id} returned for correction.`, 'warning', 'Correction Requested');
  };

  // ── Officer: Schedule Verification (Dual-Sync) ───────────────────────────
  const scheduleVerification = async (id, scheduleData) => {
    const app = findApp(id);
    if (!app) return null;

    const timelineEvent = {
      stage: 'Verification Scheduled',
      date: new Date().toLocaleString(),
      status: 'current',
      title: 'Inspection Date & Slot Assigned',
      description: `Scheduled for ${scheduleData.date} during ${scheduleData.slot} at ${scheduleData.venue}. Assigned Inspector: ${scheduleData.officer}.`,
      actor: scheduleData.officer || 'Legal Metrology Officer'
    };

    const updatedTimeline = [
      ...(app.timeline || []),
      timelineEvent,
      {
        stage: 'Verification / Inspection',
        date: `Scheduled: ${scheduleData.date}`,
        status: 'upcoming',
        title: 'Field / Lab Verification',
        description: 'Physical testing against standard weights & measures.',
        actor: 'Inspectorate Team'
      }
    ];

    const updates = {
      status: 'Verification Scheduled',
      scheduledDate: scheduleData.date,
      scheduledSlot: scheduleData.slot,
      inspectionVenue: scheduleData.venue,
      assignedOfficer: scheduleData.officer,
      inspectorRemarks: scheduleData.instructions || '',
      timeline: updatedTimeline
    };

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );

    // 1. Cloud Firestore
    const firestoreDocId = app.firestoreId || app.id;
    firestoreApplications.update(firestoreDocId, updates).catch(() => {});

    // 2. Django Backend
    api.scheduleVerification(id, scheduleData).catch(() => {});

    addToast(`Inspection scheduled for ${scheduleData.date}.`, 'success', 'Verification Scheduled');
  };

  // ── Officer: Approve & Generate Certificate (Dual-Sync) ───────────────────
  const approveAndGenerateCertificate = async (id, inspectionData) => {
    const app = findApp(id);
    if (!app) return null;

    const nowStr = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const expiryStr = expiryDate.toISOString().split('T')[0];

    const certNumber = `CERT-LM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase()}`;
    const sealNumber = `KL-07-SEAL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCertificate = {
      certificateNumber: certNumber,
      applicationId: app.id || id,
      applicantName: app.applicantName,
      businessName: app.businessName,
      gstin: app.gstin,
      premisesAddress: `${app.address || ''}, ${app.district || ''}, ${app.state || ''} ${app.pincode || ''}`,
      instrumentType: app.instrumentType,
      instrumentCategory: app.instrumentCategory || 'Legal Metrology Instrument',
      instrumentClass: app.instrumentClass,
      manufacturer: app.manufacturer,
      modelNumber: app.modelNumber,
      serialNumber: app.serialNumber,
      capacity: app.capacity,
      verificationDate: nowStr,
      expiryDate: expiryStr,
      issuingAuthority: 'Office of the Assistant Controller of Legal Metrology',
      verifyingOfficer: inspectionData.inspector || 'Ramesh varma',
      officerDesignation: 'Senior Legal Metrology Officer',
      verificationPlace: `${app.district || 'Ernakulam'} Enforcement Division`,
      sealNumber,
      feePaid: `₹ ${app.feeAmount || 850}.00`,
      receiptNumber: `REC-${(app.id || id).replace('MV-', '')}`,
      securityHash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      status: 'Active',
      inspectionNotes: inspectionData.remarks || 'Standard weights verified within permissible MPE tolerance.'
    };

    const certEvents = [
      {
        stage: 'Verification / Inspection',
        date: new Date().toLocaleString(),
        status: 'completed',
        title: 'Inspection Passed',
        description: `Max observed error within MPE tolerance. Seal #${sealNumber} applied.`,
        actor: inspectionData.inspector || 'Ramesh varma'
      },
      {
        stage: 'Certificate Generated',
        date: new Date().toLocaleString(),
        status: 'completed',
        title: 'Digital Certificate Issued',
        description: `Certificate ${certNumber} issued with digital security seal and QR verification.`,
        actor: 'Controller of Legal Metrology'
      }
    ];

    // Optimistic state updates
    setCertificates((prev) => [newCertificate, ...prev]);
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'Certificate Generated',
              certificateId: certNumber,
              inspectionData,
              timeline: [...(a.timeline || []), ...certEvents]
            }
          : a
      )
    );

    // 1. Cloud Firestore write
    const firestoreDocId = app.firestoreId || app.id;
    firestoreCertificates.create(newCertificate).catch(() => {});
    firestoreApplications.update(firestoreDocId, {
      status: 'Certificate Generated',
      certificateId: certNumber,
      inspectionData,
      timeline: [...(app.timeline || []), ...certEvents]
    }).catch(() => {});

    // 2. Django REST Backend write
    api.recordInspectionAndApprove(id, inspectionData).catch(() => {});

    addToast(`Instrument approved! Digital Certificate ${certNumber} issued.`, 'success', 'Certificate Generated');
    return { app, certificate: newCertificate };
  };

  // ── Officer: Reject Application (Dual-Sync) ───────────────────────────────
  const rejectApplication = async (id, reason) => {
    const app = findApp(id);
    if (!app) return null;

    const timelineEvent = {
      stage: 'Rejected',
      date: new Date().toLocaleString(),
      status: 'completed',
      title: 'Verification Rejected',
      description: `Reason: ${reason}. Rejection order issued under Legal Metrology Act.`,
      actor: 'Legal Metrology Officer'
    };

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'Rejected', rejectionReason: reason, rejectedAt: new Date().toLocaleString(), timeline: [...(a.timeline || []), timelineEvent] }
          : a
      )
    );

    // 1. Cloud Firestore
    const firestoreDocId = app.firestoreId || app.id;
    firestoreApplications.update(firestoreDocId, {
      status: 'Rejected',
      rejectionReason: reason,
      rejectedAt: new Date().toLocaleString(),
      timeline: [...(app.timeline || []), timelineEvent]
    }).catch(() => {});

    // 2. Django Backend
    api.rejectApplication(id, reason).catch(() => {});

    addToast(`Application ${id} marked as rejected.`, 'error', 'Application Rejected');
  };

  // ── Certificate Expiry Calculations ──────────────────────────────────────
  const certificateExpirySummary = useMemo(() => {
    const urgent = [], warning = [], reminder = [], expired = [], valid = [];
    certificates.forEach((cert) => {
      const info = getExpiryAlertInfo(cert.expiryDate);
      const enriched = { ...cert, expiryInfo: info };
      if (info.severity === 'expired') expired.push(enriched);
      else if (info.severity === 'urgent') urgent.push(enriched);
      else if (info.severity === 'warning') warning.push(enriched);
      else if (info.severity === 'reminder') reminder.push(enriched);
      else valid.push(enriched);
    });
    return {
      urgent, warning, reminder, expired, valid,
      totalActionRequired: urgent.length + warning.length + expired.length,
      allExpiringSoon: [...expired, ...urgent, ...warning, ...reminder]
    };
  }, [certificates]);

  return (
    <AppContext.Provider
      value={{
        applications,
        certificates,
        toasts,
        addToast,
        removeToast,
        searchQuery,
        setSearchQuery,
        submitApplication,
        resubmitApplication,
        returnApplication,
        scheduleVerification,
        approveAndGenerateCertificate,
        rejectApplication,
        certificateExpirySummary,
        systemHealth
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
