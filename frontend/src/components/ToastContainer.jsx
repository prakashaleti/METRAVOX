import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((toast) => {
        let bgClass = 'bg-slate-900 text-white border-slate-700';
        let Icon = Info;

        if (toast.type === 'success') {
          bgClass = 'bg-emerald-900 text-emerald-100 border-emerald-700';
          Icon = CheckCircle2;
        } else if (toast.type === 'warning') {
          bgClass = 'bg-amber-900 text-amber-100 border-amber-700';
          Icon = AlertTriangle;
        } else if (toast.type === 'error') {
          bgClass = 'bg-rose-900 text-rose-100 border-rose-700';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-200 ${bgClass}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              {toast.title && <h5 className="text-xs font-bold text-white mb-0.5">{toast.title}</h5>}
              <p className="text-xs leading-relaxed opacity-95">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
