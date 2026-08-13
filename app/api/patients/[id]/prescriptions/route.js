import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Citizen from '@/lib/models/Citizen';

export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    let citizen = await Citizen.findOne({ profileId: id });
    if (!citizen && id) {
      citizen = await Citizen.findOne({
        profileId: { $regex: new RegExp(`^${id.trim()}$`, 'i') },
      });
    }
    if (!citizen && id && id.match(/^[0-9a-fA-F]{24}$/)) {
      citizen = await Citizen.findById(id);
    }
    if (!citizen) {
      return NextResponse.json(
        { success: false, message: 'Patient profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      doctorName,
      qualification = 'MBBS, MD',
      hospitalName,
      date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      diagnosis,
      doctorNotes = '',
      status = 'Active',
      doctorPhoto = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=150',
      validUntil = '',
      testsRecommended = [],
      isFavorite = false,
      rxList = [],
      pdfUrl = '',
    } = body;

    if (!doctorName || !hospitalName || !diagnosis || !rxList || rxList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Doctor name, hospital name, diagnosis, and at least one medicine in Rx list are required',
        },
        { status: 400 }
      );
    }

    const formattedRxList = rxList.map((item) => ({
      medicineName: item.medicineName || item.name || 'Medicine',
      dosage: item.dosage || item.strength || '1 Dose',
      frequency: item.frequency || 'Once Daily',
      duration: item.duration || '5 Days',
      instructions: item.instructions || 'Take as advised',
      morning: Boolean(item.morning),
      afternoon: Boolean(item.afternoon),
      night: Boolean(item.night),
      beforeFood: Boolean(item.beforeFood),
      afterFood: Boolean(item.afterFood ?? true),
      quantity: item.quantity || '10 Units',
      purpose: item.purpose || '',
      sideEffects: item.sideEffects || '',
      storage: item.storage || 'Room temperature',
      alternatives: item.alternatives || '',
      isTakenToday: false,
    }));

    const newPrescription = {
      prescriptionId: `RX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      doctorName,
      qualification,
      hospitalName,
      date,
      diagnosis,
      doctorNotes,
      pdfUrl,
      status,
      doctorPhoto,
      validUntil: validUntil || date,
      testsRecommended: Array.isArray(testsRecommended) ? testsRecommended : [],
      isFavorite: Boolean(isFavorite),
      rxList: formattedRxList,
    };

    citizen.prescriptions.unshift(newPrescription);
    await citizen.save();

    console.log(`💊 [Web Portal] Prescription added for ${citizen.fullName} (${citizen.profileId})`);

    return NextResponse.json({
      success: true,
      message: 'Prescription added and linked to patient record successfully',
      prescription: newPrescription,
      totalPrescriptions: citizen.prescriptions.length,
    });
  } catch (error) {
    console.error('Add prescription error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add prescription', error: error.message },
      { status: 500 }
    );
  }
}
