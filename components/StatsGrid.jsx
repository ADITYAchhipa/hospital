'use client';

import React from 'react';
import {
  Users,
  FileCheck,
  Pill,
  Droplets,
  TrendingUp,
  Activity,
} from 'lucide-react';

export function StatsGrid({ stats }) {
  const items = [
    {
      title: 'Registered Patients',
      value: stats?.totalPatients ?? '--',
      subtitle: 'Universal EMR Database',
      trend: '+12% this week',
      icon: Users,
      color: 'blue',
      glow: 'shadow-sm',
      border: 'border-slate-200/80',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      progress: 'w-4/5 bg-gradient-to-r from-blue-500 to-cyan-500',
    },
    {
      title: 'Prescriptions Issued',
      value: stats?.totalPrescriptions ?? '--',
      subtitle: 'Active Digital Rx Records',
      trend: 'Synced with Mobile App',
      icon: Pill,
      color: 'indigo',
      glow: 'shadow-sm',
      border: 'border-slate-200/80',
      iconBg: 'bg-indigo-50 text-indigo-650 border-indigo-100',
      progress: 'w-3/5 bg-gradient-to-r from-indigo-500 to-blue-500',
    },
    {
      title: 'Lab & Diagnostics',
      value: stats?.totalReports ?? '--',
      subtitle: 'CBC, Lipid, Radiographs',
      trend: '100% Encrypted PDF',
      icon: FileCheck,
      color: 'emerald',
      glow: 'shadow-sm',
      border: 'border-slate-200/80',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      progress: 'w-5/6 bg-gradient-to-r from-emerald-500 to-teal-500',
    },
    {
      title: 'Emergency Donors',
      value: stats?.totalDonors ?? '--',
      subtitle: 'Broadcasting Ready SOS',
      trend: 'Live Proximity Match',
      icon: Droplets,
      color: 'rose',
      glow: 'shadow-sm',
      border: 'border-slate-200/80',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      progress: 'w-2/3 bg-gradient-to-r from-rose-500 to-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`glass-card p-6 rounded-3xl border ${item.border} transition-all duration-300 relative overflow-hidden group`}
          >
            {/* Background subtle glow spotlight */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-display">
                  {item.title}
                </p>
                <h3 className="text-3xl sm:text-4xl font-display font-black text-slate-800 mt-1.5 tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
                  {item.value}
                </h3>
              </div>

              <div className={`p-3 rounded-2xl border ${item.iconBg} shadow-inner`}>
                <Icon className="w-6 h-6 stroke-[2]" />
              </div>
            </div>

            {/* Sparkline progress bar */}
            <div className="mt-4 space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                <div className={`${item.progress} h-full rounded-full`}></div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {item.subtitle}
                </span>
                <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {item.trend}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

