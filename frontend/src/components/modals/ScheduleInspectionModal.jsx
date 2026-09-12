import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, X, Check } from 'lucide-react';

export default function ScheduleInspectionModal({ application, isOpen, onClose, onConfirm }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [slot, setSlot] = useState('10:30 AM - 12:30 PM');
  const [venue, setVenue] = useState(application?.inspectionVenue || 'Trader Premises (On-site)');
  const [officer, setOfficer] = useState('Ramesh varma (Senior Legal Metrology Officer)');
  const [instructions, setInstructions] = useState('Ensure instrument is placed on stable, vibration-free platform. Working standard test weights will be dispatched by mobile testing squad.');

  if (!isOpen || !application) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(application.id, {
      date,
      slot,
      venue,
      officer,
      instructions
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Schedule Verification / Inspection</h3>
              <p className="text-xs text-teal-100">Application: {application.id} • {application.instrumentType}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Inspection Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Time Slot <span className="text-rose-500">*</span>
              </label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
              >
                <option value="09:30 AM - 11:30 AM">Morning 09:30 AM - 11:30 AM</option>
                <option value="11:30 AM - 01:30 PM">Midday 11:30 AM - 01:30 PM</option>
                <option value="02:30 PM - 04:30 PM">Afternoon 02:30 PM - 04:30 PM</option>
                <option value="04:30 PM - 06:00 PM">Evening 04:30 PM - 06:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              Inspection Venue / Location
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Trader Warehouse, Bay 3 OR District Standards Laboratory"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-teal-600" />
              Deputed Legal Metrology Inspector
            </label>
            <select
              value={officer}
              onChange={(e) => setOfficer(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
            >
              <option value="Ramesh varma (Senior Legal Metrology Officer)">Ramesh varma (Senior Legal Metrology Officer)</option>
              <option value="Ramesh varma (Senior LMO)">Ramesh varma (Senior LMO)</option>
              <option value="Ramesh varma (Inspector Weights & Measures)">Ramesh varma (Inspector Weights & Measures)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Special Instructions to Applicant
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              Confirm Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
