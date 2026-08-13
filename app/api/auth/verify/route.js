import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import Hospital from '@/lib/models/Hospital';
import OtpSession from '@/lib/models/OtpSession';

const JWT_SECRET = process.env.JWT_SECRET || 'swasthyatap_secret_key_2025_secure';

const formatE164 = (phone) => {
  if (!phone) return '';
  let cleaned = String(phone).trim();
  const digits = cleaned.replace(/\D/g, '');
  if (cleaned.startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+91${digits.slice(-10)}`;
};

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { hospitalId, otp, personnelId } = body;

    if (!hospitalId || !otp) {
      return NextResponse.json(
        { success: false, message: 'Hospital ID and OTP are required' },
        { status: 400 }
      );
    }

    const cleanId = String(hospitalId).trim();
    const hospital = await Hospital.findOne({
      hospitalId: { $regex: new RegExp(`^${cleanId}$`, 'i') },
    });

    if (!hospital) {
      return NextResponse.json(
        { success: false, message: 'Hospital not found in database' },
        { status: 404 }
      );
    }

    const rawPhone = hospital.registeredPhone || hospital.phone;
    const formattedPhone = formatE164(rawPhone);
    const cleanPhone = formattedPhone.replace(/\D/g, '').slice(-10);

    let isOtpValid = false;

    // Check database OTP session
    const session = await OtpSession.findOne({
      phone: cleanPhone,
      purpose: 'hospital_login',
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (session && (session.otp === String(otp).trim() || otp === '1234' || otp === '9999')) {
      isOtpValid = true;
      session.used = true;
      await session.save();
    } else if (otp === '1234' || otp === '9999') {
      // Dev bypass fallback
      isOtpValid = true;
    }

    if (!isOtpValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP code' },
        { status: 401 }
      );
    }

    // Identify personnel
    let activePersonnel = null;
    if (personnelId && hospital.authorizedPersonnel && hospital.authorizedPersonnel.length > 0) {
      activePersonnel = hospital.authorizedPersonnel.find((p) => p.personnelId === personnelId);
    }

    if (!activePersonnel) {
      activePersonnel = hospital.authorizedPersonnel?.[0] || {
        personnelId: 'STAFF-001',
        name: 'Authorized Clinical Staff',
        designation: 'Duty Officer',
      };
    }

    // Create JWT
    const token = jwt.sign(
      {
        hospitalId: hospital.hospitalId,
        hospitalName: hospital.name,
        personnelId: activePersonnel.personnelId,
        personnelName: activePersonnel.name,
        role: 'hospital',
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const hospitalData = {
      hospitalId: hospital.hospitalId,
      name: hospital.name,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      lat: hospital.lat,
      lng: hospital.lng,
      specialties: hospital.specialties || [],
      badges: hospital.badges || [],
      bedCount: hospital.bedCount || 0,
      phone: hospital.phone,
      rating: hospital.rating,
      isVerified: hospital.isVerified,
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      hospital: hospitalData,
      personnel: activePersonnel,
    });
  } catch (error) {
    console.error('Hospital verify error:', error);
    return NextResponse.json(
      { success: false, message: 'Hospital verification failed', error: error.message },
      { status: 500 }
    );
  }
}
