import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Citizen from '@/lib/models/Citizen';

// GET /api/patients/:id/reports — List all reports for a patient
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
    if (!citizen && id && id.match(/^[0-9a-fA-F]{24}$/)) {
      citizen = await Citizen.findById(id);
    }
    if (!citizen) {
      return NextResponse.json(
        { success: false, message: 'Patient profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      swasthyaId: citizen.profileId,
      fullName: citizen.fullName,
      totalReports: citizen.medicalReports.length,
      reports: (citizen.medicalReports || []).map((r) => ({
        id: r._id?.toString() || r.referenceId,
        name: r.name,
        url: r.url,
        title_key: r.title_key,
        issuer_key: r.issuer_key,
        date: r.date,
        department: r.department,
        category: r.category,
        doctor_key: r.doctor_key,
        isAbnormal: r.isAbnormal,
        isFavorite: r.isFavorite,
        fileType: r.fileType,
        fileSize: r.fileSize,
        notes: r.notes,
        tags: r.tags,
        referenceId: r.referenceId,
        uploadedAt: r.uploadedAt,
        uploadedBy: r.uploadedBy,
      })),
    });
  } catch (error) {
    console.error('List reports error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list reports', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/patients/:id/reports — Upload a new report for a patient
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
      title_key,
      issuer_key,
      date,
      status_key = 'verified_report',
      doctor_key = '',
      department = 'General Medicine',
      bloodGroup = citizen.bloodGroup,
      tags = [],
      category = 'Blood Tests',
      uploadedBy = '',
      fileType = 'PDF',
      notes = '',
      isAbnormal = false,
      isFavorite = false,
      fileSize = '1.4 MB',
      referenceId = `REF-${Date.now()}`,
      version = '1.0.0',
      sampleType = '',
      labRefNo = `LAB-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorRemarks = '',
      testParameters = [],
      fileUrl = '',
      url = '',
      fileName = '',
    } = body;

    if (!title_key || !issuer_key || !date) {
      return NextResponse.json(
        { success: false, message: 'Report title, issuer lab/hospital, and date are required' },
        { status: 400 }
      );
    }

    const newReport = {
      name: fileName || `${title_key.replace(/\s+/g, '_')}_${Date.now()}.${fileType.toLowerCase() === 'pdf' ? 'pdf' : 'jpg'}`,
      url: url || fileUrl || 'https://res.cloudinary.com/demo/image/upload/v1570530932/sample.jpg',
      uploadedAt: new Date(),
      title_key,
      issuer_key,
      date,
      status_key,
      doctor_key,
      department,
      bloodGroup: bloodGroup || citizen.bloodGroup,
      tags: Array.isArray(tags) ? tags : [category || 'Lab Report'],
      category,
      uploadedBy: uploadedBy || issuer_key,
      fileType: fileType.toUpperCase(),
      notes: notes || doctorRemarks || 'Diagnostic lab report',
      isAbnormal: Boolean(isAbnormal),
      isFavorite: Boolean(isFavorite),
      fileSize,
      referenceId,
      version,
      sampleType,
      labRefNo,
      doctorRemarks,
      testParameters: Array.isArray(testParameters) ? testParameters : [],
    };

    citizen.medicalReports.unshift(newReport);
    await citizen.save();

    console.log(`📄 [Web Portal] Medical report added for ${citizen.fullName} (${citizen.profileId})`);

    return NextResponse.json({
      success: true,
      message: 'Medical report uploaded and attached successfully',
      report: newReport,
      totalReports: citizen.medicalReports.length,
    });
  } catch (error) {
    console.error('Upload report error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload report', error: error.message },
      { status: 500 }
    );
  }
}
