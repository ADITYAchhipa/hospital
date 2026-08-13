'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Sidebar } from '@/components/Sidebar';
import { StatsGrid } from '@/components/StatsGrid';
import { Toast } from '@/components/Toast';
import {
  fetchDashboardStats,
} from '@/lib/api';
import {
  FileText,
  Droplets,
  Users,
  Activity,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { hospital, personnel, isAuthenticated, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const statsData = await fetchDashboardStats();
      if (statsData.success) setStats(statsData.stats);
    } catch (e) {
      console.error('Dashboard load error:', e);
      setToast({ message: 'Failed to synchronize with MongoDB cluster', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dynamic paths for EMR activity SVG chart based on backend data
  const timeline = stats?.timeline || [];
  const maxVal = Math.max(
    ...timeline.map((d) => Math.max(d.reports, d.prescriptions)),
    5
  );

  const reportsPoints = timeline.map((d, i) => {
    const x = 50 + i * 80;
    const y = 170 - (d.reports / maxVal) * 150;
    return { x, y };
  });

  const prescriptionsPoints = timeline.map((d, i) => {
    const x = 50 + i * 80;
    const y = 170 - (d.prescriptions / maxVal) * 150;
    return { x, y };
  });

  const reportsLinePath = reportsPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const reportsAreaPath = reportsPoints.length ? `${reportsLinePath} L ${reportsPoints[reportsPoints.length - 1].x},170 L ${reportsPoints[0].x},170 Z` : '';

  const prescriptionsLinePath = prescriptionsPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const prescriptionsAreaPath = prescriptionsPoints.length ? `${prescriptionsLinePath} L ${prescriptionsPoints[prescriptionsPoints.length - 1].x},170 L ${prescriptionsPoints[0].x},170 Z` : '';

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex">
      {/* Toast notifications */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Hospital Workstation Hero Banner (Matches outside blue gradient) */}
        <div className="bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#115e59] text-white rounded-3xl p-6 sm:p-8 border border-blue-500/20 relative overflow-hidden shadow-lg">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white border border-white/30 font-mono shadow-inner">
                  {hospital?.hospitalId || 'HOSP-001'}
                </span>
                <span className="text-xs text-blue-200 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {hospital?.city || 'Bangalore'} • {hospital?.specialties?.join(', ') || 'Multi-Speciality Workstation'}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
                {hospital?.name || 'Hospital Clinical Workstation'}
              </h1>

              <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-2">
                <span className="text-blue-200">Active Clinician:</span>
                <span className="text-white font-bold font-display px-2 py-0.5 rounded bg-blue-900/40 border border-white/25">
                  {personnel?.name || 'Dr. Duty Officer'}
                </span>
                <span className="text-blue-200 text-xs">({personnel?.designation || 'Attending Physician'})</span>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/reports/new"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-[#0f766e] font-bold text-xs shadow-md transition-all duration-200 active:scale-95"
              >
                <FileText className="w-4 h-4 stroke-[2.5]" />
                <span>Upload Medical Report</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Live Clinical Telemetry Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2 tracking-wide font-display">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Real-Time EMR Telemetry (Universal Shared Database)</span>
            </h2>
            <button
              onClick={loadDashboardData}
              className="text-xs font-semibold text-slate-650 hover:text-blue-605 hover:text-blue-600 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-500/30 transition-all duration-200 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync DB</span>
            </button>
          </div>
          <StatsGrid stats={stats} />
        </div>


        {/* Clinical Analytics & Charts Grid */}
        {isLoading || !stats ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3 lg:col-span-2">
              <div className="w-8 h-8 border-3 border-[#0f766e] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-500">Loading Clinical Analytics Engine...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Blood Group Inventory Distribution */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 font-display">
                    <Droplets className="w-4 h-4 text-rose-500" />
                    <span>Blood Inventory Distribution</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Active blood groups registered across community patients in SwasthyaTap
                  </p>
                </div>
                
                {/* Horizontal Bar Chart */}
                <div className="space-y-3">
                  {Object.entries(stats?.bloodGroupDistribution || {})
                    .filter(([group]) => group !== 'Unknown')
                    .map(([group, count]) => {
                      const totalCount = Object.values(stats?.bloodGroupDistribution || {})
                        .filter((_, idx) => Object.keys(stats?.bloodGroupDistribution || {})[idx] !== 'Unknown')
                        .reduce((a, b) => a + b, 0) || 1;
                      const percentage = Math.min(100, Math.round((count / totalCount) * 100));
                      return (
                        <div key={group} className="flex items-center gap-3 text-xs">
                          <div className="w-8 font-black text-slate-700 font-display text-right">{group}</div>
                          <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                            <div 
                              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-24 text-right font-bold text-slate-650 text-[11px]">
                            {count} {count === 1 ? 'Patient' : 'Patients'} ({percentage}%)
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Card 2: EMR & Activity Telemetry Area Chart */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 font-display">
                    <Activity className="w-4 h-4 text-[#0f766e]" />
                    <span>Monthly Clinical Document Uploads</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Comparative analysis of Medical Reports vs. Prescriptions issued
                  </p>
                </div>

                {/* SVG Area Chart */}
                <div className="relative">
                  <svg viewBox="0 0 500 200" className="w-full h-44 overflow-visible">
                    <defs>
                      <linearGradient id="reportsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="prescriptionsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Horizontal gridlines */}
                    <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="170" x2="480" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />

                    {/* Y Axis Labels */}
                    <text x="5" y="24" className="text-[9px] fill-slate-400 font-semibold">{maxVal}</text>
                    <text x="5" y="98" className="text-[9px] fill-slate-400 font-semibold">{Math.round(maxVal / 2)}</text>
                    <text x="5" y="174" className="text-[9px] fill-slate-400 font-semibold">0</text>

                    {/* SVG Area / Line Path for Medical Reports (Teal) */}
                    {reportsAreaPath && (
                      <path
                        d={reportsAreaPath}
                        fill="url(#reportsGrad)"
                      />
                    )}
                    {reportsLinePath && (
                      <path
                        d={reportsLinePath}
                        fill="none"
                        stroke="#0d9488"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    )}

                    {/* SVG Area / Line Path for Prescriptions (Blue) */}
                    {prescriptionsAreaPath && (
                      <path
                        d={prescriptionsAreaPath}
                        fill="url(#prescriptionsGrad)"
                      />
                    )}
                    {prescriptionsLinePath && (
                      <path
                        d={prescriptionsLinePath}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Data Points / Dots */}
                    {reportsPoints.map((p, idx) => (
                      <circle key={`rep-dot-${idx}`} cx={p.x} cy={p.y} r="3.5" fill="#0d9488" stroke="#fff" strokeWidth="1.5" />
                    ))}
                    {prescriptionsPoints.map((p, idx) => (
                      <circle key={`rx-dot-${idx}`} cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
                    ))}

                    {/* X Axis Labels */}
                    {timeline.map((t, idx) => (
                      <text key={`x-lbl-${idx}`} x={50 + idx * 80} y={190} className="text-[9px] fill-slate-500 font-bold font-display" textAnchor="middle">
                        {t.label}
                      </text>
                    ))}
                  </svg>
                  
                  {/* Legend overlay */}
                  <div className="flex justify-center gap-4 text-[10px] font-bold mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 rounded-sm bg-[#0d9488]"></span>
                      <span className="text-slate-650">Medical Reports ({stats?.totalReports || 0})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 rounded-sm bg-[#3b82f6]"></span>
                      <span className="text-slate-650">Prescriptions Issued ({stats?.totalPrescriptions || 0})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Circular Gauge Widgets Row */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 font-display">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Clinical Registry Demographics</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Proportionate distribution of community blood donors and legal healthcare directives
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {/* Gauge 1: Blood Donors */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                      <circle 
                        cx="40" cy="40" r="34" fill="transparent" stroke="#ef4444" strokeWidth="6" 
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={2 * Math.PI * 34 - (Math.min(100, Math.round((stats?.totalDonors / (stats?.totalPatients || 1)) * 100)) / 100) * (2 * Math.PI * 34)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-800 font-display">
                      {Math.min(100, Math.round((stats?.totalDonors / (stats?.totalPatients || 1)) * 100))}%
                    </div>
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 font-display block">Community Blood Donors</span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      {stats?.totalDonors} of {stats?.totalPatients} total patients active
                    </span>
                  </div>
                </div>

                {/* Gauge 2: DNR Flags */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                      <circle 
                        cx="40" cy="40" r="34" fill="transparent" stroke="#f59e0b" strokeWidth="6" 
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={2 * Math.PI * 34 - (Math.min(100, Math.round((stats?.totalDnr / (stats?.totalPatients || 1)) * 100)) / 100) * (2 * Math.PI * 34)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-800 font-display">
                      {Math.min(100, Math.round((stats?.totalDnr / (stats?.totalPatients || 1)) * 100))}%
                    </div>
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 font-display block">DNR Directives</span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      {stats?.totalDnr} patients with active DNR filings
                    </span>
                  </div>
                </div>

                {/* Gauge 3: Electronic Records Coverage */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                      <circle 
                        cx="40" cy="40" r="34" fill="transparent" stroke="#10b981" strokeWidth="6" 
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={2 * Math.PI * 34 - (0.85 * (2 * Math.PI * 34))}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-800 font-display">
                      85%
                    </div>
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 font-display block">Average Completeness</span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      Average fields filled per EMR card
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
