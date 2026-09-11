import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  ExternalLink,
  ShieldAlert,
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getRemainingDays } from '../services/storage';

export default function NotificationsPage() {
  const { certificateExpirySummary, applications } = useApp();
  const [activeTab, setActiveTab] = useState('all');

  const { urgent, warning, reminder, expired } = certificateExpirySummary;

  // Build notifications feed
  const expiryNotifications = [
    ...expired.map(c => ({
      id: `exp-${c.certificateNumber}`,
      type: 'expired',
      severity: 'Critical / Expired',
      title: `Certificate ${c.certificateNumber} Expired`,
      message: `Verification validity for ${c.instrumentType} (${c.manufacturer} ${c.modelNumber}, Serial: ${c.serialNumber}) expired ${Math.abs(getRemainingDays(c.expiryDate))} days ago. Re-verification application must be filed immediately.`,
      date: c.expiryDate,
      days: getRemainingDays(c.expiryDate),
      link: `/certificates/${c.certificateNumber}`,
      actionText: 'Apply Re-verification',
      actionLink: '/applications/new',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      icon: ShieldAlert,
      iconBg: 'bg-red-600 text-white'
    })),
    ...urgent.map(c => ({
      id: `urg-${c.certificateNumber}`,
      type: 'urgent',
      severity: 'Urgent (7 Days)',
      title: `Urgent: Verification Expiring in ${getRemainingDays(c.expiryDate)} Days`,
      message: `Statutory certificate ${c.certificateNumber} for ${c.instrumentType} expires on ${c.expiryDate}. Schedule an inspection slot immediately to avoid penalties.`,
      date: c.expiryDate,
      days: getRemainingDays(c.expiryDate),
      link: `/certificates/${c.certificateNumber}`,
      actionText: 'Renew Now',
      actionLink: '/applications/new',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: AlertCircle,
      iconBg: 'bg-rose-600 text-white'
    })),
    ...warning.map(c => ({
      id: `warn-${c.certificateNumber}`,
      type: 'warning',
      severity: 'Warning (15 Days)',
      title: `Renewal Advisory: Expiring in ${getRemainingDays(c.expiryDate)} Days`,
      message: `Certificate ${c.certificateNumber} for ${c.instrumentType} validity expires on ${c.expiryDate}. Trader is advised to prepare for periodic re-verification.`,
      date: c.expiryDate,
      days: getRemainingDays(c.expiryDate),
      link: `/certificates/${c.certificateNumber}`,
      actionText: 'Initiate Renewal',
      actionLink: '/applications/new',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: AlertTriangle,
      iconBg: 'bg-amber-500 text-white'
    })),
    ...reminder.map(c => ({
      id: `rem-${c.certificateNumber}`,
      type: 'reminder',
      severity: 'Reminder (30 Days)',
      title: `30-Day Reminder: Verification Expiring Soon`,
      message: `Instrument ${c.instrumentType} (${c.serialNumber}) validity will expire on ${c.expiryDate} (${getRemainingDays(c.expiryDate)} days left).`,
      date: c.expiryDate,
      days: getRemainingDays(c.expiryDate),
      link: `/certificates/${c.certificateNumber}`,
      actionText: 'View Certificate',
      actionLink: `/certificates/${c.certificateNumber}`,
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Clock,
      iconBg: 'bg-blue-600 text-white'
    }))
  ];

  // Also include status-change notifications from applications
  const returnedApps = applications.filter(a => a.status === 'Returned for Correction').map(a => ({
    id: `ret-${a.id}`,
    type: 'returned',
    severity: 'Correction Request',
    title: `Application ${a.id} Returned for Correction`,
    message: `Officer remark: "${a.returnReason?.slice(0, 140)}...". Please resubmit corrected documents.`,
    date: a.returnedAt || a.submittedAt,
    days: 0,
    link: `/applications/${a.id}`,
    actionText: 'Resubmit Application',
    actionLink: `/applications/${a.id}`,
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: AlertTriangle,
    iconBg: 'bg-amber-600 text-white'
  }));

  const allFeed = [...expiryNotifications, ...returnedApps];

  const filteredFeed = allFeed.filter((item) => {
    if (activeTab === 'urgent') return item.type === 'urgent' || item.type === 'expired';
    if (activeTab === 'warning') return item.type === 'warning';
    if (activeTab === 'reminder') return item.type === 'reminder';
    if (activeTab === 'returned') return item.type === 'returned';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold text-teal-700 tracking-wider block">
            Statutory Alert Center
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            Certificate Expiry & Activity Notifications
          </h1>
          <p className="text-xs text-slate-500">
            Automated alerts at 30 days, 15 days, 7 days before expiry, and expired notifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {allFeed.length} Actionable Notices
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
        {[
          { id: 'all', label: `All Alerts (${allFeed.length})` },
          { id: 'urgent', label: `Critical & Expired (${urgent.length + expired.length})` },
          { id: 'warning', label: `15-Day Warnings (${warning.length})` },
          { id: 'reminder', label: `30-Day Reminders (${reminder.length})` },
          { id: 'returned', label: `Returned Applications (${returnedApps.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-teal-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filteredFeed.length > 0 ? (
          filteredFeed.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${item.badgeClass}`}>
                        {item.severity}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Date: {item.date}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5 max-w-2xl">
                      {item.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    to={item.link}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    to={item.actionLink}
                    className="px-3.5 py-1.5 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1"
                  >
                    {item.actionText}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Pending Alerts</h3>
            <p className="text-xs text-slate-500">
              No notifications matching the selected filter category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
