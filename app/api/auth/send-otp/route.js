import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Hospital from '@/lib/models/Hospital';
import OtpSession from '@/lib/models/OtpSession';

const formatE164 = (phone) => {
  if (!phone) return '';
  let cleaned = String(phone).trim();
  const digits = cleaned.replace(/\D/g, '');
  if (cleaned.startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+91${digits.slice(-10)}`;
};

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { hospitalId } = body;

    if (!hospitalId || !String(hospitalId).trim()) {
      return NextResponse.json(
        { success: false, message: 'Hospital ID is required' },
        { status: 400 }
      );
    }

    const cleanId = String(hospitalId).trim();

    // Check if Hospital ID exists in Database
    const hospital = await Hospital.findOne({
      hospitalId: { $regex: new RegExp(`^${cleanId}$`, 'i') },
    });

    if (!hospital) {
      return NextResponse.json(
        { success: false, message: `Hospital ID '${cleanId}' not found in database` },
        { status: 404 }
      );
    }

    const rawPhone = hospital.registeredPhone || hospital.phone;
    if (!rawPhone) {
      return NextResponse.json(
        { success: false, message: 'No registered phone number configured for this hospital' },
        { status: 400 }
      );
    }

    const formattedPhone = formatE164(rawPhone);
    const cleanPhone = formattedPhone.replace(/\D/g, '').slice(-10);

    await OtpSession.deleteMany({ phone: cleanPhone, purpose: 'hospital_login' });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpSession.create({
      phone: cleanPhone,
      otp,
      purpose: 'hospital_login',
      expiresAt,
    });

    const maskedPhone = `XXXXXXX${cleanPhone.slice(-3)}`;
    const isProductionOtp = process.env.PRODUCTION_OTP === 'true';

    if (isProductionOtp) {
      // Production mode: Send actual SMS via Twilio
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromPhone = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromPhone) {
        console.error('⚠️ Twilio credentials missing despite PRODUCTION_OTP=true');
        return NextResponse.json(
          { success: false, message: 'Twilio credentials not configured on server' },
          { status: 500 }
        );
      }

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', formattedPhone);
      params.append('From', fromPhone);
      params.append('Body', `Your Swasthya Hospital Portal OTP is ${otp}. Valid for 5 minutes.`);

      const twilioRes = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const twilioData = await twilioRes.json();
      if (!twilioRes.ok) {
        console.error('❌ [Twilio SMS Failed]', twilioData);
        return NextResponse.json(
          { success: false, message: `Failed to send SMS via Twilio: ${twilioData.message || 'Twilio Error'}` },
          { status: 500 }
        );
      }

      console.log(`✅ [Twilio SMS Sent] Message SID: ${twilioData.sid} to ${formattedPhone}`);

      return NextResponse.json({
        success: true,
        message: `OTP sent via SMS to registered mobile (${maskedPhone}) for ${hospital.name}`,
        hospitalName: hospital.name,
        maskedPhone,
      });
    } else {
      // Development mode (PRODUCTION_OTP=false):
      // Return devOtp so frontend can auto-fill for developer convenience
      console.log(`🏥 [Dev Mode OTP] ${hospital.name} (${formattedPhone}): ${otp}`);

      // Optional attempt to send via Twilio if configured, ignoring errors in dev mode
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const accountSid = process.env.TWILIO_ACCOUNT_SID;
          const authToken = process.env.TWILIO_AUTH_TOKEN;
          const fromPhone = process.env.TWILIO_PHONE_NUMBER;
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
          const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
          const params = new URLSearchParams();
          params.append('To', formattedPhone);
          params.append('From', fromPhone);
          params.append('Body', `Your Swasthya Hospital Portal OTP is ${otp}. Valid for 5 minutes.`);

          fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          }).catch((err) => console.log('Dev mode background Twilio log:', err.message));
        } catch (e) {
          // Ignore error in dev mode
        }
      }

      return NextResponse.json({
        success: true,
        message: `OTP generated successfully for ${hospital.name}`,
        hospitalName: hospital.name,
        maskedPhone,
        devOtp: otp,
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process OTP request', error: error.message },
      { status: 500 }
    );
  }
}
