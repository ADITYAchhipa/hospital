'use client';

import React from 'react';

export function LoadingCard() {
  return (
    <div className="glass-card p-6 rounded-2xl animate-pulse space-y-4 border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-slate-200 rounded-lg"></div>
        <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
      </div>
      <div className="h-4 w-48 bg-slate-200/80 rounded"></div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full bg-slate-200/60 rounded"></div>
        <div className="h-3 w-3/4 bg-slate-200/60 rounded"></div>
      </div>
      <div className="flex gap-2 pt-4 border-t border-slate-200">
        <div className="h-8 w-20 bg-slate-200 rounded-lg"></div>
        <div className="h-8 w-20 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export function LoadingTableRows({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-200/60">
          <td className="p-4">
            <div className="h-4 w-28 bg-slate-200 rounded"></div>
          </td>
          <td className="p-4">
            <div className="h-4 w-36 bg-slate-200 rounded"></div>
          </td>
          <td className="p-4">
            <div className="h-4 w-12 bg-slate-200 rounded-full"></div>
          </td>
          <td className="p-4">
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
          </td>
          <td className="p-4">
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
          </td>
          <td className="p-4 text-right">
            <div className="h-8 w-24 bg-slate-200 rounded-lg ml-auto"></div>
          </td>
        </tr>
      ))}
    </>
  );
}
