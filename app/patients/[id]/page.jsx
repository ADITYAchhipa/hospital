'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Sidebar } from '@/components/Sidebar';
import { Toast } from '@/components/Toast';
import { BloodBadge, StatusBadge } from '@/components/Badge';
import { fetchPatientById, fetchNfcToken, updatePatient } from '@/lib/api';
import {
  User,
  ArrowLeft,
  Phone,
  AlertTriangle,
  FilePlus,
  FileText,
  Pill,
  Activity,
  HeartHandshake,
  CreditCard,
  CheckCircle2,
  Calendar,
  Stethoscope,
  Building2,
  Download,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  PlusCircle,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  FileCheck,
} from 'lucide-react';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id;

  const { isAuthenticated, isLoading: authLoading, hospital } = useAuth();
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('prescriptions'); // 'prescriptions' | 'reports' | 'emergency' | 'nfc'
  const [nfcData, setNfcData] = useState(null);
  const [isNfcLoading, setIsNfcLoading] = useState(false);
  const [hasCopiedNfc, setHasCopiedNfc] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && patientId) {
      loadPatient();
    }
  }, [isAuthenticated, patientId]);

  const loadPatient = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPatientById(patientId);
      if (data.success && data.patient) {
        setPatient(data.patient);
      } else {
        setToast({ message: data.message || 'Patient record not found', type: 'error' });
      }
    } catch (e) {
      console.error('Error fetching patient:', e);
      setToast({ message: 'Failed to retrieve patient EMR', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNfc = async () => {
    setIsNfcLoading(true);
    try {
      const res = await fetchNfcToken(patientId);
      if (res.success) {
        setNfcData(res);
        setToast({ message: 'NFC Card Token generated successfully!', type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Failed to generate NFC token', type: 'error' });
    } finally {
      setIsNfcLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setHasCopiedNfc(true);
    setTimeout(() => setHasCopiedNfc(false), 2000);
    setToast({ message: 'Copied NFC URL to clipboard!', type: 'info' });
  };

  if (authLoading || !isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-blue-600 font-medium">Decrypting EMR Record #{patientId}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex">
        <Sidebar />
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-805 text-slate-800">Patient Record Not Found</h2>
          <p className="text-sm text-slate-500">ID #{patientId} is not registered in SwasthyaTap database.</p>
          <Link
            href="/patients"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            Back to Patient Directory
          </Link>
        </div>
      </div>
    );
  }

  const hasAllergies = patient.allergies && patient.allergies !== 'None';
  const hasConditions = patient.chronicConditions && patient.chronicConditions !== 'None';

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
        {/* Back navigation & Quick action bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/patients"
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Patient Directory</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={loadPatient}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-650 hover:text-blue-605 hover:text-blue-600 transition shadow-sm"
              title="Refresh Record"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href={`/prescriptions/new?patientId=${patient.profileId}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-bold transition"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Issue Prescription</span>
            </Link>
            <Link
              href={`/reports/new?patientId=${patient.profileId}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-250/60 border-emerald-200 text-xs font-bold transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Upload Report</span>
            </Link>
          </div>
        </div>

        {/* Patient Profile Header Card (Matches outside blue gradient) */}
        <div className="bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#115e59] text-white rounded-3xl p-6 sm:p-8 border border-blue-500/20 relative shadow-lg overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/20 border border-white/35 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-md">
                {patient.fullName ? patient.fullName.charAt(0) : 'P'}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {patient.fullName}
                  </h1>
                  <span className="font-mono text-xs font-black bg-white/20 text-white px-3 py-1 rounded-full border border-white/30 shadow-inner">
                    #{patient.profileId}
                  </span>
                  {patient.isDnr && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-rose-500/30 text-rose-100 border border-rose-450/45 border-rose-400/40 animate-pulse">
                      DNR DIRECTIVE
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100 font-medium pt-0.5">
                  {patient.age && <span>{patient.age} Years Old</span>}
                  {patient.phoneNumber && (
                    <span className="flex items-center gap-1 font-mono text-blue-200">
                      <Phone className="w-3.5 h-3.5 text-blue-300" />
                      {patient.phoneNumber}
                    </span>
                  )}
                  {patient.insuranceCompany && (
                    <span className="text-blue-105 text-blue-100">
                      Insurance: <span className="text-white font-bold">{patient.insuranceCompany}</span> ({patient.insurancePolicyNumber || 'Active'})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-200 font-bold uppercase tracking-wider font-display">Blood Type:</span>
                <BloodBadge group={patient.bloodGroup} size="lg" />
              </div>
              {patient.organPledge?.nottoVerified && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-extrabold shadow-inner">
                  <HeartHandshake className="w-4 h-4 text-white" />
                  <span>NOTTO Organ Donor</span>
                </div>
              )}
            </div>
          </div>

          {/* Critical Clinical Alert Banner */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs relative z-10">
            {/* Allergies Alert */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                hasAllergies
                  ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-black mb-1.5 font-display">
                <AlertTriangle
                  className={`w-4 h-4 ${hasAllergies ? 'text-rose-600' : 'text-emerald-500'}`}
                />
                <span className="uppercase tracking-wide text-[10px]">Drug & Food Allergies</span>
              </div>
              <p className="text-slate-800 font-bold">{patient.allergies || 'No known allergies'}</p>
            </div>

            {/* Chronic Conditions */}
            <div className="p-4 rounded-2xl bg-white border border-slate-205 border-slate-200 text-slate-700">
              <div className="flex items-center gap-2 font-black mb-1.5 text-amber-700 font-display">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span className="uppercase tracking-wide text-[10px]">Chronic Conditions</span>
              </div>
              <p className="text-slate-805 text-slate-800 font-bold">{patient.chronicConditions || 'None documented'}</p>
            </div>

            {/* Special Instructions */}
            <div className="p-4 rounded-2xl bg-white border border-slate-205 border-slate-200 text-slate-700">
              <div className="flex items-center gap-2 font-black mb-1.5 text-blue-700 font-display">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="uppercase tracking-wide text-[10px]">Medical Directives</span>
              </div>
              <p className="text-slate-805 text-slate-800 font-bold">{patient.specialInstructions || 'Standard clinical protocol'}</p>
            </div>
          </div>
        </div>

        {/* EMR Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            {
              id: 'prescriptions',
              label: `Prescriptions (${patient.prescriptions?.length || 0})`,
              icon: Pill,
            },
            {
              id: 'reports',
              label: `Lab & Diagnostics (${patient.medicalReports?.length || 0})`,
              icon: FileCheck,
            },
            {
              id: 'emergency',
              label: 'Emergency & Organ Pledge',
              icon: HeartHandshake,
            },
            {
              id: 'nfc',
              label: 'NFC Health Card',
              icon: CreditCard,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all duration-205 whitespace-nowrap font-display ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                <span>Digital Prescriptions & Pharmacotherapy</span>
              </h3>
              <Link
                href={`/prescriptions/new?patientId=${patient.profileId}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Prescription</span>
              </Link>
            </div>

            {patient.prescriptions && patient.prescriptions.length > 0 ? (
              <div className="space-y-4">
                {patient.prescriptions.map((rx, idx) => (
                  <div
                    key={rx.prescriptionId || idx}
                    className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4 shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-base text-slate-800">
                            {rx.diagnosis}
                          </span>
                          <StatusBadge status={rx.status || 'Active'} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                            {rx.doctorName} ({rx.qualification || 'Consultant'})
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {rx.hospitalName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Issued: {rx.date}</span>
                        {rx.validUntil && (
                          <span className="text-slate-400">| Valid to: {rx.validUntil}</span>
                        )}
                      </div>
                    </div>

                    {/* Doctor Clinical Notes */}
                    {rx.doctorNotes && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold text-blue-600 mr-1.5">Clinical Directive:</span>
                        {rx.doctorNotes}
                      </div>
                    )}

                    {/* Prescribed Medications Table */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Prescribed Medications ({rx.rxList?.length || 0})
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {rx.rxList?.map((med, mIdx) => (
                          <div
                            key={mIdx}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-bold text-sm text-slate-800">{med.medicineName}</span>
                                <div className="text-blue-600 font-medium mt-0.5">{med.dosage} • {med.frequency}</div>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[11px]">
                                {med.duration}
                              </span>
                            </div>

                            {/* Timing Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  med.morning
                                    ? 'bg-amber-50 text-amber-705 text-amber-700 border border-amber-200'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                Morning
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  med.afternoon
                                    ? 'bg-amber-50 text-amber-705 text-amber-700 border border-amber-200'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                Afternoon
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  med.night
                                    ? 'bg-blue-50 text-blue-650 text-blue-600 border border-blue-150'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                Night
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 border border-slate-200 text-slate-600">
                                {med.beforeFood ? 'Before Food' : 'After Food'}
                              </span>
                            </div>

                            {med.instructions && (
                              <p className="text-slate-500 text-[11px] italic">
                                Note: {med.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PDF URL / Slip if available */}
                    {rx.pdfUrl && (
                      <div className="pt-2">
                        <a
                          href={rx.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View / Download Prescription PDF Attachment</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-10 rounded-2xl text-center space-y-3">
                <Pill className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-700 font-semibold">No Prescriptions on File</p>
                <Link
                  href={`/prescriptions/new?patientId=${patient.profileId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-605 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Issue First Prescription</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MEDICAL & DIAGNOSTIC REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <span>Diagnostic Lab & Imaging Reports</span>
              </h3>
              <Link
                href={`/reports/new?patientId=${patient.profileId}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload Medical Report</span>
              </Link>
            </div>

            {patient.medicalReports && patient.medicalReports.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {patient.medicalReports.map((report, rIdx) => (
                  <div
                    key={rIdx}
                    className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-base text-slate-800">
                            {report.title_key ? report.title_key.replace(/_/g, ' ').toUpperCase() : report.name}
                          </span>
                          <StatusBadge status={report.status_key || 'Verified'} />
                          {report.isAbnormal && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-650 text-rose-600 border border-rose-200">
                              Abnormal Parameter
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="text-blue-600 font-medium">
                            Issuer: {report.issuer_key ? report.issuer_key.replace(/_/g, ' ') : report.uploadedBy || 'Diagnostic Lab'}
                          </span>
                          <span>•</span>
                          <span>Dept: {report.department || 'Pathology'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-450 text-slate-400" />
                        <span>Date: {report.date}</span>
                        {report.fileType && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-600">
                            {report.fileType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Test Parameters Breakdown if present */}
                    {report.testParameters && report.testParameters.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Measured Lab Parameters
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-[10px] text-slate-500 bg-slate-50 uppercase">
                                <th className="py-2 px-3">Test Parameter</th>
                                <th className="py-2 px-3">Result</th>
                                <th className="py-2 px-3">Reference Range</th>
                                <th className="py-2 px-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {report.testParameters.map((param, pIdx) => (
                                <tr key={pIdx} className="hover:bg-slate-50">
                                  <td className="py-2 px-3 font-semibold text-slate-800">
                                    {param.parameter}
                                  </td>
                                  <td className="py-2 px-3 font-mono font-bold text-blue-600">
                                    {param.result}
                                  </td>
                                  <td className="py-2 px-3 text-slate-500">
                                    {param.normalRange || '--'}
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    <StatusBadge status={param.status || 'Normal'} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {report.doctorRemarks && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold text-emerald-600 mr-1.5">Doctor Remarks:</span>
                        {report.doctorRemarks}
                      </div>
                    )}

                    {report.url && (
                      <div className="pt-2 flex items-center justify-between">
                        <a
                          href={report.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Original Diagnostic Scan / Attachment</span>
                        </a>
                        <span className="text-[11px] text-slate-500">Ref ID: {report.referenceId || report.labRefNo || 'LAB-001'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-10 rounded-2xl text-center space-y-3">
                <FileCheck className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-700 font-semibold">No Diagnostic Reports Uploaded</p>
                <Link
                  href={`/reports/new?patientId=${patient.profileId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Upload First Report</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EMERGENCY CONTACTS & ORGAN PLEDGE */}
        {activeTab === 'emergency' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emergency Contacts */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <h3 className="font-display font-bold text-base text-slate-800">Emergency Contacts</h3>
              </div>

              {patient.emergencyContacts && patient.emergencyContacts.length > 0 ? (
                <div className="space-y-3">
                  {patient.emergencyContacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{contact.name}</div>
                        <div className="text-slate-500 mt-0.5">Relation: {contact.relation}</div>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-150 font-mono font-bold transition flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{contact.phone}</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No emergency contacts registered for this patient.</p>
              )}
            </div>

            {/* NOTTO Organ Pledge */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-600" />
                <h3 className="font-display font-bold text-base text-slate-800">NOTTO Organ Donation Pledge</h3>
              </div>

              {patient.organPledge ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600">
                      Pledge ID: {patient.organPledge.pledgeId || 'NOTTO-REGISTERED'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-600 border border-emerald-200">
                      Verified
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">Pledged Organs & Tissues:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {patient.organPledge.pledgedOrgans?.map((organ, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-semibold"
                        >
                          {organ}
                        </span>
                      ))}
                    </div>
                  </div>

                  {patient.organPledge.signatureHash && (
                    <div className="pt-2 border-t border-rose-200/60 text-[10px]">
                      <span className="text-slate-500">Cryptographic Signature Hash:</span>
                      <div className="font-mono text-slate-600 truncate bg-white border border-slate-200 p-1.5 rounded mt-0.5">
                        {patient.organPledge.signatureHash}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No organ donation pledge registered.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: NFC HEALTH CARD TOKEN */}
        {activeTab === 'nfc' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-205 border-slate-200 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-black text-slate-800 tracking-tight">NFC Smart Card Gateway</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Flash encrypted NFC NTAG213/215 payload for Patient #{patient.profileId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Holographic NFC Card Card Mockup (Uses premium blue gradient background) */}
              <div className="lg:col-span-6">
                <div className="bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#115e59] text-white rounded-3xl p-6 space-y-6 shadow-lg border border-blue-500/20 relative group hover:scale-[1.02] transition-transform duration-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-lg text-white">
                          Swasthya<span className="text-cyan-300">Tap</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-white/20 text-white border border-white/30">
                          NFC Smart Tag
                        </span>
                      </div>
                      <p className="text-[10px] text-blue-200 font-mono tracking-widest mt-0.5">UNIVERSAL HEALTH DOSSIER</p>
                    </div>

                    {/* Chip Graphic */}
                    <div className="w-11 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-200 border border-amber-500/50 flex items-center justify-center shadow-inner relative overflow-hidden">
                      <div className="w-full h-[1px] bg-amber-600/60 absolute top-2"></div>
                      <div className="w-full h-[1px] bg-amber-600/60 absolute bottom-2"></div>
                      <div className="h-full w-[1px] bg-amber-600/60 absolute left-3"></div>
                      <div className="h-full w-[1px] bg-amber-600/60 absolute right-3"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-blue-200 text-[10px] uppercase tracking-widest font-mono">Cardholder Name</p>
                    <h4 className="font-display text-xl font-black text-white tracking-wide uppercase">
                      {patient.fullName}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
                    <div>
                      <span className="text-blue-200 text-[9px] block uppercase font-mono">Swasthya ID</span>
                      <span className="font-mono text-cyan-200 font-black text-sm">#{patient.profileId}</span>
                    </div>

                    <div>
                      <span className="text-blue-200 text-[9px] block uppercase font-mono">Blood Group</span>
                      <span className="text-rose-205 text-rose-200 font-black text-sm">{patient.bloodGroup}</span>
                    </div>

                    <div>
                      <span className="text-blue-200 text-[9px] block uppercase font-mono">Tag Protocol</span>
                      <span className="text-emerald-200 font-mono font-bold text-xs">NTAG215 (AES-256)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: NFC Data & Action */}
              <div className="lg:col-span-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Hospital workstations can instantly flash this encrypted URL token onto physical NTAG cards. Emergency responders tapping the card with any mobile phone or medical reader will immediately load patient vitals, allergies, and DNR directives.
                </p>

                {nfcData ? (
                  <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-505 text-slate-500 uppercase tracking-widest font-display">
                        Encrypted Target Payload URL
                      </span>
                      <button
                        onClick={() => copyToClipboard(nfcData.nfcUrl)}
                        className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-xl transition-all"
                      >
                        {hasCopiedNfc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{hasCopiedNfc ? 'Copied' : 'Copy Payload'}</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800 break-all">
                      {nfcData.nfcUrl}
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200">
                      <span>SHA-256 Token:</span>
                      <span className="font-mono text-blue-600 font-bold truncate max-w-[200px]">{nfcData.rawToken}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateNfc}
                    disabled={isNfcLoading}
                    className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>{isNfcLoading ? 'Generating Encrypted Token...' : 'Generate NFC Smart Card URL Token'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

