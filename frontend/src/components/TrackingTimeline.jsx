import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  FileCheck2, 
  XCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck
} from 'lucide-react';

export default function TrackingTimeline({ timeline = [], currentStatus = '' }) {
  const STAGES_ORDER = [
    'Application Submitted',
    'Under Review',
    'Verification Scheduled',
    'Verification / Inspection',
    'Certificate Generated'
  ];

  const getStageIcon = (stageName, status) => {
    if (status === 'completed') {
      return <CheckCircle2 className="w-5 h-5 text-white" />;
    }
    if (stageName.includes('Returned')) {
      return <AlertTriangle className="w-5 h-5 text-white animate-pulse" />;
    }
    if (stageName.includes('Rejected')) {
      return <XCircle className="w-5 h-5 text-white" />;
    }
    if (status === 'current') {
      return <Clock className="w-5 h-5 text-white animate-spin" />;
    }
    return <Circle className="w-4 h-4 text-slate-400" />;
  };

  const getStageBg = (stageName, status) => {
    if (stageName.includes('Returned')) return 'bg-amber-500 border-amber-600 ring-4 ring-amber-100';
    if (stageName.includes('Rejected')) return 'bg-rose-500 border-rose-600 ring-4 ring-rose-100';
    if (status === 'completed') return 'bg-emerald-600 border-emerald-700 ring-4 ring-emerald-100';
    if (status === 'current') return 'bg-teal-600 border-teal-700 ring-4 ring-teal-100 animate-pulse';
    return 'bg-slate-200 border-slate-300';
  };

  return (
    <div className="relative py-4">
      {/* Workflow Progress Breadcrumb Pills */}
      <div className="hidden lg:grid grid-cols-5 gap-2 mb-8 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        {STAGES_ORDER.map((stage, idx) => {
          const isPassed = timeline.some((t) => t.stage === stage && t.status === 'completed');
          const isCurrent = currentStatus === stage || (stage === 'Certificate Generated' && currentStatus === 'Approved');
          const isReturned = currentStatus === 'Returned for Correction' && idx === 1;

          return (
            <div 
              key={stage}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-all ${
                isReturned
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                  : isPassed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                  : isCurrent
                  ? 'bg-teal-600 border-teal-700 text-white font-bold shadow-sm ring-2 ring-teal-200'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                isCurrent ? 'bg-white text-teal-700' : isPassed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {idx + 1}
              </div>
              <span className="truncate">{stage}</span>
            </div>
          );
        })}
      </div>

      {/* Vertical Detailed Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:inset-0 before:left-3 sm:before:left-4 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-teal-600 before:via-slate-300 before:to-slate-200">
        {timeline.map((item, index) => {
          const isCurrent = item.status === 'current';
          const isCompleted = item.status === 'completed';
          const isReturned = item.stage === 'Returned for Correction';
          const isRejected = item.stage === 'Rejected';

          return (
            <div key={index} className="relative group">
              {/* Dot / Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all ${getStageBg(
                  item.stage,
                  item.status
                )}`}
              >
                {getStageIcon(item.stage, item.status)}
              </div>

              {/* Content Card */}
              <div className={`p-4 sm:p-5 rounded-xl border transition-all ${
                isReturned
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950 shadow-sm'
                  : isRejected
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950 shadow-sm'
                  : isCurrent
                  ? 'bg-white border-teal-300 shadow-md ring-1 ring-teal-100'
                  : 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isReturned
                        ? 'bg-amber-200 text-amber-900'
                        : isRejected
                        ? 'bg-rose-200 text-rose-900'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCurrent
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.stage}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  {item.description}
                </p>

                {item.actor && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Processed by: <strong className="font-semibold text-slate-700">{item.actor}</strong></span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
