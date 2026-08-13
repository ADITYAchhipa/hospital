'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

let toastTimeout;

export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white shadow-emerald-500/10',
    error: 'border-rose-200 bg-white shadow-rose-500/10',
    info: 'border-blue-200 bg-white shadow-blue-500/10',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${borders[type] || borders.info}`}
      >
        {icons[type]}
        <p className="text-sm font-medium text-slate-800">{message}</p>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
