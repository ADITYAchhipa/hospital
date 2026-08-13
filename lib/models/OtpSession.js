import mongoose from 'mongoose';

const OtpSessionSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    otp: { type: String, required: true },
    purpose: { type: String, default: 'hospital_login' },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

OtpSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OtpSession || mongoose.model('OtpSession', OtpSessionSchema);
