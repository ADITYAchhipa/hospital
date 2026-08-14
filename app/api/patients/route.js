import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Citizen from '@/lib/models/Citizen';

export const dynamic = 'force-dynamic';

function formatCitizen(c) {
  return {
    id: c.profileId,
    profileId: c.profileId,
    fullName: c.fullName,
    phoneNumber: c.phoneNumber,
    email: c.email,
    bloodGroup: c.bloodGroup,
    age: c.age,
    address: c.address,
    allergies: c.allergies,
    medications: c.medications,
    chronicConditions: c.chronicConditions,
    specialInstructions: c.specialInstructions,
    isDnr: c.isDnr,
    emergencyContacts: c.emergencyContacts || [],
    organPledge: c.organPledge,
    insuranceCompany: c.insuranceCompany,
    insurancePolicyNumber: c.insurancePolicyNumber,
    medicalReports: c.medicalReports || [],
    receipts: c.receipts || [],
    prescriptions: c.prescriptions || [],
    isBloodDonor: c.isBloodDonor,
    donorRadiusKm: c.donorRadiusKm,
    homeLat: c.homeLat,
    homeLng: c.homeLng,
    lifeCredits: c.lifeCredits,
    selectedLanguage: c.selectedLanguage,
    profileCompleteness: typeof c.calculateCompleteness === 'function' ? c.calculateCompleteness() : (c.profileCompleteness || 85),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('search') || '';
    const bloodGroup = searchParams.get('bloodGroup');
    const hasConditions = searchParams.get('hasConditions');
    const isDonor = searchParams.get('isDonor');
    const hospitalName = searchParams.get('hospitalName');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const conditions = [];

    if (query.trim()) {
      const q = query.trim();
      conditions.push({
        $or: [
          { profileId: new RegExp(q, 'i') },
          { fullName: new RegExp(q, 'i') },
          { phoneNumber: new RegExp(q, 'i') },
          { email: new RegExp(q, 'i') },
          { chronicConditions: new RegExp(q, 'i') },
          { allergies: new RegExp(q, 'i') },
          { insuranceCompany: new RegExp(q, 'i') },
        ]
      });
    }

    if (bloodGroup && bloodGroup !== 'All') {
      conditions.push({ bloodGroup });
    }

    if (isDonor === 'true') {
      conditions.push({ isBloodDonor: true });
    }

    if (hasConditions === 'true') {
      conditions.push({ chronicConditions: { $ne: 'None', $exists: true } });
    }

    let filter = conditions.length > 0 ? { $and: conditions } : {};

    let citizens = await Citizen.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit);

    // If hospitalName filter was provided, try to find hospital-specific patients first
    if (hospitalName && hospitalName.trim() && citizens.length > 0) {
      const nameCleaned = hospitalName.trim();
      const hospitalConditions = [
        ...conditions,
        {
          $or: [
            { "prescriptions.hospitalName": new RegExp(nameCleaned, 'i') },
            { "medicalReports.issuer_key": new RegExp(nameCleaned, 'i') }
          ]
        }
      ];
      const hospitalSpecific = await Citizen.find({ $and: hospitalConditions })
        .sort({ updatedAt: -1 })
        .limit(limit);

      if (hospitalSpecific.length > 0) {
        citizens = hospitalSpecific;
      }
    }

    return NextResponse.json({
      success: true,
      count: citizens.length,
      patients: citizens.map(formatCitizen),
    });
  } catch (error) {
    console.error('Fetch patients error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch patients', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      fullName,
      phoneNumber,
      bloodGroup = 'Unknown',
      age,
      address,
      allergies = 'None',
      medications = 'None',
      chronicConditions = 'None',
      specialInstructions = 'None',
      isDnr = false,
      emergencyContacts = [],
      insuranceCompany = '',
      insurancePolicyNumber = '',
      isBloodDonor = false,
    } = body;

    if (!fullName) {
      return NextResponse.json(
        { success: false, message: 'Patient full name is required' },
        { status: 400 }
      );
    }

    // Generate unique 6-character profileId
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let profileId = '';
    let isUnique = false;
    while (!isUnique) {
      profileId = '';
      for (let i = 0; i < 6; i++) {
        profileId += chars[Math.floor(Math.random() * chars.length)];
      }
      const existing = await Citizen.findOne({ profileId });
      if (!existing) isUnique = true;
    }

    const newCitizen = await Citizen.create({
      profileId,
      fullName,
      phoneNumber: phoneNumber || undefined,
      bloodGroup,
      age: age ? Number(age) : null,
      address: address || '',
      allergies,
      medications,
      chronicConditions,
      specialInstructions,
      isDnr: Boolean(isDnr),
      emergencyContacts,
      insuranceCompany,
      insurancePolicyNumber,
      isBloodDonor: Boolean(isBloodDonor),
      lifeCredits: 100,
    });

    return NextResponse.json({
      success: true,
      message: 'Patient registered successfully',
      patient: formatCitizen(newCitizen),
    });
  } catch (error) {
    console.error('Create patient error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create patient', error: error.message },
      { status: 500 }
    );
  }
}
