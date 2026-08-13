'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Sidebar } from '@/components/Sidebar';
import { Toast } from '@/components/Toast';
import { fetchPatients, fetchNfcToken } from '@/lib/api';
import {
  CreditCard,
  Radio,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  User,
  Info,
} from 'lucide-react';

export default function NfcPortalPage() {
  const router = useRouter();
  const { hospital, isAuthenticated, isLoading: authLoading } = useAuth();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [nfcData, setNfcData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isWritingNfc, setIsWritingNfc] = useState(false);
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
  }, [isAuthenticated]);

  const loadPatients = async () => {
    try {
      const data = await fetchPatients({ limit: 100, hospitalName: hospital?.name });
      if (data.success && data.patients.length > 0) {
        setPatients(data.patients);
        setSelectedPatientId(data.patients[0].profileId);
      }
    } catch (e) {
      console.error('Error fetching patients:', e);
    }
  };

  const handleGenerate = async () => {
    if (!selectedPatientId) return;
    setIsGenerating(true);
    try {
      const res = await fetchNfcToken(selectedPatientId);
      if (res.success) {
        setNfcData(res);
        setToast({ message: 'NFC Card URL token generated!', type: 'success' });
      } else {
        setToast({ message: res.message || 'Failed to generate token', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Network error generating NFC token', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWriteNfc = async () => {
    if (!nfcData?.nfcUrl) return;

    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      try {
        setIsWritingNfc(true);
        const ndef = new window.NDEFReader();
        await ndef.write({
          records: [{ recordType: 'url', data: nfcData.nfcUrl }],
        });
        setToast({ message: 'NFC Card written successfully!', type: 'success' });
      } catch (error) {
        console.error('Web NFC write error:', error);
        setToast({
          message: `NFC Write error: ${error.message || 'Ensure NFC tag is held close'}`,
          type: 'error',
        });
      } finally {
        setIsWritingNfc(false);
      }
    } else {
      setToast({
        message: 'Web NFC is supported in Chrome on Android. For desktop, copy the NFC URL into standard NFC tools.',
        type: 'info',
      });
    }
  };

  const copyUrl = () => {
    if (!nfcData?.nfcUrl) return;
    navigator.clipboard.writeText(nfcData.nfcUrl);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
    setToast({ message: 'Copied NFC Card URL to clipboard!', type: 'info' });
  };

  const currentPatient = patients.find((p) => p.profileId === selectedPatientId);

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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto">
        <div className="bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#115e59] text-white rounded-3xl p-6 sm:p-8 border border-blue-500/20 relative shadow-lg overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-white/20 border border-white/30 text-white shadow-sm">
              <CreditCard className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                SwasthyaTap NFC Smart Card Studio
              </h1>
              <p className="text-xs text-blue-200 mt-0.5 font-medium">
                Program physical NTAG213 / NTAG215 / NTAG216 health cards with 256-bit encrypted URL tokens
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Patient selector and token generation */}
          <div className="md:col-span-6 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-slate-205 border-slate-200 shadow-sm space-y-5">
              <h3 className="font-display font-bold text-sm text-blue-650 text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span>Select Target Patient Record</span>
              </h3>

              <div>
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    setNfcData(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  {patients.map((p) => (
                    <option key={p.profileId} value={p.profileId} className="bg-white text-slate-800">
                      {p.fullName} (#{p.profileId}) — Blood: {p.bloodGroup}
                    </option>
                  ))}
                </select>
              </div>

              {currentPatient && (
                <div className="bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#115e59] text-white rounded-3xl p-5 space-y-4 shadow-lg border border-blue-500/20 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-blue-200 uppercase tracking-widest">Selected Citizen</span>
                      <h4 className="font-display font-black text-base text-white tracking-wide uppercase">{currentPatient.fullName}</h4>
                    </div>
                    <div className="w-9 h-6 rounded bg-gradient-to-tr from-amber-400 to-yellow-200 border border-amber-500/50 shadow-inner"></div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/20 font-mono">
                    <div>
                      <span className="text-blue-200 text-[10px] block">Swasthya ID</span>
                      <span className="text-cyan-200 font-bold">#{currentPatient.profileId}</span>
                    </div>
                    <div>
                      <span className="text-blue-200 text-[9px] block">Blood Group</span>
                      <span className="text-rose-205 text-rose-200 font-bold">{currentPatient.bloodGroup}</span>
                    </div>
                    <div>
                      <span className="text-blue-200 text-[9px] block">Emergency Status</span>
                      <span className="text-emerald-250 text-emerald-200 font-bold">READY TO FLASH</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>{isGenerating ? 'Generating Token...' : 'Generate Encrypted NFC Token & URL'}</span>
              </button>
            </div>

            {/* Protocol Information */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold font-display">
                <Info className="w-4 h-4 text-slate-500" />
                <span>NFC Tag Hardware Compatibility</span>
              </div>
              <p className="leading-relaxed text-[11px] font-normal">
                Supports all ISO/IEC 14443 Type A NFC tags (NTAG213, NTAG215, NTAG216, Mifare Ultralight EV1).
                Tapping the physical card with any Android/iOS device instantly loads the emergency health profile in browser without installing an app.
              </p>
            </div>
          </div>

          {/* Right Column: Encrypted Card Payload & Flashing */}
          <div className="md:col-span-6 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-slate-205 border-slate-200 shadow-sm space-y-5 font-sans">
              <h3 className="font-display font-black text-sm text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-500" />
                <span>Encrypted Card Payload</span>
              </h3>

              {nfcData ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-display">
                        Encoded Web URL Payload
                      </span>
                      <button
                        onClick={copyUrl}
                        className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-605 text-blue-600 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-xl transition-all"
                      >
                        {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{hasCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800 break-all">
                      {nfcData.nfcUrl}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono">
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-sans">SHA-256 Signature Hash:</span>
                    <div className="text-blue-600 font-bold truncate">{nfcData.rawToken}</div>
                  </div>

                  <button
                    type="button"
                    onClick={handleWriteNfc}
                    disabled={isWritingNfc}
                    className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Smartphone className="w-4 h-4 stroke-[2.5]" />
                    <span>{isWritingNfc ? 'Touch NFC Card to Reader...' : 'Flash to Physical NFC Tag (Web NFC)'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-12 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-3">
                  <CreditCard className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    Select a patient on the left and click "Generate Encrypted NFC Token" to build card payload.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
