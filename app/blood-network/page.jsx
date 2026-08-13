'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Sidebar } from '@/components/Sidebar';
import { Toast } from '@/components/Toast';
import { BloodBadge } from '@/components/Badge';
import { fetchPatients } from '@/lib/api';
import {
  Droplets,
  Users,
  Phone,
  MapPin,
  RefreshCw,
  Search,
  Navigation,
} from 'lucide-react';

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export default function BloodNetworkPage() {
  const router = useRouter();
  const { hospital, isAuthenticated, isLoading: authLoading } = useAuth();

  const [bloodDonors, setBloodDonors] = useState([]);
  const [selectedBg, setSelectedBg] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData(selectedBg);
    }
  }, [isAuthenticated, selectedBg]);

  const loadData = async (bg) => {
    setIsLoading(true);
    try {
      const params = { isDonor: 'true', limit: 100 };
      if (bg && bg !== 'All') {
        params.bloodGroup = bg;
      }
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      const donorsData = await fetchPatients(params);
      if (donorsData.success) {
        setBloodDonors(donorsData.patients || []);
      }
    } catch (e) {
      console.error('Error loading blood network:', e);
      setToast({ message: 'Failed to synchronize with MongoDB cluster', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(selectedBg);
  };

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (authLoading || !isAuthenticated) return null;

  // Hospital position coordinates
  const hospLat = hospital?.lat || 12.9636;
  const hospLng = hospital?.lng || 77.5843;

  // Proximity sorting using Haversine formula
  const sortedDonors = [...bloodDonors]
    .map((donor) => {
      const distance = calculateDistance(hospLat, hospLng, donor.homeLat, donor.homeLng);
      return { ...donor, distance };
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Banner (Teal Theme) */}
        <div className="bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#115e59] text-white rounded-3xl p-6 sm:p-8 border border-teal-500/20 relative overflow-hidden shadow-lg">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white border border-white/30 tracking-wide font-display">
                  Proximity Dispatch Engine
                </span>
                <span className="text-xs text-teal-200 font-medium">Real-Time Distance Calculation (Haversine Radar)</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
                Emergency Blood Donor Proximity Radar
              </h1>
              <p className="text-xs sm:text-sm text-teal-50 max-w-2xl leading-relaxed">
                Filter and locate active community blood donors registered in the SwasthyaTap database.
                Donors are automatically sorted based on the physical distance of their address to <span className="text-cyan-200 font-bold">{hospital?.name || 'this facility'}</span>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadData(selectedBg)}
                className="p-3 rounded-2xl bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all shadow-md active:scale-95"
                title="Refresh Proximity Radar"
              >
                <RefreshCw className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 font-display flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#0f766e]" />
              <span>Filter and Query Registered Donors</span>
            </h2>
            
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <input
                  type="text"
                  placeholder="Search donor by Name or Swasthya ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 rounded-2xl border border-slate-200 bg-slate-50 text-xs placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-[#0f766e] hover:bg-[#0d9488] text-white font-bold text-xs shadow-sm transition-all active:scale-95"
              >
                Search
              </button>
            </form>
          </div>

          {/* Blood Group Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 font-display">
              Select Group:
            </span>
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedBg(bg)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black font-mono transition-all duration-250 ${
                  selectedBg === bg
                    ? 'bg-[#0f766e] text-white shadow-sm scale-105'
                    : 'bg-slate-100 text-slate-650 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Donors Radar Results List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-base text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0f766e]" />
              <span>Proximity Search Results ({sortedDonors.length})</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Sorted by closest physical location
            </span>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-8 h-8 border-3 border-[#0f766e] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-500">Querying database coordinates...</p>
            </div>
          ) : sortedDonors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedDonors.map((donor) => (
                <div
                  key={donor.profileId}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:border-teal-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-black text-slate-800 text-sm font-display tracking-tight leading-tight">
                          {donor.fullName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: #{donor.profileId}
                        </span>
                      </div>
                      <BloodBadge group={donor.bloodGroup} size="sm" />
                    </div>

                    <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                      {/* Distance Badge */}
                      <div className="flex items-center gap-2 text-slate-650">
                        <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span className="font-bold text-slate-800 font-display">
                          {donor.distance !== null ? `${donor.distance.toFixed(2)} km` : 'N/A'}
                        </span>
                        <span className="text-slate-400 text-[10px]">(from workstation)</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${donor.phoneNumber}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0f766e] border border-teal-100 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-teal-600" />
                    <span>Call: {donor.phoneNumber || 'N/A'}</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Droplets className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-700 font-black font-display">No blood donors found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active donors matches the selected blood group "{selectedBg}" or search query.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
