// Firestore service for METRAVOX
// Handles all database read/write operations

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Collection References ─────────────────────────────────────────────────
const COLLECTIONS = {
  USERS: 'users',
  APPLICATIONS: 'applications',
  CERTIFICATES: 'certificates',
  TIMELINE: 'timeline',
  INSPECTIONS: 'inspections',
  DOCUMENTS: 'documents'
};

// ─── Utilities ─────────────────────────────────────────────────────────────
const formatTimestamp = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (val.toDate && typeof val.toDate === 'function') {
    return val.toDate().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  if (val.seconds) {
    return new Date(val.seconds * 1000).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  return String(val);
};

const docToObj = (snap) => {
  const data = snap.data();
  if (!data) return { id: snap.id };

  const sanitized = { ...data };
  for (const key of ['submittedAt', 'updatedAt', 'createdAt', 'verificationDate', 'expiryDate', 'returnedAt', 'scheduledDate']) {
    if (sanitized[key] && typeof sanitized[key] === 'object') {
      sanitized[key] = formatTimestamp(sanitized[key]);
    }
  }

  return {
    id: data.id || snap.id,
    firestoreId: snap.id,
    ...sanitized
  };
};

const colToArray = (snap) => snap.docs.map(docToObj);

// ─── Default Personas for Firestore ─────────────────────────────────────────
export const DEFAULT_USERS = [
  {
    id: 'usr-prakash',
    email: 'prakash01.aleti@gmail.com',
    password: 'Applicant@2026',
    role: 'consumer',
    name: 'prakash',
    roleTitle: 'Registered Trader / Applicant',
    organization: 'Prakash Industrial & Trade Enterprises',
    gstin: '32AABCP9871F1Z2',
    phone: '+91 98470 12345',
    district: 'Ernakulam',
    state: 'Kerala',
    avatar: 'PK',
    department: 'Industrial & Trade Operations'
  },
  {
    id: 'usr-ramesh',
    email: 'ramesh.varma.lmo@gov.in',
    password: 'Officer@2026',
    role: 'officer',
    name: 'Ramesh varma',
    roleTitle: 'Senior Legal Metrology Officer',
    organization: 'Department of Legal Metrology, Ernakulam Central Zone 04',
    badgeNumber: 'LMO-KL-2026-RV',
    phone: '+91 94470 55102',
    district: 'Ernakulam Zone 04',
    state: 'Kerala',
    avatar: 'RV',
    department: 'Enforcement & Standards Verification'
  },
  {
    id: 'usr-rohith',
    email: 'rohith.admin@gov.in',
    password: 'Admin@2026',
    role: 'admin',
    name: 'Rohith',
    roleTitle: 'Assistant Controller & State Admin',
    organization: 'Ministry of Consumer Affairs, Legal Metrology Directorate HQ',
    adminCode: 'ACLM-HQ-ROHITH',
    phone: '+91 98110 44552',
    district: 'National / State HQ',
    state: 'Government of India',
    avatar: 'RO',
    department: 'Directorate of Legal Metrology'
  }
];

// ─── Users (Firestore-Native Authentication) ───────────────────────────────
export const firestoreUsers = {
  /**
   * Ensure default verified accounts exist in Firestore
   */
  seedDefaultUsers: async () => {
    try {
      for (const u of DEFAULT_USERS) {
        const docRef = doc(db, COLLECTIONS.USERS, u.id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          await setDoc(docRef, {
            ...u,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.info(`Firestore Seeded: ${u.email} (${u.role})`);
        }
      }
    } catch (err) {
      console.warn('Firestore seed note:', err.message);
    }
  },

  /**
   * Create or overwrite user profile in Firestore
   */
  upsert: async (uid, profile) => {
    try {
      await setDoc(doc(db, COLLECTIONS.USERS, uid), {
        ...profile,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('firestoreUsers.upsert note:', err.message);
    }
  },

  /**
   * Get user by document ID
   */
  get: async (uid) => {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
      return snap.exists() ? docToObj(snap) : null;
    } catch (err) {
      console.warn('firestoreUsers.get note:', err.message);
      return null;
    }
  },

  /**
   * Get user by email address
   */
  getByEmail: async (email) => {
    try {
      const clean = email.trim().toLowerCase();
      const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', clean));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return docToObj(snap.docs[0]);
      }
      // Check default fallback
      const fallback = DEFAULT_USERS.find(u => u.email.toLowerCase() === clean);
      return fallback || null;
    } catch (err) {
      console.warn('firestoreUsers.getByEmail note:', err.message);
      const fallback = DEFAULT_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      return fallback || null;
    }
  },

  /**
   * Authenticate user against Firestore database
   */
  authenticateUser: async (email, password, requestedRole = 'consumer') => {
    const clean = email.trim().toLowerCase();

    // 1. Try querying Firestore database
    try {
      const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', clean));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const userDoc = docToObj(snap.docs[0]);
        if (userDoc.password && userDoc.password !== password) {
          throw new Error('Incorrect password for this registered account.');
        }
        // Update last login
        setDoc(doc(db, COLLECTIONS.USERS, userDoc.id), {
          lastLogin: new Date().toISOString()
        }, { merge: true }).catch(() => {});

        return userDoc;
      }
    } catch (err) {
      if (err.message.includes('Incorrect password')) throw err;
      console.warn('Firestore user query note:', err.message);
    }

    // 2. Check DEFAULT_USERS
    const defaultMatch = DEFAULT_USERS.find(u => u.email.toLowerCase() === clean);
    if (defaultMatch) {
      if (defaultMatch.password !== password) {
        throw new Error('Incorrect password for this registered account.');
      }
      // Persist into Firestore so it's visible in console
      setDoc(doc(db, COLLECTIONS.USERS, defaultMatch.id), {
        ...defaultMatch,
        lastLogin: new Date().toISOString()
      }, { merge: true }).catch(() => {});
      return defaultMatch;
    }

    // 3. User doesn't exist yet -> Auto-create in Firestore!
    const newId = 'usr-' + Math.random().toString(36).substring(2, 10);
    const newUser = {
      id: newId,
      email: clean,
      password: password,
      role: requestedRole,
      name: clean.split('@')[0],
      roleTitle: requestedRole === 'officer' ? 'Legal Metrology Officer' : requestedRole === 'admin' ? 'State Administrator' : 'Registered Trader / Applicant',
      organization: requestedRole === 'officer' ? 'Department of Legal Metrology' : requestedRole === 'admin' ? 'Directorate HQ' : 'Commercial Establishment',
      avatar: clean.substring(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, COLLECTIONS.USERS, newId), newUser);
      console.info(`Auto-Created in Firestore: ${clean} as ${requestedRole}`);
    } catch (saveErr) {
      console.warn('Could not persist new user to Firestore:', saveErr.message);
    }

    return newUser;
  },

  /**
   * Register a new user in Firestore
   */
  registerUser: async (userData) => {
    const clean = userData.email.trim().toLowerCase();
    const existing = await firestoreUsers.getByEmail(clean);
    if (existing && existing.id && !existing.id.startsWith('usr-default')) {
      throw new Error('An account with this email is already registered. Please sign in.');
    }

    const newId = 'usr-' + Math.random().toString(36).substring(2, 10);
    const newUser = {
      id: newId,
      email: clean,
      password: userData.password,
      role: userData.role || 'consumer',
      name: userData.name || clean.split('@')[0],
      businessName: userData.businessName || '',
      gstin: userData.gstin || '',
      phone: userData.phone || '',
      address: userData.address || '',
      district: userData.district || 'Ernakulam',
      state: userData.state || 'Kerala',
      avatar: (userData.name || clean).substring(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, COLLECTIONS.USERS, newId), newUser);
    } catch (err) {
      console.warn('Firestore registerUser write note:', err.message);
    }

    return newUser;
  },

  /**
   * Reset applicant user password in Firestore
   */
  resetPassword: async (email, newPassword) => {
    const clean = email.trim().toLowerCase();
    try {
      const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', clean));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docRef = doc(db, COLLECTIONS.USERS, snap.docs[0].id);
        await updateDoc(docRef, {
          password: newPassword,
          updatedAt: serverTimestamp()
        });
        return true;
      }
      // Also update in DEFAULT_USERS in memory if present
      const def = DEFAULT_USERS.find(u => u.email.toLowerCase() === clean);
      if (def) {
        def.password = newPassword;
        await setDoc(doc(db, COLLECTIONS.USERS, def.id), {
          ...def,
          password: newPassword,
          updatedAt: serverTimestamp()
        }, { merge: true });
        return true;
      }
      return false;
    } catch (err) {
      console.warn('firestoreUsers.resetPassword error:', err.message);
      const def = DEFAULT_USERS.find(u => u.email.toLowerCase() === clean);
      if (def) {
        def.password = newPassword;
      }
      return true;
    }
  }
};

// ─── Applications ──────────────────────────────────────────────────────────
export const firestoreApplications = {
  /**
   * Get all applications (optionally filtered by applicant UID)
   */
  getAll: async (applicantUid = null) => {
    try {
      let q;
      if (applicantUid) {
        q = query(
          collection(db, COLLECTIONS.APPLICATIONS),
          where('applicantUid', '==', applicantUid),
          orderBy('submittedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, COLLECTIONS.APPLICATIONS),
          orderBy('submittedAt', 'desc')
        );
      }
      const snap = await getDocs(q);
      return colToArray(snap);
    } catch (err) {
      console.warn('Firestore getApplications:', err.message);
      return [];
    }
  },

  /**
   * Get a single application by its Firestore document ID
   */
  getById: async (appId) => {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.APPLICATIONS, appId));
      return snap.exists() ? docToObj(snap) : null;
    } catch (err) {
      console.warn('Firestore getApplicationById:', err.message);
      return null;
    }
  },

  /**
   * Create a new application document
   */
  create: async (appData) => {
    try {
      const payload = {
        ...appData,
        status: 'Application Submitted',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const ref = await addDoc(collection(db, COLLECTIONS.APPLICATIONS), payload);
      return { id: ref.id, ...payload };
    } catch (err) {
      console.error('Firestore createApplication:', err.message);
      throw err;
    }
  },

  /**
   * Update fields on an existing application
   */
  update: async (appId, updates) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.APPLICATIONS, appId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error('Firestore updateApplication:', err.message);
      throw err;
    }
  },

  /**
   * Real-time listener — calls callback(apps[]) on every change
   * Returns unsubscribe function
   */
  listen: (callback, applicantUid = null) => {
    try {
      let q;
      if (applicantUid) {
        q = query(
          collection(db, COLLECTIONS.APPLICATIONS),
          where('applicantUid', '==', applicantUid)
        );
      } else {
        q = collection(db, COLLECTIONS.APPLICATIONS);
      }
      return onSnapshot(
        q,
        (snap) => {
          callback(colToArray(snap));
        },
        (err) => {
          console.warn('Firestore applications listener fallback:', err.message);
        }
      );
    } catch (err) {
      console.warn('Firestore listen setup error:', err.message);
      return () => {};
    }
  }
};

// ─── Certificates ──────────────────────────────────────────────────────────
export const firestoreCertificates = {
  /**
   * Get all certificates
   */
  getAll: async () => {
    try {
      const q = collection(db, COLLECTIONS.CERTIFICATES);
      const snap = await getDocs(q);
      return colToArray(snap);
    } catch (err) {
      console.warn('Firestore getCertificates:', err.message);
      return [];
    }
  },

  /**
   * Get certificate by certificateNumber field
   */
  getByNumber: async (certNumber) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.CERTIFICATES),
        where('certificateNumber', '==', certNumber)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return docToObj(snap.docs[0]);
    } catch (err) {
      console.warn('Firestore getCertificateByNumber:', err.message);
      return null;
    }
  },

  /**
   * Create a new certificate
   */
  create: async (certData) => {
    try {
      const payload = {
        ...certData,
        createdAt: serverTimestamp()
      };
      const ref = await addDoc(collection(db, COLLECTIONS.CERTIFICATES), payload);
      return { id: ref.id, ...payload };
    } catch (err) {
      console.error('Firestore createCertificate:', err.message);
      throw err;
    }
  },

  /**
   * Real-time listener for certificates
   * Returns unsubscribe function
   */
  listen: (callback) => {
    try {
      const q = collection(db, COLLECTIONS.CERTIFICATES);
      return onSnapshot(
        q,
        (snap) => {
          callback(colToArray(snap));
        },
        (err) => {
          console.warn('Firestore certificates listener fallback:', err.message);
        }
      );
    } catch (err) {
      console.warn('Firestore cert listen setup error:', err.message);
      return () => {};
    }
  }
};

// ─── Timeline (sub-events) ─────────────────────────────────────────────────
export const firestoreTimeline = {
  addEvent: async (applicationId, event) => {
    try {
      await addDoc(collection(db, COLLECTIONS.TIMELINE), {
        applicationId,
        ...event,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore addTimelineEvent:', err.message);
    }
  }
};

// ─── Inspections ───────────────────────────────────────────────────────────
export const firestoreInspections = {
  create: async (inspectionData) => {
    try {
      const ref = await addDoc(collection(db, COLLECTIONS.INSPECTIONS), {
        ...inspectionData,
        createdAt: serverTimestamp()
      });
      return { id: ref.id, ...inspectionData };
    } catch (err) {
      console.error('Firestore createInspection:', err.message);
      throw err;
    }
  }
};
