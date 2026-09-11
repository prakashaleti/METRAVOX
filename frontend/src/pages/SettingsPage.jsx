import React, { useState } from 'react';
import { Settings, Bell, Shield, Database, RotateCcw, Check, Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { resetDemo, addToast } = useApp();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [reminder30Days, setReminder30Days] = useState(true);
  const [reminder15Days, setReminder15Days] = useState(true);
  const [reminder7Days, setReminder7Days] = useState(true);

  const handleSave = () => {
    addToast('Preferences saved successfully.', 'success', 'Settings Updated');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <span className="text-[11px] uppercase font-bold text-teal-700 tracking-wider block">
          Configuration Console
        </span>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
          Portal & Notification Settings
        </h1>
        <p className="text-xs text-slate-500">
          Manage alert frequencies, certificate expiry thresholds, and system preferences
        </p>
      </div>

      {/* Expiry Alerts Settings */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="w-5 h-5 text-teal-700" />
          <h3 className="font-bold text-base text-slate-900 font-serif">
            Certificate Expiry Alert Engine Rules
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
            <div>
              <strong className="text-slate-900 block font-bold">30-Day Periodic Verification Window Notification</strong>
              <span className="text-slate-500">Sends reminder notification 30 days prior to certificate expiry</span>
            </div>
            <input
              type="checkbox"
              checked={reminder30Days}
              onChange={(e) => setReminder30Days(e.target.checked)}
              className="w-4 h-4 text-teal-700 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
            <div>
              <strong className="text-slate-900 block font-bold">15-Day Renewal Warning Advisory</strong>
              <span className="text-slate-500">Highlights warning level alert and prompts booking inspection slot</span>
            </div>
            <input
              type="checkbox"
              checked={reminder15Days}
              onChange={(e) => setReminder15Days(e.target.checked)}
              className="w-4 h-4 text-teal-700 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
            <div>
              <strong className="text-slate-900 block font-bold">7-Day Critical Urgency Notice</strong>
              <span className="text-slate-500">High-priority visual banner to prevent commercial stoppage penalties</span>
            </div>
            <input
              type="checkbox"
              checked={reminder7Days}
              onChange={(e) => setReminder7Days(e.target.checked)}
              className="w-4 h-4 text-teal-700 rounded"
            />
          </label>
        </div>

        {/* Channel Preferences */}
        <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Delivery Channels
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded text-teal-700"
              />
              <span className="font-semibold text-slate-800">Email Alerts & Formal Notices</span>
            </label>
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded text-teal-700"
              />
              <span className="font-semibold text-slate-800">National SMS Gateway Updates</span>
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>

      {/* Prototype Reset Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-5 h-5 text-slate-700" />
          <h3 className="font-bold text-base text-slate-900 font-serif">
            Evaluation & Demonstration Controls
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Restore the initial mock applications and certificates dataset. This resets any newly submitted applications, returns, schedules, and approvals back to the initial reference state.
        </p>
        <button
          onClick={resetDemo}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All Prototype Data to Default
        </button>
      </div>
    </div>
  );
}
