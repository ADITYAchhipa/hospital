'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FilePlus,
  FileText,
  Droplets,
  CreditCard,
  Hospital as HospitalIcon,
  Activity,
  Radio,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export function Sidebar() {
  const pathname = usePathname();
  const { hospital, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      label: 'Patient Directory',
      href: '/patients',
      icon: Users,
    },
    {
      label: 'Issue Prescription',
      href: '/prescriptions/new',
      icon: FilePlus,
    },
    {
      label: 'Upload Lab Report',
      href: '/reports/new',
      icon: FileText,
    },
    {
      label: 'Emergency Blood Net',
      href: '/blood-network',
      icon: Droplets,
      urgent: true,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block border-r border-blue-900/40 bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#115e59] text-white">
      <div className="sticky top-20 p-4 space-y-6">
        {/* Navigation list */}
        <div className="space-y-1.5">

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 group ${
                  isActive
                    ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                    : 'text-blue-100 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-sm"></div>
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-blue-205 text-blue-200 group-hover:text-white group-hover:bg-white/15'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium tracking-wide">{item.label}</span>
                </div>

                {item.urgent && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/25 text-rose-350 text-rose-350 text-rose-200 border border-rose-550 border-rose-500/40">
                    SOS
                  </span>
                )}

                {item.highlight && !item.urgent && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Hospital Facility Status Telemetry Widget */}
        <div className="p-4 rounded-2xl bg-white/10 border border-white/20 space-y-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <HospitalIcon className="w-4 h-4 text-cyan-300" />
              <span className="text-xs font-bold uppercase tracking-wider font-display">Workstation Info</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-2 text-[11px] pt-1">
            <div className="flex justify-between items-center">
              <span className="text-blue-200">Facility ID:</span>
              <span className="font-mono text-cyan-200 font-bold px-1.5 py-0.5 rounded bg-white/10 border border-white/25">
                {hospital?.hospitalId || 'HOSP-001'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-blue-200">
                <span>ICU Bed Capacity:</span>
                <span className="text-white font-bold">{hospital?.bedCount || 400}+ Beds</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-1.5 rounded-full w-3/4"></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-blue-200 pt-1">
              <span>MongoDB Sync:</span>
              <span className="text-cyan-255 text-cyan-200 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                Live Cluster
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

