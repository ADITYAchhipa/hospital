'use client';

import React, { useState } from 'react';
import {
  Search,
  IdCard,
  AlertCircle,
  ArrowRight,
  Sparkles,
  X,
  ShieldAlert,
} from 'lucide-react';
import { fetchPatientById } from '@/lib/api';

export function SwasthyaIdSearchCard({
  title = 'Enter Swasthya ID',
  subtitle = "Please enter the patient's 6-digit Swasthya ID to retrieve their medical record.",
  actionType = 'prescription', // 'prescription' | 'report'
  onPatientSelected,
}) {
  const [swasthyaIdInput, setSwasthyaIdInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (overrideId) => {
    const rawId = (overrideId || swasthyaIdInput).trim();
    if (!rawId) {
      setErrorMessage('Please enter a valid Swasthya ID (e.g. x7k9m2)');
      return;
    }

    setIsSearching(true);
    setErrorMessage('');

    try {
      const cleanId = rawId.replace(/^#/, '').toLowerCase();
      const res = await fetchPatientById(cleanId);
      if (res.success && (res.patient || res.citizen)) {
        const found = res.patient || res.citizen;
        onPatientSelected(found);
      } else {
        setErrorMessage(
          res.message || `Patient profile "${rawId}" not found. Please verify the Swasthya ID.`
        );
      }
    } catch (err) {
      console.error('Search error:', err);
      setErrorMessage('Unable to connect to server. Please check connection and retry.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-200/50 relative overflow-hidden transition-all">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0f766e] via-[#0d9488] to-[#16a34a]"></div>

        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto shadow-inner">
            <IdCard className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="mt-8 space-y-4"
        >
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Patient Swasthya ID
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                autoFocus
                placeholder="e.g. x7k9m2"
                value={swasthyaIdInput}
                onChange={(e) => {
                  setSwasthyaIdInput(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 placeholder-slate-400 font-mono text-base sm:text-lg font-bold tracking-wider pl-12 pr-10 py-3.5 rounded-2xl focus:outline-none transition shadow-inner"
              />
              {swasthyaIdInput && (
                <button
                  type="button"
                  onClick={() => setSwasthyaIdInput('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Mock User Selector */}
          <div className="pt-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Quick Demo Patient</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSwasthyaIdInput('x7k9m2');
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-200/80 text-left flex items-center justify-between group transition-all duration-200 shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0f766e] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                  R
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-[#0f766e] transition-colors">
                    Ramesh Chandra
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Swasthya ID: <span className="font-bold text-teal-700">#x7k9m2</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#0f766e] bg-white px-2.5 py-1 rounded-xl border border-teal-200 shadow-xs group-hover:bg-[#0f766e] group-hover:text-white transition-all">
                Fill ID
              </span>
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Retrieve Button */}
          <button
            type="submit"
            disabled={isSearching || !swasthyaIdInput.trim()}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-[#0f766e] via-[#0d9488] to-[#0f766e] hover:opacity-95 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Retrieving Record...</span>
              </>
            ) : (
              <>
                <span>Retrieve Patient</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
