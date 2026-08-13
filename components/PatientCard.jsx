'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Phone,
  AlertTriangle,
  FilePlus,
  FileText,
  CreditCard,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { BloodBadge } from './Badge';

export function PatientCard({ patient }) {
  const hasAllergies = patient.allergies && patient.allergies !== 'None';
  const hasConditions = patient.chronicConditions && patient.chronicConditions !== 'None';

  return (
    <div className="glass-card rounded-3xl p-5 border border-slate-200/80 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
      {/* Top right ambient gradient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-500 pointer-events-none"></div>

      <div>
        {/* Header: Name, ID, Blood Group */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-lg group-hover:scale-110 group-hover:border-blue-300 transition-all duration-300 shadow-sm">
              {patient.fullName ? patient.fullName.charAt(0) : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-black text-base text-slate-800 group-hover:text-blue-605 group-hover:text-blue-600 transition-colors tracking-tight">
                  {patient.fullName}
                </h4>
                {patient.isDnr && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-rose-100 text-rose-600 border border-rose-200 animate-pulse">
                    DNR
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shadow-inner">
                  #{patient.profileId || patient.id}
                </span>
                {patient.age && (
                  <span className="text-[11px] text-slate-500 font-medium">{patient.age} yrs</span>
                )}
              </div>
            </div>
          </div>
          <BloodBadge group={patient.bloodGroup} size="sm" />
        </div>

        {/* Clinical Summary Chips */}
        <div className="mt-4 space-y-2 text-xs">
          {hasAllergies ? (
            <div className="flex items-center gap-2 text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-150 shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
              <span className="truncate font-semibold text-[11px]">Allergy: {patient.allergies}</span>
            </div>
          ) : (
            <div className="text-slate-500 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></span>
              <span>No Known Drug Allergies</span>
            </div>
          )}

          {hasConditions && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
              <span className="truncate font-medium">{patient.chronicConditions}</span>
            </div>
          )}

          {patient.phoneNumber && (
            <div className="flex items-center gap-2 text-slate-550 text-[11px] px-1 pt-1 font-mono">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{patient.phoneNumber}</span>
            </div>
          )}
        </div>

        {/* Record counts */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-550 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-800 font-extrabold">{patient.prescriptions?.length || 0}</span>
            <span className="text-[11px] text-slate-500">Prescriptions</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-800 font-extrabold">{patient.medicalReports?.length || 0}</span>
            <span className="text-[11px] text-slate-500">Lab Reports</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center gap-2">
        <Link
          href={`/patients/${patient.profileId || patient.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-105 hover:bg-blue-100 border border-blue-200/80 text-xs font-bold transition-all duration-200 group/btn shadow-sm"
        >
          <span>Open EMR</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href={`/prescriptions/new?patientId=${patient.profileId || patient.id}`}
          className="p-2 rounded-xl bg-slate-50 text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors"
          title="Add Prescription"
        >
          <FilePlus className="w-4 h-4" />
        </Link>

        <Link
          href={`/reports/new?patientId=${patient.profileId || patient.id}`}
          className="p-2 rounded-xl bg-slate-50 text-emerald-600 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-colors"
          title="Upload Medical Report"
        >
          <FileText className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

