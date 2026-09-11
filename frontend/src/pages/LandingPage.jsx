import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Scale, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Award, 
  QrCode, 
  Building2, 
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Lock,
  Layers
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const [trackInput, setTrackInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const { applications, certificates } = useApp();
  const navigate = useNavigate();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackInput.trim()) {
      navigate(`/track?id=${encodeURIComponent(trackInput.trim())}`);
    }
  };

  const handleCertSubmit = (e) => {
    e.preventDefault();
    if (certInput.trim()) {
      navigate(`/verify/${encodeURIComponent(certInput.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-teal-950 to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid and decorative background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Scale className="w-4 h-4 text-teal-400" />
            Legal Metrology Verification Digital Portal
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif max-w-4xl mx-auto leading-tight sm:leading-tight">
            METRA<span className="text-teal-400">VOX</span>
            <span className="block text-xl sm:text-3xl font-sans font-medium text-slate-300 mt-2">
              Online Verification System for Weighing & Measuring Instruments
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            Digitally managing the complete statutory verification, inspection, stamping, and digital certification lifecycle under the Legal Metrology Act, 2009.
          </p>

          {/* Quick Dual Search (Track Application / Verify Certificate) */}
          <div className="max-w-3xl mx-auto pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Track Application */}
            <form onSubmit={handleTrackSubmit} className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-300 ml-2 shrink-0" />
              <input
                type="text"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                placeholder="Track App ID (e.g. MV-2026-0941)"
                className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm px-2 py-1.5 outline-none font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow"
              >
                Track
              </button>
            </form>

            {/* Authenticate Certificate */}
            <form onSubmit={handleCertSubmit} className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-300 ml-2 shrink-0" />
              <input
                type="text"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                placeholder="Verify Cert # (e.g. CERT-LM-2026-004812)"
                className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm px-2 py-1.5 outline-none font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow"
              >
                Verify
              </button>
            </form>
          </div>

          {/* Quick Role Portal Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            <Link
              to="/login?role=consumer"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-teal-900/40 transition-all flex items-center gap-2"
            >
              Applicant Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login?role=officer"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
            >
              Officer Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login?role=admin"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
            >
              State Admin Console <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Key National Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">4,812+</span>
              <span className="block text-xs text-slate-500 font-medium">Instruments Verified</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">99.4%</span>
              <span className="block text-xs text-slate-500 font-medium">Measurement Compliance</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">&lt; 48 Hrs</span>
              <span className="block text-xs text-slate-500 font-medium">Avg. Scrutiny Turnaround</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">100%</span>
              <span className="block text-xs text-slate-500 font-medium">QR Authentic Seals</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Statutory Verification Workflow Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block mb-1">
            End-to-End Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            The METRAVOX Verification Lifecycle
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            A transparent, audit-compliant process ensuring precision, fair trade, and consumer protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            {
              step: '01',
              title: 'Online Application',
              desc: 'Applicant submits instrument specs, invoice, model approval & pays statutory fee.',
              icon: FileText,
              color: 'text-sky-600 bg-sky-50'
            },
            {
              step: '02',
              title: 'Officer Scrutiny',
              desc: 'Inspector reviews specs. If discrepancies exist, returned for applicant correction.',
              icon: Search,
              color: 'text-indigo-600 bg-indigo-50'
            },
            {
              step: '03',
              title: 'Slot Scheduling',
              desc: 'Automated allocation of on-site inspection or standards laboratory testing slot.',
              icon: Clock,
              color: 'text-teal-600 bg-teal-50'
            },
            {
              step: '04',
              title: 'Standards Testing',
              desc: 'Physical tests against calibrated weights, MPE error calculations & tamper sealing.',
              icon: Scale,
              color: 'text-amber-600 bg-amber-50'
            },
            {
              step: '05',
              title: 'Digital Certificate',
              desc: 'Instant generation of Form V Certificate with cryptographic security hash & QR code.',
              icon: Award,
              color: 'text-emerald-600 bg-emerald-50'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-teal-300 transition-all">
                <span className="text-3xl font-extrabold text-slate-200 font-mono block mb-2 group-hover:text-teal-200 transition-colors">
                  {item.step}
                </span>
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Role Overview Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Tailored Portals for Every Stakeholder
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Access dedicated tools designed specifically for your role in the metrological ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trader / Applicant */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Consumer / Trader Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Submit initial and renewal applications, upload test certificates, track application progress on a visual timeline, and download tamper-proof digital certificates.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>30 / 15 / 7-Day Expiry Alert System</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Resubmit returned applications directly</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Instant QR Verification share</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors text-center block"
            >
              Sign In to Applicant Portal →
            </Link>
          </div>

          {/* Legal Metrology Officer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-4">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Legal Metrology Officer</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Review submitted dossiers, inspect technical parameters, schedule field or laboratory inspections, record tolerance readings, and stamp verified instruments.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Return applications for correction with remarks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Schedule inspections with calendar slots</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>MPE tolerance test recording & digital seal</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold transition-colors text-center block"
            >
              Officer Enclave Sign In →
            </Link>
          </div>

          {/* Administrator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">State System Administrator</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Statewide analytics, compliance oversight, officer workload management, fee collection tracking, and centralized verification audit logs.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Comprehensive Recharts Visualizations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Statewide Certificate & Sealing Registry</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Jurisdiction and fee rule management</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold transition-colors text-center block"
            >
              State Administrator Sign In →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Statutory Advisory Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-widest">
              Statutory Compliance Reminder
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif">
              Mandatory Periodic Verification of Weights & Measures
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Under Section 24 of the Legal Metrology Act, 2009, no person shall use, or have in his possession for use, any weight or measure in any transaction or for protection, unless it has been verified and stamped by the Legal Metrology Officer.
            </p>
          </div>
          <Link
            to="/applications/new"
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all shrink-0 flex items-center gap-2"
          >
            Apply for Verification Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
