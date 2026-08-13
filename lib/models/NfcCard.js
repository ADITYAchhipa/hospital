import mongoose from 'mongoose';

const NfcCardSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Citizen',
      required: true,
    },
    rawToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    hashedToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    publicCardId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'revoked', 'lost'],
      default: 'active',
    },
    issuedByHospitalId: {
      type: String,
      default: 'HOSP-001',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.NfcCard || mongoose.model('NfcCard', NfcCardSchema);
