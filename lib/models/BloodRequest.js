import mongoose from 'mongoose';

const BloodRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    requesterHospitalId: { type: String, required: true },
    hospitalName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    unitsNeeded: { type: Number, required: true, min: 1 },
    urgencyLevel: {
      type: String,
      enum: ['Critical', 'High', 'Moderate', 'Routine'],
      default: 'Critical',
    },
    locationLat: { type: Number, required: true },
    locationLng: { type: Number, required: true },
    contactPhone: { type: String, required: true },
    status: {
      type: String,
      enum: ['Open', 'Fulfilled', 'Cancelled'],
      default: 'Open',
    },
    notifiedDonorsCount: { type: Number, default: 0 },
    matchedDonors: [
      {
        citizenId: String,
        notifiedAt: { type: Date, default: Date.now },
        responded: { type: Boolean, default: false },
        responseStatus: { type: String, enum: ['Accepted', 'Declined', 'Pending'], default: 'Pending' },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.BloodRequest || mongoose.model('BloodRequest', BloodRequestSchema);
