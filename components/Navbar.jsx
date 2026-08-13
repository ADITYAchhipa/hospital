'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  Activity,
  Building2,
  Search,
  LogOut,
  Droplets,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  Command,
} from 'lucide-react';

export function Navbar() {
  const { hospital, personnel, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/patients?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      {/* Top glowing gradient border line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Hospital Identity */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3.5 group">
              <div className="relative">
                <img
                  src="/logo.png?v=2"
                  alt="SwasthyaTap Logo"
                  className="w-11 h-11 rounded-xl object-contain bg-white border border-slate-100 shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-xl text-slate-800 tracking-tight">
                    Swasthya<span className="text-blue-600">Tap</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-widest uppercase bg-blue-50 text-blue-600 border border-blue-100/80 shadow-inner">
                    EMR 2.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[180px] sm:max-w-xs flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{hospital?.name || 'Hospital Workstation'}</span>
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Patient Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-12 lg:mx-16">
            <form onSubmit={handleSearch} className="w-full relative group">
              <input
                type="text"
                placeholder="Search patient by Name, Swasthya ID (e.g. x7k9m2) or Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 pl-10 pr-12 py-3 rounded-xl border border-slate-200 group-hover:border-blue-500/40 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all duration-300"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4 group-hover:text-blue-600 transition-colors" />
              <div className="absolute right-3 top-3 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            </form>
          </div>

          {/* Action Icons & User Profile */}
          <div className="flex items-center gap-5">
            {/* Quick Emergency Broadcast Badge */}
            <Link
              href="/blood-network"
              className="relative p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-all duration-300 group shadow-sm"
              title="Emergency Blood Dispatch Network"
            >
              <Droplets className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>

            {/* Doctor & Personnel Identity Badge */}
            <div className="flex items-center gap-4 pl-5 border-l border-slate-200">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-base shadow-sm">
                {personnel?.name ? personnel.name.charAt(0) : 'D'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    {personnel?.name || 'Dr. Duty Officer'}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {personnel?.designation || hospital?.hospitalId || 'Authorized Physician'}
                </p>
              </div>

              <button
                onClick={logout}
                className="p-3 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-200"
                title="Log out from Workstation"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

