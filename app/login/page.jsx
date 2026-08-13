'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  fetchHospitals,
  sendHospitalOtp,
  verifyHospitalOtp,
} from '@/lib/api';
import {
  ShieldCheck,
  FileText,
  Calendar,
  Bell,
  Users,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  KeyRound,
  Stethoscope,
} from 'lucide-react';
import { Toast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Authentication State
  const [hospitals, setHospitals] = useState([]);
  const [hospitalId, setHospitalId] = useState('HOSP-001');

  const [step, setStep] = useState(1); // 1: Hospital ID input, 2: OTP verification
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [selectedPersonnelId, setSelectedPersonnelId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const data = await fetchHospitals();
      if (data.success && data.hospitals?.length > 0) {
        setHospitals(data.hospitals);
        if (!hospitalId) {
          setHospitalId(data.hospitals[0].hospitalId);
        }
        if (data.hospitals[0].authorizedPersonnel?.length > 0) {
          setSelectedPersonnelId(data.hospitals[0].authorizedPersonnel[0].personnelId);
        }
      }
    } catch (e) {
      console.error('Failed to load hospitals:', e);
    }
  };

  const currentHospital = hospitals.find(
    (h) => h.hospitalId?.toLowerCase() === hospitalId?.trim()?.toLowerCase()
  );

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const targetId = hospitalId.trim();

    if (!targetId) {
      setToast({ message: 'Please enter a valid Hospital ID', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendHospitalOtp(targetId);
      if (res.success) {
        setMaskedPhone(res.maskedPhone || 'registered phone');
        if (res.devOtp) {
          setDevOtpHint(res.devOtp);
          setOtp(res.devOtp); // Auto-fill correct OTP for developers when PRODUCTION_OTP is false
        } else {
          setDevOtpHint('');
          setOtp('');
        }
        setStep(2);
        setToast({ message: res.message || 'OTP sent successfully!', type: 'success' });
      } else {
        setToast({ message: res.message || `Hospital ID '${targetId}' not found in database`, type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Network error sending OTP', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const targetId = hospitalId.trim();

    if (!otp) {
      setToast({ message: 'Please enter the OTP code', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyHospitalOtp(targetId, otp, selectedPersonnelId);
      if (res.success) {
        login(res.token, res.hospital, res.personnel);
        setToast({ message: 'Authentication successful! Redirecting...', type: 'success' });
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        setToast({ message: res.message || 'Invalid OTP code', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Verification error', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const quickSelectHospital = (hospId, personnelId) => {
    setHospitalId(hospId);
    if (personnelId) setSelectedPersonnelId(personnelId);
    setStep(1);
    setOtp('');
    setDevOtpHint('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#115e59] text-white selection:bg-cyan-400 selection:text-blue-950 relative overflow-x-hidden font-sans">
      {/* Toast notifications */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Subtle floating ambient circles */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SECTION: Brand Narrative, Feature List & 3D Illustration */}
          <div className="lg:col-span-6 space-y-8 relative z-10">
            
            {/* Top Brand Header */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="SwasthyaTap Logo"
                className="w-11 h-11 rounded-2xl object-contain bg-white border border-blue-400/30 shadow-lg"
              />
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Swasthya
                </h1>
                <p className="text-xs text-cyan-200/90 font-medium tracking-wide">
                  Your Health. Our Priority.
                </p>
              </div>
            </div>

            {/* Title & Headline */}
            <div className="space-y-3">
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Your Health, <br />
                <span className="text-[#2dd4bf]">Our Priority</span>
              </h2>
              {/* Cyan Accent Bar */}
              <div className="w-12 h-1 bg-[#2dd4bf] rounded-full shadow-[0_0_12px_#2dd4bf]"></div>
              
              <p className="text-sm sm:text-base text-blue-100/90 max-w-lg leading-relaxed pt-1 font-normal">
                Swasthya hospital management portal. Access clinical records, emergency blood network, and patient history securely.
              </p>
            </div>

            {/* Feature Bullet List & 3D Illustration Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Feature Cards Stack */}
              <div className="sm:col-span-6 space-y-4">
                {[
                  {
                    icon: FileText,
                    title: 'Health Records',
                    desc: 'Store and access medical records securely.',
                  },
                  {
                    icon: Calendar,
                    title: 'Book Appointments',
                    desc: 'Manage appointments with ease.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Secure & Private',
                    desc: 'Data encrypted and 100% secure.',
                  },
                  {
                    icon: Bell,
                    title: 'Timely Reminders',
                    desc: 'Reminders for medicines & schedules.',
                  },
                ].map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3.5 group">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/60 border border-blue-400/30 flex items-center justify-center text-cyan-300 flex-shrink-0 group-hover:bg-blue-500/80 group-hover:scale-105 transition-all">
                        <IconComp className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white tracking-wide">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-blue-200/80 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3D Medical Clipboard & Shield Graphics Mockup */}
              <div className="sm:col-span-6 flex justify-center relative py-4">
                <div className="relative w-60 h-64 flex items-center justify-center">
                  
                  {/* Pedestal Shadow Disc */}
                  <div className="absolute bottom-2 w-52 h-14 bg-blue-950/70 rounded-[100%] blur-md border border-blue-500/20"></div>

                  {/* 3D Clipboard Card */}
                  <div className="w-44 h-56 bg-white rounded-2xl shadow-2xl p-4 border border-blue-200 transform -rotate-3 hover:rotate-0 transition-transform duration-500 flex flex-col justify-between relative z-10">
                    <div className="w-10 h-3 bg-blue-700 rounded-full mx-auto -mt-6 shadow-md"></div>
                    
                    <div className="text-center pt-1">
                      <span className="text-[11px] font-bold text-blue-600 font-display uppercase tracking-wider">
                        Health Record
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        P
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="w-16 h-2 bg-blue-200 rounded"></div>
                        <div className="w-10 h-1.5 bg-blue-100 rounded"></div>
                      </div>
                    </div>

                    <div className="space-y-1.5 py-1">
                      <div className="w-full h-1.5 bg-slate-200 rounded"></div>
                      <div className="w-4/5 h-1.5 bg-slate-200 rounded"></div>
                      <div className="w-3/5 h-1.5 bg-slate-200 rounded"></div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-100 pt-1">
                      <span>Vitals: Normal</span>
                      <span className="font-bold text-blue-600">VERIFIED</span>
                    </div>
                  </div>

                  {/* 3D Shield Badge (Left Overlay) */}
                  <div className="absolute left-1 bottom-8 z-20 w-16 h-20 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-2xl shadow-xl border-2 border-white/80 flex items-center justify-center transform -rotate-12 hover:scale-110 transition-transform">
                    <div className="text-white font-extrabold text-2xl">
                      +
                    </div>
                  </div>

                  {/* 3D Stethoscope Graphic (Right Bottom Overlay) */}
                  <div className="absolute right-0 bottom-4 z-20 w-20 h-20 rounded-full border-4 border-blue-900/80 bg-blue-950/40 backdrop-blur-sm flex items-center justify-center transform rotate-12 shadow-lg">
                    <Stethoscope className="w-10 h-10 text-cyan-300 stroke-[2.5]" />
                  </div>

                </div>
              </div>
            </div>

            {/* Quick Demo Hospital Buttons */}
            <div className="pt-2 border-t border-blue-400/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Quick Select Hospital ID</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'HOSP-001', staff: 'STAFF-001', name: 'Bangalore Govt' },
                  { id: 'HOSP-004', staff: 'STAFF-006', name: 'Fortis Hospital' },
                  { id: 'HOSP-002', staff: 'STAFF-003', name: "St. John's Med" },
                  { id: 'HOSP-003', staff: 'STAFF-005', name: 'Victoria Hosp' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => quickSelectHospital(item.id, item.staff)}
                    className={`px-2.5 py-1.5 text-left rounded-xl text-[11px] font-semibold border transition ${
                      hospitalId?.toUpperCase() === item.id
                        ? 'bg-cyan-400 text-blue-950 border-cyan-300 shadow-md font-bold'
                        : 'bg-blue-900/50 text-blue-100 border-blue-400/30 hover:bg-blue-800/60'
                    }`}
                  >
                    <div className="truncate">{item.name}</div>
                    <div className="text-[9px] opacity-80 font-mono">{item.id}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SECTION: White Login Card Container */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-lg bg-white text-slate-800 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
              
              {/* Login Card Header */}
              <div className="space-y-1 mb-6">
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome Back!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Enter your Hospital ID to receive OTP on registered mobile number
                </p>
              </div>

              {/* Step 1: Enter Hospital ID */}
              {step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Hospital ID</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Enter Hospital ID (e.g. HOSP-001)"
                        value={hospitalId}
                        onChange={(e) => setHospitalId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-base font-mono font-bold text-slate-900 placeholder-slate-450 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                        autoFocus
                      />
                      <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                    <p className="text-[11px] text-slate-550 mt-1.5 font-medium">
                      Backend checks if ID exists in database before dispatching Twilio OTP.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <span>Checking DB & Sending OTP...</span>
                    ) : (
                      <>
                        <span>Send OTP</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: OTP Verification */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                    <div>
                      <span className="font-bold">OTP Dispatched via Twilio:</span> Sent to registered mobile ending in{' '}
                      <span className="font-bold text-slate-900">{maskedPhone}</span>.
                    </div>
                  </div>

                  {devOtpHint && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-250 text-xs text-amber-900 flex items-center justify-between">
                      <span className="font-semibold">Dev Auto-fill (PRODUCTION_OTP=false):</span>
                      <span className="font-mono font-black text-sm text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded tracking-widest border border-amber-200">
                        {devOtpHint}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                      Enter 4-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-center font-mono text-2xl tracking-[0.3em] font-bold text-blue-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                    >
                      Change ID
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-2/3 py-3.5 px-6 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
                    >
                      {isLoading ? <span>Verifying...</span> : <span>Verify & Login</span>}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM FOOTER STRIP */}
      <footer className="w-full bg-[#F8FAFC] border-t border-blue-100/80 py-3.5 px-4 sm:px-8 text-slate-700 text-xs mt-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left item */}
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span>Your health information is encrypted and 100% secure with us.</span>
          </div>

          {/* Center Stats */}
          <div className="flex flex-wrap items-center gap-6 text-slate-800 font-bold">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span><strong className="text-slate-900 font-extrabold">50K+</strong> <span className="text-slate-500 font-normal text-[11px]">Happy Users</span></span>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span><strong className="text-slate-900 font-extrabold">200+</strong> <span className="text-slate-500 font-normal text-[11px]">Partner Hospitals</span></span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span><strong className="text-slate-900 font-extrabold">99.9%</strong> <span className="text-slate-500 font-normal text-[11px]">Data Protection</span></span>
            </div>
          </div>

          {/* Right Copyright */}
          <div className="text-slate-500 text-[11px] font-medium">
            © 2026 Swasthya. All rights reserved.
          </div>

        </div>
      </footer>
    </div>
  );
}
