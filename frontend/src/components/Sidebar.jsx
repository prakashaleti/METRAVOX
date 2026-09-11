import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus2, 
  Files, 
  SearchCheck, 
  Award, 
  History, 
  Bell, 
  User, 
  Settings, 
  Calendar, 
  CheckCircle2, 
  Users, 
  BarChart3, 
  ShieldAlert,
  ClipboardList,
  Scale
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function Sidebar({ isOpen, onClose }) {
  const { currentRole, user } = useAuth();
  const { certificateExpirySummary, applications = [], certificates = [] } = useApp();

  const scopedApps = React.useMemo(() => {
    if (currentRole === ROLES.CONSUMER) {
      if (!user) return [];
      const userClean = (user.email || '').trim().toLowerCase();
      const userNameClean = (user.name || '').trim().toLowerCase();
      const userIdClean = user.id ? String(user.id) : null;

      return applications.filter((a) => {
        const emailMatch = userClean && a.applicantEmail && a.applicantEmail.trim().toLowerCase() === userClean;
        const nameMatch = userNameClean && a.applicantName && a.applicantName.trim().toLowerCase() === userNameClean;
        const uidMatch = userIdClean && a.applicantUid && String(a.applicantUid) === userIdClean;
        return emailMatch || nameMatch || uidMatch;
      });
    }
    return applications;
  }, [applications, currentRole, user]);

  const activeAlertCount = React.useMemo(() => {
    if (currentRole === ROLES.CONSUMER) {
      if (!user) return 0;
      const userClean = (user.email || '').trim().toLowerCase();
      const userNameClean = (user.name || '').trim().toLowerCase();
      const userIdClean = user.id ? String(user.id) : null;

      const userCerts = (certificates || []).filter((c) => {
        const emailMatch = userClean && c.applicantEmail && c.applicantEmail.trim().toLowerCase() === userClean;
        const nameMatch = userNameClean && c.applicantName && c.applicantName.trim().toLowerCase() === userNameClean;
        const uidMatch = userIdClean && c.applicantUid && String(c.applicantUid) === userIdClean;
        return emailMatch || nameMatch || uidMatch;
      });

      return userCerts.filter(c => {
        const remaining = (new Date(c.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        return remaining <= 30;
      }).length;
    }
    return certificateExpirySummary.totalActionRequired;
  }, [certificates, currentRole, user, certificateExpirySummary]);

  const pendingReviewCount = applications.filter(a => a.status === 'Application Submitted' || a.status === 'Under Review').length;
  const returnedCount = scopedApps.filter(a => a.status === 'Returned for Correction').length;
  const scheduledCount = applications.filter(a => a.status === 'Verification Scheduled').length;
  const alertCount = activeAlertCount;

  const consumerLinks = [
    { to: '/consumer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/applications/new', label: 'New Application', icon: FilePlus2, highlight: true },
    { to: '/applications', label: 'My Applications', icon: Files, badge: returnedCount > 0 ? `${returnedCount} Need Action` : null, badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300' },
    { to: '/track', label: 'Track Application', icon: SearchCheck },
    { to: '/certificates', label: 'My Certificates', icon: Award },
    { to: '/notifications', label: 'Expiry Alerts', icon: ShieldAlert, badge: alertCount > 0 ? alertCount : null, badgeColor: 'bg-rose-100 text-rose-800' },
    { to: '/history', label: 'Verification History', icon: History },
    { to: '/profile', label: 'Business Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const officerLinks = [
    { to: '/officer/dashboard', label: 'Officer Dashboard', icon: LayoutDashboard },
    { to: '/applications', label: 'Scrutiny Queue', icon: ClipboardList, badge: pendingReviewCount > 0 ? pendingReviewCount : null, badgeColor: 'bg-indigo-100 text-indigo-800' },
    { to: '/applications?filter=scheduled', label: 'Scheduled Field Tests', icon: Calendar, badge: scheduledCount > 0 ? scheduledCount : null, badgeColor: 'bg-teal-100 text-teal-800' },
    { to: '/certificates', label: 'Issued Certificates', icon: Award },
    { to: '/history', label: 'Central Verification Log', icon: History },
    { to: '/track', label: 'Track Application ID', icon: SearchCheck },
    { to: '/profile', label: 'Officer Credentials', icon: User },
    { to: '/settings', label: 'Jurisdiction & Office', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/applications', label: 'All Applications', icon: Files },
    { to: '/certificates', label: 'Certificate Registry', icon: Award },
    { to: '/history', label: 'Audit Trail & History', icon: History },
    { to: '/track', label: 'Application Lookup', icon: SearchCheck },
    { to: '/notifications', label: 'System Alerts & Logs', icon: Bell },
    { to: '/settings', label: 'System Configuration', icon: Settings },
  ];

  const links = currentRole === ROLES.OFFICER 
    ? officerLinks 
    : currentRole === ROLES.ADMIN 
    ? adminLinks 
    : consumerLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed lg:sticky top-16 sm:top-20 inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } no-print`}>
        
        {/* Role Identity Tag */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${
              currentRole === ROLES.CONSUMER ? 'bg-teal-600' : currentRole === ROLES.OFFICER ? 'bg-indigo-600' : 'bg-purple-600'
            }`} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {currentRole === ROLES.CONSUMER ? 'Applicant Portal' : currentRole === ROLES.OFFICER ? 'Officer Enclave' : 'Administrator Console'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
          <p className="text-[10px] text-slate-500 truncate">{user.organization}</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                end={link.to === '/applications'}
                className={({ isActive }) => `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm font-bold'
                    : link.highlight
                    ? 'bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{link.label}</span>
                </div>
                {link.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${link.badgeColor || 'bg-teal-100 text-teal-800'}`}>
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Regulatory Stamp Box */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3">
            <div className="flex items-center gap-1.5 text-teal-950 font-bold text-[11px] mb-1">
              <Scale className="w-3.5 h-3.5 text-teal-700" />
              <span>Legal Metrology Division</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-tight">
              Statutory verification compliant with Rule 14, 15 & 16 of Legal Metrology (General) Rules, 2011.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
