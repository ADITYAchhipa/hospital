import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Hospital from '@/lib/models/Hospital';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const hospitals = await Hospital.find({}, {
      hospitalId: 1,
      name: 1,
      address: 1,
      city: 1,
      state: 1,
      registeredPhone: 1,
      phone: 1,
      rating: 1,
      specialties: 1,
      bedCount: 1,
      authorizedPersonnel: 1,
      isVerified: 1,
    }).sort({ name: 1 });

    return NextResponse.json({ success: true, hospitals });
  } catch (error) {
    console.error('Fetch hospitals error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hospitals', error: error.message },
      { status: 500 }
    );
  }
}
