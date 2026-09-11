import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ConsumerDashboard from './pages/consumer/ConsumerDashboard';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import NewApplication from './pages/applications/NewApplication';
import ApplicationList from './pages/applications/ApplicationList';
import ApplicationDetails from './pages/applications/ApplicationDetails';
import ApplicationTracking from './pages/applications/ApplicationTracking';
import CertificatesList from './pages/certificates/CertificatesList';
import CertificateDetail from './pages/certificates/CertificateDetail';
import VerifyCertificate from './pages/public/VerifyCertificate';
import ScanQrPage from './pages/public/ScanQrPage';
import VerificationHistory from './pages/history/VerificationHistory';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/scan" element={<ScanQrPage />} />
              <Route path="/verify" element={<ScanQrPage />} />
              <Route path="/verify/:certNumber" element={<VerifyCertificate />} />

              {/* Role Dashboards */}
              <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />
              <Route path="/officer/dashboard" element={<OfficerDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Application Lifecycle */}
              <Route path="/applications" element={<ApplicationList />} />
              <Route path="/applications/new" element={<NewApplication />} />
              <Route path="/applications/:id" element={<ApplicationDetails />} />
              <Route path="/track" element={<ApplicationTracking />} />

              {/* Certificates */}
              <Route path="/certificates" element={<CertificatesList />} />
              <Route path="/certificates/:id" element={<CertificateDetail />} />

              {/* History & Audit */}
              <Route path="/history" element={<VerificationHistory />} />

              {/* Notifications & Expiry Alerts */}
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Profile & Settings */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}
