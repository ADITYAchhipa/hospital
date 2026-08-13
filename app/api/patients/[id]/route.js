import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import Citizen from '@/lib/models/Citizen';
import NfcCard from '@/lib/models/NfcCard';

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
    profileCompleteness: typeof c.calculateCompleteness === 'function' ? c.calculateCompleteness() : 85,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    let citizen = await Citizen.findOne({ profileId: id });
    if (!citizen && id) {
      citizen = await Citizen.findOne({
        profileId: { $regex: new RegExp(`^${id.trim()}$`, 'i') },
      });
    }

    // If 64-char NFC token lookup
    if (!citizen && id && id.length === 64) {
      const card = await NfcCard.findOne({ rawToken: id });
      if (card) {
        citizen = await Citizen.findById(card.patientId);
      }

      if (!citizen) {
        const citizens = await Citizen.find({});
        citizen = citizens.find(
          (c) => crypto.createHash('sha256').update(c.profileId).digest('hex') === id
        );
      }
    }

    // Try finding by MongoDB _id
    if (!citizen && id && id.match(/^[0-9a-fA-F]{24}$/)) {
      citizen = await Citizen.findById(id);
    }

    if (!citizen) {
      return NextResponse.json(
        { success: false, message: `Patient profile '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      patient: formatCitizen(citizen),
    });
  } catch (error) {
    console.error('Get patient error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve patient record', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const updates = await request.json();

    const allowedFields = [
      'fullName',
      'bloodGroup',
      'age',
      'address',
      'phoneNumber',
      'allergies',
      'medications',
      'chronicConditions',
      'specialInstructions',
      'isDnr',
      'emergencyContacts',
      'insuranceCompany',
      'insurancePolicyNumber',
      'isBloodDonor',
      'donorRadiusKm',
      'lifeCredits',
    ];

    const cleanUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    }

    const updatedCitizen = await Citizen.findOneAndUpdate(
      { profileId: id },
      { $set: cleanUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedCitizen) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Patient profile updated successfully',
      patient: formatCitizen(updatedCitizen),
    });
  } catch (error) {
    console.error('Update patient error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update patient profile', error: error.message },
      { status: 500 }
    );
  }
}
