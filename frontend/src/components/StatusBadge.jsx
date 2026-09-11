import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Search, 
  FileCheck2, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  switch (status) {
    case 'Application Submitted':
      return (
        <span className={`inline-flex items-center rounded-full bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses[size]}`}>
          <Clock className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          Submitted
        </span>
      );

    case 'Under Review':
      return (
        <span className={`inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses[size]}`}>
          <Search className="w-3.5 h-3.5 text-indigo-600" />
          Under Review
        </span>
      );

    case 'Returned for Correction':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses[size]}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
          Returned for Correction
        </span>
      );

    case 'Verification Scheduled':
      return (
        <span className={`inline-flex items-center rounded-full bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses[size]}`}>
          <Calendar className="w-3.5 h-3.5 text-teal-600" />
          Verification Scheduled
        </span>
      );

    case 'Inspection in Progress':
      return (
        <span className={`inline-flex items-center rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses[size]}`}>
          <Clock className="w-3.5 h-3.5 text-purple-600 animate-spin" />
          Inspection Active
        </span>
      );

    case 'Approved':
    case 'Certificate Generated':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 ${sizeClasses[size]}`}>
          <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
          {status === 'Certificate Generated' ? 'Certificate Issued' : 'Approved'}
        </span>
      );

    case 'Rejected':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses[size]}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}>
          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          {status || 'Unknown'}
        </span>
      );
  }
}
