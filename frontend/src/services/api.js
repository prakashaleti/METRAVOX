// API service for METRAVOX connecting React frontend to Django REST API

const API_BASE_URL = window.location.port === '5173'
  ? 'http://localhost:8000/api/v1'
  : '/api/v1';

export const api = {
  // Applications
  getApplications: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/applications/${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch applications');
      const data = await res.json();
      return data.results || data;
    } catch (err) {
      console.warn('API getApplications fallback:', err.message);
      return null;
    }
  },

  getApplicationById: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}/`);
      if (!res.ok) throw new Error('Application not found');
      return await res.json();
    } catch (err) {
      console.warn('API getApplicationById fallback:', err.message);
      return null;
    }
  },

  createApplication: async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create application');
      return await res.json();
    } catch (err) {
      console.warn('API createApplication fallback:', err.message);
      return null;
    }
  },

  returnApplication: async (id, reason) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}/return_for_correction/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to return application');
      return await res.json();
    } catch (err) {
      console.warn('API returnApplication fallback:', err.message);
      return null;
    }
  },

  resubmitApplication: async (id, notes) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}/resubmit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to resubmit application');
      return await res.json();
    } catch (err) {
      console.warn('API resubmitApplication fallback:', err.message);
      return null;
    }
  },

  scheduleVerification: async (id, scheduleData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}/schedule_inspection/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });
      if (!res.ok) throw new Error('Failed to schedule inspection');
      return await res.json();
    } catch (err) {
      console.warn('API scheduleVerification fallback:', err.message);
      return null;
    }
  },

  recordInspectionAndApprove: async (id, testData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}/record_inspection_and_approve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      if (!res.ok) throw new Error('Failed to record inspection');
      return await res.json();
    } catch (err) {
      console.warn('API recordInspectionAndApprove fallback:', err.message);
      return null;
    }
  },

  rejectApplication: async (id, reason) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}/reject/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to reject application');
      return await res.json();
    } catch (err) {
      console.warn('API rejectApplication fallback:', err.message);
      return null;
    }
  },

  // Certificates
  getCertificates: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/certificates/${query ? `?${query}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch certificates');
      const data = await res.json();
      return data.results || data;
    } catch (err) {
      console.warn('API getCertificates fallback:', err.message);
      return null;
    }
  },

  getCertificateByNumber: async (certNumber) => {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/${certNumber}/`);
      if (!res.ok) throw new Error('Certificate not found');
      return await res.json();
    } catch (err) {
      console.warn('API getCertificateByNumber fallback:', err.message);
      return null;
    }
  },

  verifyCertificateAuthenticity: async (certNumber) => {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/verify_authenticity/?cert=${encodeURIComponent(certNumber)}`);
      if (!res.ok) throw new Error('Authenticity verification failed');
      return await res.json();
    } catch (err) {
      console.warn('API verifyCertificateAuthenticity fallback:', err.message);
      return null;
    }
  },

  getExpiryAlerts: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/expiry_alerts/`);
      if (!res.ok) throw new Error('Failed to fetch expiry alerts');
      return await res.json();
    } catch (err) {
      console.warn('API getExpiryAlerts fallback:', err.message);
      return null;
    }
  },

  // Analytics & History
  getDashboardStats: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/stats/`);
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return await res.json();
    } catch (err) {
      console.warn('API getDashboardStats fallback:', err.message);
      return null;
    }
  },

  getHistory: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/history/`);
      if (!res.ok) throw new Error('Failed to fetch history');
      return await res.json();
    } catch (err) {
      console.warn('API getHistory fallback:', err.message);
      return null;
    }
  },

  // Authentication & Verification Mail
  auth: {
    login: async (usernameOrEmail, password) => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameOrEmail, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Authentication failed');
        if (data.access_token) {
          localStorage.setItem('metravox_access_token', data.access_token);
        }
        if (data.refresh_token) {
          localStorage.setItem('metravox_refresh_token', data.refresh_token);
        }
        return data;
      } catch (err) {
        console.warn('API auth.login error:', err.message);
        throw err;
      }
    },

    refreshToken: async () => {
      const refreshToken = localStorage.getItem('metravox_refresh_token');
      if (!refreshToken) return null;
      try {
        const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) throw new Error('Token refresh failed');
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('metravox_access_token', data.access_token);
        }
        return data;
      } catch (e) {
        console.warn('Refresh token error:', e.message);
        return null;
      }
    },

    getCurrentUser: async () => {
      const token = localStorage.getItem('metravox_access_token');
      if (!token) return null;
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    register: async (userData) => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        if (data.access_token) {
          localStorage.setItem('metravox_access_token', data.access_token);
        }
        if (data.refresh_token) {
          localStorage.setItem('metravox_refresh_token', data.refresh_token);
        }
        return data;
      } catch (err) {
        console.warn('API auth.register error:', err.message);
        throw err;
      }
    },

    getPasswordList: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/passwords/`);
        if (!res.ok) throw new Error('Failed to fetch password list');
        return await res.json();
      } catch (err) {
        console.warn('API auth.getPasswordList fallback:', err.message);
        return null;
      }
    },

    sendVerificationEmail: async ({ email, name, applicationId, instrumentType, type } = {}) => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/send_verification_email/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email || 'prakash01.aleti@gmail.com',
            name: name || 'prakash',
            applicationId: applicationId || 'MV-2026-NEW',
            instrumentType: instrumentType || 'Class III Electronic Platform Scale',
            type: type || 'verification'
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to dispatch verification email');
        return data;
      } catch (err) {
        console.warn('API auth.sendVerificationEmail error:', err.message);
        throw err;
      }
    },

    requestPasswordReset: async (email) => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/forgot_password/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to request password reset OTP');
        return data;
      } catch (err) {
        console.warn('API auth.requestPasswordReset error:', err.message);
        throw err;
      }
    },

    confirmPasswordReset: async (email, otp, newPassword) => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/reset_password/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            otp,
            new_password: newPassword
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to confirm password reset');
        return data;
      } catch (err) {
        console.warn('API auth.confirmPasswordReset error:', err.message);
        throw err;
      }
    }
  }
};

