// Firebase configuration for METRAVOX
// Project: metravox-374ef | Web App ID: 1:880377844612:web:a7a81b26ac089baafdc3d1

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBoU1X1t5Ovgb5CyRovlwFsKNYazIFw5DM",
  authDomain: "metravox-374ef.firebaseapp.com",
  projectId: "metravox-374ef",
  storageBucket: "metravox-374ef.firebasestorage.app",
  messagingSenderId: "880377844612",
  appId: "1:880377844612:web:a7a81b26ac089baafdc3d1",
  measurementId: "G-Z3N4SJVP1P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics (optional, only in browser)
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch {
  // analytics not available in non-browser env
}
export { analytics };

export default app;
