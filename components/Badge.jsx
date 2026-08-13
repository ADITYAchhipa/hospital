'use client';

import React from 'react';

export function BloodBadge({ group, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-bold',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200 ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
      {group || 'Unknown'}
    </span>
  );
}

export function StatusBadge({ status, type = 'default' }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    verified: 'bg-teal-50 text-teal-600 border-teal-200',
    completed: 'bg-blue-50 text-blue-600 border-blue-200',
    critical: 'bg-rose-50 text-rose-600 border-rose-200',
    warning: 'bg-amber-50 text-amber-650 text-amber-600 border-amber-200',
    default: 'bg-slate-50 text-slate-650 text-slate-600 border-slate-200',
  };

  const key = String(status || '').toLowerCase();
  let styleKey = 'default';

  if (key.includes('active') || key.includes('normal') || key.includes('open')) styleKey = 'active';
  else if (key.includes('verified') || key.includes('optimal')) styleKey = 'verified';
  else if (key.includes('completed') || key.includes('paid')) styleKey = 'completed';
  else if (key.includes('critical') || key.includes('abnormal') || key.includes('high')) styleKey = 'critical';
  else if (key.includes('pending') || key.includes('low')) styleKey = 'warning';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[styleKey]}`}
    >
      {status}
    </span>
  );
}
