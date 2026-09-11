import React from 'react';
import { Scale, ShieldCheck, Phone, Mail, ExternalLink, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 no-print mt-auto">
      {/* Upper Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-base tracking-wide">METRAVOX</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              National Online Verification, Inspection, and Digital Certification Platform for Weighing and Measuring Instruments.
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Ministry of Consumer Affairs, Food & Public Distribution, Govt. of India.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Statutory Services
            </h5>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#/applications/new" className="hover:text-teal-400 transition-colors">Initial Verification Application</a></li>
              <li><a href="#/applications/new" className="hover:text-teal-400 transition-colors">Periodic Re-verification Renewal</a></li>
              <li><a href="#/track" className="hover:text-teal-400 transition-colors">Application Timeline Tracking</a></li>
              <li><a href="#/certificates" className="hover:text-teal-400 transition-colors">Digital Certificate Verification</a></li>
              <li><a href="#/history" className="hover:text-teal-400 transition-colors">National Instrument History</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Regulatory Standards
            </h5>
            <ul className="space-y-2 text-[11px]">
              <li className="hover:text-teal-400 transition-colors cursor-pointer">Legal Metrology Act, 2009 (No. 1 of 2010)</li>
              <li className="hover:text-teal-400 transition-colors cursor-pointer">Legal Metrology (General) Rules, 2011</li>
              <li className="hover:text-teal-400 transition-colors cursor-pointer">Model Approval Regulations (Section 22)</li>
              <li className="hover:text-teal-400 transition-colors cursor-pointer">OIML R-76 Non-Automatic Weighing Instruments</li>
              <li className="hover:text-teal-400 transition-colors cursor-pointer">Verification Fee Structure (Schedule XII)</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Helpline & Support
            </h5>
            <div className="space-y-2.5 text-[11px]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Toll-Free National Helpline: <strong>1800-11-4000</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>support-metravox@gov.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Working Hours: Mon – Fri 09:30 AM – 06:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <div className="border-t border-slate-800 py-4 px-4 sm:px-8 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <p>© 2026 METRAVOX. Designed under the Ministry of Consumer Affairs, Food & Public Distribution.</p>
        <div className="flex items-center gap-4 text-[10px]">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Hyperlinking Policy</span>
          <span>Security Audit Certified</span>
        </div>
      </div>
    </footer>
  );
}
