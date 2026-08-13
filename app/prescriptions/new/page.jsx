'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Sidebar } from '@/components/Sidebar';
import { Toast } from '@/components/Toast';
import { PatientDetailHeader } from '@/components/PatientDetailHeader';
import { SwasthyaIdSearchCard } from '@/components/SwasthyaIdSearchCard';
import { fetchPatientById, addPrescription } from '@/lib/api';
import {
  Plus,
  Trash2,
  Stethoscope,
  Pill,
  CheckCircle2,
  Sun,
  Sunset,
  Moon,
  ArrowLeft,
} from 'lucide-react';

function NewPrescriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId') || '';

  const { hospital, personnel, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Selected Patient State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  // Form Fields
  const [rxId, setRxId] = useState('RX-2026-891');
  const [doctorName, setDoctorName] = useState('');
  const [qualification, setQualification] = useState('MD (Cardiology), FACC');
  const [hospitalName, setHospitalName] = useState('Apollo Speciality Hospital');
  const [diagnosis, setDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [validUntil, setValidUntil] = useState('30 Days');

  const [medicines, setMedicines] = useState([
    {
      medicineName: '',
      dosage: '1 Tablet',
      frequency: 'Once Daily',
      duration: '7 Days',
      instructions: 'After Meal',
      morning: true,
      afternoon: false,
      night: false,
      beforeFood: false,
      afterFood: true,
      quantity: '7 Tablets',
      purpose: 'Treatment',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (personnel?.name) {
      setDoctorName(personnel.name);
      if (personnel.designation) {
        setQualification(personnel.designation);
      }
    } else {
      setDoctorName('Dr. Amit Shah');
    }
    if (hospital?.name) {
      setHospitalName(hospital.name);
    }
    // Generate unique RX ID
    const rand = 100 + (Date.now() % 900);
    setRxId(`RX-2026-${rand}`);
  }, [personnel, hospital]);

  // Load preselected patient if query param exists
  useEffect(() => {
    if (preselectedPatientId) {
      fetchPreselectedPatient(preselectedPatientId);
    }
  }, [preselectedPatientId]);

  const fetchPreselectedPatient = async (id) => {
    if (!id || id === 'undefined') return;
    setIsLoadingPatient(true);
    try {
      const data = await fetchPatientById(id);
      if (data && data.success && (data.patient || data.citizen)) {
        setSelectedPatient(data.patient || data.citizen);
      }
    } catch (err) {
      console.error('Error fetching patient:', err);
    } finally {
      setIsLoadingPatient(false);
    }
  };

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        medicineName: '',
        dosage: '1 Tablet',
        frequency: 'Once Daily',
        duration: '7 Days',
        instructions: 'After Meal',
        morning: true,
        afternoon: false,
        night: false,
        beforeFood: false,
        afterFood: true,
        quantity: '7 Tablets',
        purpose: 'Treatment',
      },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length <= 1) return;
    setMedicines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedPatient) {
      setToast({ message: 'Please enter a Swasthya ID to retrieve the patient record first', type: 'error' });
      return;
    }

    if (!diagnosis.trim()) {
      setToast({ message: 'Please enter a clinical diagnosis', type: 'error' });
      return;
    }

    const invalidMed = medicines.find((m) => !m.medicineName.trim());
    if (invalidMed) {
      setToast({ message: 'Please enter a medicine name for all medicine entries', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    const targetPatientId = selectedPatient.profileId || selectedPatient.id;

    try {
      const prescriptionData = {
        prescriptionId: rxId,
        doctorName: doctorName.trim() || 'Dr. Amit Shah',
        qualification: qualification.trim() || 'MD',
        hospitalName: hospitalName || hospital?.name || 'Apollo Speciality Hospital',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        diagnosis: diagnosis.trim(),
        doctorNotes: doctorNotes.trim(),
        validUntil: validUntil || '30 Days',
        testsRecommended: [],
        rxList: medicines,
        pdfUrl: '',
      };

      const res = await addPrescription(targetPatientId, prescriptionData);
      if (res && res.success) {
        setToast({ message: 'Prescription created & saved successfully!', type: 'success' });
        if (targetPatientId) {
          router.push(`/patients/${targetPatientId}`);
        } else {
          router.push('/patients');
        }
      } else {
        setToast({ message: res?.message || 'Failed to save prescription', type: 'error' });
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setToast({ message: 'Failed to issue prescription. Please check connection.', type: 'error' });
      setIsSubmitting(false);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  const targetPatientId = selectedPatient ? (selectedPatient.profileId || selectedPatient.id) : '';

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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto">
        {/* Top Header / Breadcrumb */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">
              Prescriptions &gt; Create Prescription
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              Create Prescription
            </h1>
          </div>

          <Link
            href={targetPatientId ? `/patients/${targetPatientId}` : '/dashboard'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Link>
        </div>

        {/* ── STEP 1: If No Patient Selected, Show Clean Swasthya ID Card ── */}
        {!selectedPatient ? (
          isLoadingPatient ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-8 h-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-sm font-semibold text-slate-600">Retrieving patient record...</div>
            </div>
          ) : (
            <SwasthyaIdSearchCard
              title="Enter Swasthya ID"
              subtitle="Please enter the patient's 6-digit Swasthya ID to retrieve their medical record."
              actionType="prescription"
              onPatientSelected={(patient) => setSelectedPatient(patient)}
            />
          )
        ) : (
          /* ── STEP 2: Patient Card at Top + Clinical Form ── */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top: Patient Card */}
            <PatientDetailHeader
              patient={selectedPatient}
              onChangePatient={() => setSelectedPatient(null)}
            />

            {/* Prescription Details Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#0F766E]" />
                  <span>Prescription Details</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Amit Shah"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 font-semibold px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualification / Speciality</label>
                  <input
                    type="text"
                    placeholder="e.g. MD (Cardiology), FACC"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hospital / Clinic</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prescription Validity</label>
                  <select
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition"
                  >
                    <option value="7 Days">7 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  Diagnosis / Chief Complaint *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hypertension Stage 2, Acute Pharyngitis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 font-bold px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  Doctor Notes / Clinical Advice
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Review in 2 weeks. Check BP daily in morning."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Medications Section */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#0F766E]" />
                    <span>Medications ({medicines.length})</span>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold text-xs shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-4">
                {medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-700">
                        Medicine #{idx + 1}
                      </span>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Name & Dosage */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block font-medium text-slate-600 mb-1">
                          Medicine Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Tab. Telmisartan 40mg"
                          value={med.medicineName}
                          onChange={(e) => handleMedicineChange(idx, 'medicineName', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-900 font-bold px-3 py-2 rounded-lg text-sm focus:border-[#0F766E] focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-slate-600 mb-1">Dosage</label>
                        <input
                          type="text"
                          placeholder="e.g. 1 Tablet"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-lg text-sm focus:border-[#0F766E] focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Frequency, Duration, Quantity */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">Frequency</label>
                        <select
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-lg text-sm focus:border-[#0F766E] focus:outline-none transition"
                        >
                          <option value="Once Daily">Once Daily (OD)</option>
                          <option value="Twice Daily">Twice Daily (BD)</option>
                          <option value="Thrice Daily">Thrice Daily (TDS)</option>
                          <option value="Four Times Daily">Four Times Daily (QID)</option>
                          <option value="As Needed (SOS)">As Needed (SOS)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-slate-600 mb-1">Duration</label>
                        <input
                          type="text"
                          placeholder="e.g. 7 Days / 1 Month"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-lg text-sm focus:border-[#0F766E] focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-slate-600 mb-1">Quantity</label>
                        <input
                          type="text"
                          placeholder="e.g. 10 Tablets"
                          value={med.quantity}
                          onChange={(e) => handleMedicineChange(idx, 'quantity', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-lg text-sm focus:border-[#0F766E] focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Timing & Food Intake */}
                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500 text-[11px]">Timing:</span>
                        <button
                          type="button"
                          onClick={() => handleMedicineChange(idx, 'morning', !med.morning)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs transition border flex items-center gap-1 ${
                            med.morning
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-white text-slate-400 border-slate-200'
                          }`}
                        >
                          <Sun className="w-3 h-3" />
                          <span>Morning</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMedicineChange(idx, 'afternoon', !med.afternoon)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs transition border flex items-center gap-1 ${
                            med.afternoon
                              ? 'bg-orange-100 text-orange-800 border-orange-300'
                              : 'bg-white text-slate-400 border-slate-200'
                          }`}
                        >
                          <Sunset className="w-3 h-3" />
                          <span>Afternoon</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMedicineChange(idx, 'night', !med.night)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs transition border flex items-center gap-1 ${
                            med.night
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                              : 'bg-white text-slate-400 border-slate-200'
                          }`}
                        >
                          <Moon className="w-3 h-3" />
                          <span>Night</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500 text-[11px]">Food:</span>
                        <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => {
                              handleMedicineChange(idx, 'beforeFood', true);
                              handleMedicineChange(idx, 'afterFood', false);
                              handleMedicineChange(idx, 'instructions', 'Before Meal');
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                              med.beforeFood
                                ? 'bg-[#0F766E] text-white'
                                : 'text-slate-600 hover:text-[#0F766E]'
                            }`}
                          >
                            Before Meal
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleMedicineChange(idx, 'beforeFood', false);
                              handleMedicineChange(idx, 'afterFood', true);
                              handleMedicineChange(idx, 'instructions', 'After Meal');
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                              med.afterFood
                                ? 'bg-[#0F766E] text-white'
                                : 'text-slate-600 hover:text-[#0F766E]'
                            }`}
                          >
                            After Meal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href={targetPatientId ? `/patients/${targetPatientId}` : '/dashboard'}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-2.5 bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-xl font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-2 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Create &amp; Save Prescription</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default function NewPrescriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <NewPrescriptionContent />
    </Suspense>
  );
}
