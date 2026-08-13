'use client';

import React from 'react';
import {
  Phone,
  AlertTriangle,
  ShieldAlert,
  HeartHandshake,
  ShieldCheck,
  ArrowLeftRight,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { BloodBadge } from './Badge';

export function PatientDetailHeader({ patient, onChangePatient }) {
  if (!patient) return null;

  const profileId = patient.profileId || patient.id;
  const hasAllergies =
    patient.allergies &&
    patient.allergies.toLowerCase() !== 'none' &&
    patient.allergies.trim() !== '';
  const hasConditions =
    patient.chronicConditions &&
    patient.chronicConditions.toLowerCase() !== 'none' &&
    patient.chronicConditions.trim() !== '';
  const primaryEmergencyContact =
    patient.emergencyContacts && patient.emergencyContacts.length > 0
      ? patient.emergencyContacts[0]
      : null;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      {/* Top Main Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar / Initials */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0f766e] to-[#0d9488] text-white flex items-center justify-center text-xl font-black shadow-md flex-shrink-0">
            {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : 'P'}
          </div>

          {/* Name & Basic Info */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 leading-tight">
                {patient.fullName}
              </h3>
              {patient.isDnr && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200">
                  DNR
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-slate-600">
              <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                #{profileId}
              </span>
              <span>•</span>
              <span>{patient.age ? `${patient.age} Y / Male` : 'Adult'}</span>
              <span>•</span>
              <span className="font-bold text-slate-800">
                {patient.bloodGroup || 'Blood Group N/A'}
              </span>
            </div>

            {patient.phoneNumber && (
              <div className="text-xs text-slate-500 font-mono flex items-center gap-1 pt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{patient.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Change Patient Action */}
        {onChangePatient && (
          <div className="flex items-center sm:self-start gap-2">
            <button
              type="button"
              onClick={onChangePatient}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-bold transition active:scale-95 shadow-xs"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Change Patient</span>
            </button>
          </div>
        )}
      </div>

      {/* Badges / Clinical Safety Row */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
        {hasAllergies ? (
          <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-xl font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
            <span>Allergy: <strong className="font-bold">{patient.allergies}</strong></span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>No Known Drug Allergies</span>
          </div>
        )}

        {hasConditions && (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-xl text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Conditions: <strong className="font-bold">{patient.chronicConditions}</strong></span>
          </div>
        )}

        {patient.organPledge?.nottoVerified && (
          <div className="flex items-center gap-1.5 bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-xl text-xs font-semibold">
            <HeartHandshake className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
            <span>NOTTO Organ Donor</span>
          </div>
        )}

        {primaryEmergencyContact && (
          <div className="flex items-center gap-1.5 bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded-xl text-xs">
            <span>Emergency: <strong>{primaryEmergencyContact.name} ({primaryEmergencyContact.phone})</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
