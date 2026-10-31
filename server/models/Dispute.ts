import mongoose, { Schema, Document } from 'mongoose';

export type DisputeStatus = 'pending' | 'under_review' | 'resolved_upheld' | 'resolved_removed';

export interface IDispute extends Document {
  disputeId: string;
  reportId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  claimantRole: string; // 'seller', 'owner', 'representative', 'accused_party'
  reason: string;
  details: string;
  supportingEvidence: Array<{
    id: string;
    originalFilename: string;
    fileUrl: string;
  }>;
  status: DisputeStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    disputeId: { type: String, required: true, unique: true },
    reportId: { type: String, required: true, index: true },
    claimantName: { type: String, required: true },
    claimantEmail: { type: String, required: true },
    claimantPhone: { type: String, required: true },
    claimantRole: { type: String, default: 'seller' },
    reason: { type: String, required: true },
    details: { type: String, required: true },
    supportingEvidence: [
      {
        id: String,
        originalFilename: String,
        fileUrl: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved_upheld', 'resolved_removed'],
      default: 'pending',
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export const DisputeModel =
  mongoose.models.Dispute || mongoose.model<IDispute>('Dispute', DisputeSchema);
