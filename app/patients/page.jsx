'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Sidebar } from '@/components/Sidebar';
import { PatientCard } from '@/components/PatientCard';
import { LoadingCard, LoadingTableRows } from '@/components/LoadingSkeleton';
import { Toast } from '@/components/Toast';
import { BloodBadge, StatusBadge } from '@/components/Badge';
import { fetchPatients, createPatient } from '@/lib/api';
import {
  Users,
  Search,
  PlusCircle,
  Filter,
  Grid,
  List,
  ChevronRight,
  FilePlus,
  FileText,
  UserPlus,
  X,
  Phone,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

function PatientsDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { isAuthenticated, isLoading: authLoading, hospital } = useAuth();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [hasConditionsOnly, setHasConditionsOnly] = useState(false);
  const [donorsOnly, setDonorsOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isLoading, setIsLoading] = useState(true);

  // New Patient Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    fullName: '',
    phoneNumber: '',
    bloodGroup: 'B+',
    age: '',
    allergies: 'None',
    chronicConditions: 'None',
    medications: 'None',
    isDnr: false,
    isBloodDonor: true,
  });

  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPatients();
    }
  }, [isAuthenticated, selectedBloodGroup, hasConditionsOnly, donorsOnly]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPatients({
        q: searchQuery,
        bloodGroup: selectedBloodGroup,
        hasConditions: hasConditionsOnly ? 'true' : undefined,
        isDonor: donorsOnly ? 'true' : undefined,
        limit: 100,
        hospitalName: hospital?.name,
      });

      if (data.success) {
        setPatients(data.patients);
      }
    } catch (e) {
      console.error('Error loading patients:', e);
      setToast({ message: 'Failed to query patient database', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPatients();
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!newPatientForm.fullName.trim()) {
      setToast({ message: 'Patient full name is required', type: 'error' });
      return;
    }

    try {
      const res = await createPatient(newPatientForm);
      if (res.success) {
        setToast({ message: `Patient registered! Swasthya ID: #${res.patient.profileId}`, type: 'success' });
        setIsModalOpen(false);
        setNewPatientForm({
          fullName: '',
          phoneNumber: '',
          bloodGroup: 'B+',
          age: '',
          allergies: 'None',
          chronicConditions: 'None',
          medications: 'None',
          isDnr: false,
          isBloodDonor: true,
        });
        loadPatients();
      } else {
        setToast({ message: res.message || 'Failed to register patient', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Network error registering patient', type: 'error' });
    }
  };

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (authLoading || !isAuthenticated) return null;

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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        {/* Header Title & Register Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-605 text-blue-600 border border-blue-100">
                EMR Registry
              </span>
              <span className="text-xs text-slate-500">Total: {patients.length} records</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
              Patient Directory & Health Records
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Patient</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-205 border-slate-200 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by Patient Name, Swasthya ID (e.g. x7k9m2), Phone Number, or Allergy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input px-4 py-3 pl-10 rounded-xl text-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs border border-blue-500 transition shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Filter Chips & View Mode Switch */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2 border-t border-slate-200">
            {/* Blood Groups */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Blood:
              </span>
              {bloodGroups.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedBloodGroup(bg)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedBloodGroup === bg
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-550 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            {/* Quick condition toggles & View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHasConditionsOnly(!hasConditionsOnly)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                  hasConditionsOnly
                    ? 'bg-amber-50 text-amber-705 text-amber-700 border-amber-200'
                    : 'bg-white text-slate-500 border-slate-200'
                }`}
              >
                Chronic Conditions
              </button>

              <button
                onClick={() => setDonorsOnly(!donorsOnly)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                  donorsOnly
                    ? 'bg-rose-50 text-rose-650 text-rose-600 border-rose-200'
                    : 'bg-white text-slate-500 border-slate-200'
                }`}
              >
                Blood Donors
              </button>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600 border border-blue-100/50' : 'text-slate-500'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-blue-50 text-blue-600 border border-blue-100/50' : 'text-slate-500'}`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Patients View */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        ) : patients.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl text-center space-y-4">
            <Users className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Patient Records Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No registered citizens in the shared MongoDB database match your search filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBloodGroup('All');
                setHasConditionsOnly(false);
                setDonorsOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-205 hover:bg-slate-200 text-xs font-semibold text-blue-650 text-blue-600 transition border border-slate-250/60"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {patients.map((patient) => (
              <PatientCard key={patient.profileId || patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Patient Profile</th>
                    <th className="p-4">Swasthya ID</th>
                    <th className="p-4">Blood Group</th>
                    <th className="p-4">Allergies & Alert</th>
                    <th className="p-4">Records</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {patients.map((patient) => (
                    <tr
                      key={patient.profileId || patient.id}
                      className="hover:bg-slate-50 transition group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600">
                            {patient.fullName ? patient.fullName.charAt(0) : 'P'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition">
                              {patient.fullName}
                            </span>
                            {patient.phoneNumber && (
                              <div className="text-[11px] text-slate-500">{patient.phoneNumber}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-blue-600">
                        #{patient.profileId || patient.id}
                      </td>
                      <td className="p-4">
                        <BloodBadge group={patient.bloodGroup} size="sm" />
                      </td>
                      <td className="p-4">
                        {patient.allergies && patient.allergies !== 'None' ? (
                          <span className="text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-150">
                            {patient.allergies}
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-550">
                        <span className="text-slate-800 font-semibold">{patient.prescriptions?.length || 0}</span> Rx •{' '}
                        <span className="text-slate-800 font-semibold">{patient.medicalReports?.length || 0}</span> Reports
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/patients/${patient.profileId || patient.id}`}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-605 text-blue-650 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition"
                          >
                            Open EMR
                          </Link>
                          <Link
                            href={`/prescriptions/new?patientId=${patient.profileId || patient.id}`}
                            className="p-1.5 rounded-lg bg-slate-50 text-blue-600 hover:bg-blue-50 border border-slate-200 transition"
                            title="Add Prescription"
                          >
                            <FilePlus className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/reports/new?patientId=${patient.profileId || patient.id}`}
                            className="p-1.5 rounded-lg bg-slate-50 text-emerald-600 hover:bg-emerald-50 border border-slate-200 transition"
                            title="Upload Report"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Register New Patient */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative text-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-905 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-800">Register New Patient</h3>
                  <p className="text-xs text-slate-500">Directly adds patient to universal SwasthyaTap database</p>
                </div>
              </div>

              <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={newPatientForm.fullName}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">Mobile Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. 9988776655"
                      value={newPatientForm.phoneNumber}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, phoneNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">Blood Group</label>
                    <select
                      value={newPatientForm.bloodGroup}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                        <option key={bg} value={bg} className="bg-white text-slate-800">
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 34"
                      value={newPatientForm.age}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">Drug / Food Allergies</label>
                    <input
                      type="text"
                      placeholder="e.g. Penicillin, Peanuts (or None)"
                      value={newPatientForm.allergies}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, allergies: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Chronic Conditions</label>
                  <input
                    type="text"
                    placeholder="e.g. Hypertension, Type-2 Diabetes (or None)"
                    value={newPatientForm.chronicConditions}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, chronicConditions: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPatientForm.isBloodDonor}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, isBloodDonor: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white border-slate-300"
                    />
                    <span>Opt-in as Emergency Blood Donor</span>
                  </label>

                  <label className="flex items-center gap-2 text-rose-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPatientForm.isDnr}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, isDnr: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-white border-slate-300"
                    />
                    <span>DNR Directive</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-705 text-slate-700 font-semibold border border-slate-250/80"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                  >
                    Save & Generate ID
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PatientsDirectoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PatientsDirectoryContent />
    </Suspense>
  );
}

