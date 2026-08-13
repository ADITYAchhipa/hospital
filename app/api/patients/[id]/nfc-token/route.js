import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import Citizen from '@/lib/models/Citizen';
import NfcCard from '@/lib/models/NfcCard';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const citizen = await Citizen.findOne({ profileId: id });
    if (!citizen) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }

    let card = await NfcCard.findOne({ patientId: citizen._id, status: 'active' });

    if (!card || !card.rawToken) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const publicCardId = `card-${citizen.profileId}-${Date.now()}`;

      if (card) {
        card.rawToken = rawToken;
        card.hashedToken = hashedToken;
        await card.save();
      } else {
        card = await NfcCard.create({
          patientId: citizen._id,
          rawToken,
          hashedToken,
          publicCardId,
          status: 'active',
        });
      }
    }

    const nfcUrl = `https://www.nfc.swasthyatap.in/card/${card.rawToken}`;

    return NextResponse.json({
      success: true,
      nfcUrl,
      rawToken: card.rawToken,
      patientName: citizen.fullName,
      swasthyaId: citizen.profileId,
      bloodGroup: citizen.bloodGroup,
    });
  } catch (error) {
    console.error('NFC token generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate NFC token', error: error.message },
      { status: 500 }
    );
  }
}
