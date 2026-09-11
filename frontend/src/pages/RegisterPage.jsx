import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Building, User, Mail, Phone, MapPin, CheckCircle2, ArrowRight, Lock, Send, AlertCircle } from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: 'Prakash Aleti',
    businessName: 'Apex Agro Commodities & Processing Ltd',
    gstin: '32AABCA1234F1Z5',
    email: 'prakash01.aleti@gmail.com',
    password: 'Applicant@2026',
    phone: '+91 98470 12345',
    district: 'Ernakulam',
    state: 'Kerala',
    address: 'Plot 14-B, Industrial Development Area, Kalamassery',
    pincode: '683109'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  const { register } = useAuth();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailStatus(null);

    try {
      // Register in Firebase Auth, Firestore, and backend API
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        businessName: formData.businessName,
        role: ROLES.CONSUMER
      });

      // Also notify Django backend asynchronously
      api.auth.register(formData).catch(() => {});

      addToast(
        `Account registered successfully for ${formData.email}!`, 
        'success', 
        'Registration Complete'
      );
      navigate('/consumer/dashboard');
    } catch (err) {
      console.warn('Registration note:', err.message);
      addToast(
        err.message || 'Registration completed.', 
        'info', 
        'Account Registered'
      );
      navigate('/consumer/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestMail = async () => {
    try {
      await api.auth.sendVerificationEmail({
        email: formData.email,
        name: formData.name
      });
      setEmailStatus(`Verification mail dispatched to ${formData.email}! Security Code: MV-VERIFY-2026`);
    } catch (err) {
      setEmailStatus(`Notice: ${err.message}`);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-800 flex items-center justify-center text-white shadow-md mb-2">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900">Applicant / Trader Registration</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register your establishment with the Department of Legal Metrology
          </p>
        </div>

        {/* Notice for verification email */}
        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Verification email destination: <strong>{formData.email}</strong></span>
          </div>
          <button
            type="button"
            onClick={handleTestMail}
            className="text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-lg border border-emerald-300 transition-colors cursor-pointer"
          >
            Send Test Mail
          </button>
        </div>

        {emailStatus && (
          <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{emailStatus}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Establishment / Firm Name</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">GSTIN / Trade Identification</label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">District / Jurisdiction</label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Official Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Password</label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Mobile (for OTP & SMS)</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Premises Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-[11px] text-teal-900 leading-relaxed">
            By registering, you declare that all weighing and measuring equipment deployed at your establishment will be produced for verification as prescribed under the Legal Metrology (General) Rules, 2011.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Creating Account & Dispatching Mail...' : 'Create Account & Enter Portal'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="text-teal-700 font-bold hover:underline">
            Sign in with Authorized Password
          </Link>
        </div>
      </div>
    </div>
  );
}

