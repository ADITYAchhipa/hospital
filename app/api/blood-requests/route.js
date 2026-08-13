import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BloodRequest from '@/lib/models/BloodRequest';
import Citizen from '@/lib/models/Citizen';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const requests = await BloodRequest.find({}).sort({ createdAt: -1 }).limit(30);
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Fetch blood requests error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blood requests', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const {
      requesterHospitalId = 'HOSP-001',
      hospitalName = 'Bangalore Government Medical College & Hospital',
      bloodGroup,
      unitsNeeded = 2,
      urgencyLevel = 'Critical',
      locationLat = 12.9636,
      locationLng = 77.5843,
      contactPhone = '+91 80 2699 5000',
    } = body;

    if (!bloodGroup || !unitsNeeded) {
      return NextResponse.json(
        { success: false, message: 'Blood group and units needed are required' },
        { status: 400 }
      );
    }

    // Match potential nearby blood donors
    const matchedCitizens = await Citizen.find({
      isBloodDonor: true,
      bloodGroup: { $in: [bloodGroup, 'O-', 'O+'] },
    }).limit(20);

    const matchedDonors = matchedCitizens.map((c) => ({
      citizenId: c.profileId,
      notifiedAt: new Date(),
      responded: false,
      responseStatus: 'Pending',
    }));

    const newRequest = await BloodRequest.create({
      requestId: `BLD-REQ-${Date.now().toString().slice(-6)}`,
      requesterHospitalId,
      hospitalName,
      bloodGroup,
      unitsNeeded: Number(unitsNeeded),
      urgencyLevel,
      locationLat: Number(locationLat),
      locationLng: Number(locationLng),
      contactPhone,
      status: 'Open',
      notifiedDonorsCount: matchedDonors.length,
      matchedDonors,
    });

    return NextResponse.json({
      success: true,
      message: `Emergency broadcast initiated to ${matchedDonors.length} matching donors`,
      bloodRequest: newRequest,
    });
  } catch (error) {
    console.error('Create blood request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initiate blood emergency', error: error.message },
      { status: 500 }
    );
  }
}
