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
      </div>
    </aside>
  );
}

