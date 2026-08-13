import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Citizen from '@/lib/models/Citizen';
import Hospital from '@/lib/models/Hospital';
import BloodRequest from '@/lib/models/BloodRequest';

export const dynamic = 'force-dynamic';

function getMonthLabel(dateStr) {
  if (!dateStr) return null;
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 12; i++) {
      if (dateStr.includes(months[i])) {
        return months[i];
      }
    }
    const parts = dateStr.split(/[-/]/);
    if (parts.length >= 2) {
      const monthIndex = parseInt(parts[1], 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        return months[monthIndex];
      }
      const firstPart = parseInt(parts[0], 10) - 1;
      if (firstPart >= 0 && firstPart < 12) {
        return months[firstPart];
      }
    }
  } catch (e) {
    // Ignore parsing error
  }
  return null;
}

export async function GET() {
  try {
    await connectToDatabase();

    const [totalPatients, totalHospitals, bloodRequests, allCitizens] = await Promise.all([
      Citizen.countDocuments(),
      Hospital.countDocuments(),
      BloodRequest.find({ status: 'Open' }),
      Citizen.find({}, { medicalReports: 1, prescriptions: 1, isBloodDonor: 1, isDnr: 1, bloodGroup: 1 }),
    ]);

    let totalReports = 0;
    let totalPrescriptions = 0;
    let totalDonors = 0;
    let totalDnr = 0;

    const bloodGroupDistribution = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0, 'Unknown': 0,
    };

    // Calculate last 6 months labels dynamically
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      last6Months.push(months[idx]);
    }

    const timelineData = {};
    last6Months.forEach((m) => {
      timelineData[m] = { reports: 0, prescriptions: 0 };
    });

    allCitizens.forEach((c) => {
      if (c.medicalReports) {
        totalReports += c.medicalReports.length;
        c.medicalReports.forEach((r) => {
          const m = getMonthLabel(r.date);
          if (m && timelineData[m] !== undefined) {
            timelineData[m].reports++;
          }
        });
      }
      if (c.prescriptions) {
        totalPrescriptions += c.prescriptions.length;
        c.prescriptions.forEach((p) => {
          const m = getMonthLabel(p.date);
          if (m && timelineData[m] !== undefined) {
            timelineData[m].prescriptions++;
          }
        });
      }
      if (c.isBloodDonor) totalDonors++;
      if (c.isDnr) totalDnr++;
      if (c.bloodGroup && bloodGroupDistribution[c.bloodGroup] !== undefined) {
        bloodGroupDistribution[c.bloodGroup]++;
      } else {
        bloodGroupDistribution['Unknown']++;
      }
    });

    const timeline = last6Months.map((m) => ({
      label: m,
      reports: timelineData[m].reports,
      prescriptions: timelineData[m].prescriptions,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalPatients,
        totalHospitals,
        totalReports,
        totalPrescriptions,
        totalDonors,
        totalDnr,
        activeBloodRequests: bloodRequests.length,
        bloodGroupDistribution,
        timeline,
      },
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to aggregate statistics', error: error.message },
      { status: 500 }
    );
  }
}
