import React from 'react';
import { User, Building2, Mail, Phone, MapPin, ShieldCheck, Award, Scale } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, currentRole } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold text-teal-700 tracking-wider block">
            National Legal Metrology Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            Account Profile & Identity
          </h1>
          <p className="text-xs text-slate-500">
            Authenticated profile information and verification jurisdiction
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
          Status: Active & Verified
        </span>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {user.avatar}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">{user.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{user.roleTitle}</p>
            <p className="text-xs text-teal-800 font-semibold">{user.organization}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 block text-[11px] uppercase font-bold">User Account ID</span>
            <span className="font-mono font-bold text-slate-900 text-sm block">{user.id}</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block text-[11px] uppercase font-bold">Department / Division</span>
            <span className="font-semibold text-slate-800 text-sm block">{user.department}</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block text-[11px] uppercase font-bold">Official Email</span>
            <span className="font-semibold text-slate-800 block">{user.email}</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block text-[11px] uppercase font-bold">Contact Mobile</span>
            <span className="font-semibold text-slate-800 block">{user.phone}</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block text-[11px] uppercase font-bold">Enforcement District / Jurisdiction</span>
            <span className="font-semibold text-slate-800 block">{user.district}</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block text-[11px] uppercase font-bold">State / Union Territory</span>
            <span className="font-semibold text-slate-800 block">{user.state}</span>
          </div>
        </div>

        {/* Role Specific Notice */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <strong>Regulatory Authority:</strong> Authenticated under Section 13/14 of the Legal Metrology Act, 2009. Any updates to establishment registration or officer jurisdictional zoning must be countersigned by the Assistant Controller.
        </div>
      </div>
    </div>
  );
}
