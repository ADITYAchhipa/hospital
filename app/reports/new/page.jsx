'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Sidebar } from '@/components/Sidebar';
import { Toast } from '@/components/Toast';
import { PatientDetailHeader } from '@/components/PatientDetailHeader';
import { SwasthyaIdSearchCard } from '@/components/SwasthyaIdSearchCard';
import { fetchPatientById, addMedicalReport } from '@/lib/api';
import {
  Plus,
  Trash2,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Layers,
  ArrowLeft,
} from 'lucide-react';

function NewReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId') || '';

  const { hospital, personnel, isAuthenticated, isLoading: authLoading } = useAuth();

  // Selected Patient State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  // Form State
  const [reportTitle, setReportTitle] = useState('Complete Blood Count (CBC)');
  const [issuerKey, setIssuerKey] = useState('Apollo Speciality Hospital');
  const [department, setDepartment] = useState('Hematology');
  const [doctorKey, setDoctorKey] = useState('Dr. Amit Shah');
  const [category, setCategory] = useState('Blood Tests');
  const [date, setDate] = useState('24 Jun 2026');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [doctorRemarks, setDoctorRemarks] = useState(
    'All measured parameters are within standard reference ranges.'
  );
  const [fileUrl, setFileUrl] = useState(
    'https://res.cloudinary.com/demo/image/upload/v1570530932/sample.jpg'
  );
  const [fileName, setFileName] = useState('');

  const [testParameters, setTestParameters] = useState([
    { parameter: 'Hemoglobin', result: '14.2 g/dL', normalRange: '13.0 - 17.0 g/dL', status: 'Normal' },
    { parameter: 'RBC Count', result: '4.8 M/µL', normalRange: '4.5 - 5.5 M/µL', status: 'Normal' },
    { parameter: 'WBC Count', result: '7,200 /µL', normalRange: '4,000 - 11,000 /µL', status: 'Normal' },
    { parameter: 'Platelet Count', result: '240,000 /µL', normalRange: '150,000 - 450,000 /µL', status: 'Normal' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const templates = [
    {
      title: 'Complete Blood Count (CBC)',
      dept: 'Hematology',
      cat: 'Blood Tests',
      params: [
        { parameter: 'Hemoglobin', result: '14.2 g/dL', normalRange: '13.0 - 17.0 g/dL', status: 'Normal' },
        { parameter: 'RBC Count', result: '4.8 M/µL', normalRange: '4.5 - 5.5 M/µL', status: 'Normal' },
        { parameter: 'WBC Count', result: '7,200 /µL', normalRange: '4,000 - 11,000 /µL', status: 'Normal' },
        { parameter: 'Platelet Count', result: '240,000 /µL', normalRange: '150,000 - 450,000 /µL', status: 'Normal' },
      ],
    },
    {
      title: 'Lipid Profile Panel',
      dept: 'Biochemistry',
      cat: 'Blood Tests',
      params: [
        { parameter: 'Total Cholesterol', result: '190 mg/dL', normalRange: '< 200 mg/dL', status: 'Normal' },
        { parameter: 'Triglycerides', result: '135 mg/dL', normalRange: '< 150 mg/dL', status: 'Normal' },
        { parameter: 'HDL Cholesterol', result: '52 mg/dL', normalRange: '> 40 mg/dL', status: 'Optimal' },
        { parameter: 'LDL Cholesterol', result: '110 mg/dL', normalRange: '< 130 mg/dL', status: 'Normal' },
      ],
    },
    {
      title: 'Thyroid Function Test (TFT)',
      dept: 'Endocrinology',
      cat: 'Blood Tests',
      params: [
        { parameter: 'TSH', result: '2.15 µIU/mL', normalRange: '0.55 - 4.78 µIU/mL', status: 'Normal' },
        { parameter: 'Total T3', result: '1.20 ng/mL', normalRange: '0.80 - 2.00 ng/mL', status: 'Normal' },
        { parameter: 'Total T4', result: '8.5 µg/dL', normalRange: '5.1 - 14.1 µg/dL', status: 'Normal' },
      ],
    },
    {
      title: 'Chest Radiograph (PA View)',
      dept: 'Radiology',
      cat: 'Radiology',
      params: [
        { parameter: 'Lung Fields', result: 'Clear bilateral lung fields', normalRange: 'Clear', status: 'Normal' },
        { parameter: 'Cardiothoracic Ratio', result: 'Normal cardiac shadow', normalRange: 'Normal CTR', status: 'Normal' },
        { parameter: 'Pleural Spaces', result: 'Clear and sharp', normalRange: 'Clear', status: 'Normal' },
      ],
    },
    {
      title: 'Kidney Function Test (KFT)',
      dept: 'Nephrology',
      cat: 'Blood Tests',
      params: [
        { parameter: 'Serum Creatinine', result: '0.9 mg/dL', normalRange: '0.7 - 1.3 mg/dL', status: 'Normal' },
        { parameter: 'Blood Urea Nitrogen', result: '14 mg/dL', normalRange: '7 - 20 mg/dL', status: 'Normal' },
        { parameter: 'eGFR', result: '98 mL/min', normalRange: '> 90 mL/min', status: 'Normal' },
      ],
    },
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (hospital?.name) {
      setIssuerKey(hospital.name);
    }
    if (personnel?.name) {
      setDoctorKey(personnel.name);
    }
    setDate(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  }, [hospital, personnel]);

  // Load preselected patient if query param exists
  useEffect(() => {
    if (preselectedPatientId) {
      fetchPreselectedPatient(preselectedPatientId);
    }
  }, [preselectedPatientId]);

  const fetchPreselectedPatient = async (id) => {
    setIsLoadingPatient(true);
    try {
      const data = await fetchPatientById(id);
      if (data.success && (data.patient || data.citizen)) {
        setSelectedPatient(data.patient || data.citizen);
      }
    } catch (err) {
      console.error('Error fetching patient:', err);
    } finally {
      setIsLoadingPatient(false);
    }
  };

  const handleApplyTemplate = (tmpl) => {
    setReportTitle(tmpl.title);
    setDepartment(tmpl.dept);
    setCategory(tmpl.cat);
    setTestParameters(tmpl.params);
    setToast({ message: `Loaded template: ${tmpl.title}`, type: 'info' });
  };

  const handleAddParam = () => {
    setTestParameters([
      ...testParameters,
      { parameter: '', result: '', normalRange: '', status: 'Normal' },
    ]);
  };

  const handleRemoveParam = (index) => {
    if (testParameters.length <= 1) return;
    setTestParameters(testParameters.filter((_, idx) => idx !== index));
  };

  const handleParamChange = (index, field, value) => {
    const updated = [...testParameters];
    updated[index][field] = value;
    setTestParameters(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedPatient) {
      setToast({ message: 'Please enter a Swasthya ID to retrieve the patient record first', type: 'error' });
      return;
    }

    if (!reportTitle.trim()) {
      setToast({ message: 'Report title is required', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    const targetPatientId = selectedPatient.profileId || selectedPatient.id;

    try {
      const titleKey = reportTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
      const issuer = issuerKey.trim() || hospital?.name || 'Apollo Speciality Hospital';

      const reportData = {
        title_key: titleKey,
        issuer_key: issuer,
        department,
        doctor_key: doctorKey || 'Dr. Amit Shah',
        category,
        date,
        isAbnormal,
        doctorRemarks: doctorRemarks.trim(),
        notes: doctorRemarks.trim(),
        testParameters,
        fileUrl: fileUrl.trim(),
        url: fileUrl.trim(),
        fileName: fileName || `${titleKey}_${Date.now()}.pdf`,
        fileType: 'PDF',
        fileSize: '1.6 MB',
        tags: [category, department, 'Lab Report'],
        uploadedBy: issuer,
        status_key: 'verified_report',
      };

      const res = await addMedicalReport(targetPatientId, reportData);
      if (res && res.success) {
        setToast({ message: 'Medical Report uploaded successfully!', type: 'success' });
        if (targetPatientId) {
          router.push(`/patients/${targetPatientId}`);
        } else {
          router.push('/patients');
        }
      } else {
        setToast({ message: res?.message || 'Failed to upload report', type: 'error' });
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setToast({ message: 'Failed to upload report. Please check connection.', type: 'error' });
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
              Medical Reports &gt; Upload Medical Report
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              Upload Medical Report
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
              actionType="report"
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

            {/* Quick Templates Row */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-2">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Quick Diagnostic Templates</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {templates.map((tmpl) => (
                  <button
                    key={tmpl.title}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-teal-50 text-slate-700 hover:text-[#0F766E] border border-slate-200 text-xs font-semibold transition"
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Report Details Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0F766E]" />
                  <span>Report Information</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Report Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Blood Count (CBC)"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 font-bold px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition"
                  >
                    <option value="Blood Tests">Blood Tests</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issuer / Hospital</label>
                  <input
                    type="text"
                    required
                    value={issuerKey}
                    onChange={(e) => setIssuerKey(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={doctorKey}
                    onChange={(e) => setDoctorKey(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Abnormal Switch */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className={`w-4 h-4 ${isAbnormal ? 'text-rose-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="font-bold text-xs text-slate-800">Abnormal Report Indicator</span>
                    <p className="text-[11px] text-slate-500">Flags this report as requiring attention in the patient's card</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAbnormal}
                    onChange={(e) => setIsAbnormal(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  Doctor Remarks / Interpretation
                </label>
                <textarea
                  rows={2}
                  value={doctorRemarks}
                  onChange={(e) => setDoctorRemarks(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Test Parameters Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#0F766E]" />
                  <span>Test Parameters ({testParameters.length})</span>
                </h2>

                <button
                  type="button"
                  onClick={handleAddParam}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold text-xs shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Parameter</span>
                </button>
              </div>

              <div className="space-y-3">
                {testParameters.map((param, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full text-xs">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                          Parameter *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hemoglobin"
                          value={param.parameter}
                          onChange={(e) => handleParamChange(idx, 'parameter', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-900 font-bold px-3 py-1.5 rounded-lg text-xs focus:border-[#0F766E] focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                          Result Value *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 14.2 g/dL"
                          value={param.result}
                          onChange={(e) => handleParamChange(idx, 'result', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-900 font-bold px-3 py-1.5 rounded-lg text-xs focus:border-[#0F766E] focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                          Normal Range
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 13.0 - 17.0 g/dL"
                          value={param.normalRange}
                          onChange={(e) => handleParamChange(idx, 'normalRange', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-1.5 rounded-lg text-xs focus:border-[#0F766E] focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-1">
                      <select
                        value={param.status}
                        onChange={(e) => handleParamChange(idx, 'status', e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition ${
                          param.status === 'Abnormal' || param.status === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-white text-emerald-700 border-slate-200'
                        }`}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Optimal">Optimal</option>
                        <option value="Abnormal">Abnormal</option>
                        <option value="Critical">Critical</option>
                      </select>

                      {testParameters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParam(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Attachment */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <UploadCloud className="w-4 h-4 text-[#0F766E]" />
                <span>Document Attachment</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Document URL / PDF Link
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://storage.com/report.pdf"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    File Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. cbc_report_jun2026.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-sm focus:bg-white focus:border-[#0F766E] focus:outline-none transition font-mono text-xs"
                  />
                </div>
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
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Upload &amp; Attach Report</span>
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

export default function NewReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <NewReportContent />
    </Suspense>
  );
}
