import mongoose, { Schema, Document } from 'mongoose';

export type ReportCategory =
  | 'phone'
  | 'whatsapp'
  | 'facebook'
  | 'website'
  | 'bkash'
  | 'nagad'
  | 'rocket'
  | 'other';

export type ReportStatus =
  | 'pending_review'
  | 'under_review'
  | 'verified_incident'
  | 'disputed'
  | 'rejected';

export interface IEvidenceFile {
  id: string;
  originalFilename: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: Date;
}

export interface IReportIdentifiers {
  phone?: string;
  whatsapp?: string;
  facebookPageName?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  normalizedSearchTokens: string[];
}

export interface IReport extends Document {
  reportId: string;
  submittedBy: {
    userId?: string;
    name: string;
    email: string;
    isAnonymous?: boolean;
  };
  category: ReportCategory;
  identifiers: IReportIdentifiers;
  productOrService: string;
  transactionAmount: number;
  transactionDate: Date;
  paymentMethod: string;
  transactionReference?: string;
  incidentDescription: string;
  evidenceFiles: IEvidenceFile[];
  status: ReportStatus;
  reviewNotes?: string;
  rejectionReason?: string;
  corroboratingCount: number;
  disputeCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reportId: { type: String, required: true, unique: true, index: true },
    submittedBy: {
      userId: { type: String },
      name: { type: String, required: true },
      email: { type: String, required: true },
      isAnonymous: { type: Boolean, default: false },
    },
    category: {
      type: String,
      required: true,
      enum: ['phone', 'whatsapp', 'facebook', 'website', 'bkash', 'nagad', 'rocket', 'other'],
      index: true,
    },
    identifiers: {
      phone: { type: String },
      whatsapp: { type: String },
      facebookPageName: { type: String },
      facebookUrl: { type: String },
      websiteUrl: { type: String },
      bkashNumber: { type: String },
      nagadNumber: { type: String },
      rocketNumber: { type: String },
      normalizedSearchTokens: [{ type: String, index: true }],
    },
    productOrService: { type: String, required: true },
    transactionAmount: { type: Number, required: true, default: 0 },
    transactionDate: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    transactionReference: { type: String },
    incidentDescription: { type: String, required: true },
    evidenceFiles: [
      {
        id: { type: String, required: true },
        originalFilename: { type: String, required: true },
        storageKey: { type: String, required: true },
        mimeType: { type: String, required: true },
        fileSize: { type: Number, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ['pending_review', 'under_review', 'verified_incident', 'disputed', 'rejected'],
      default: 'pending_review',
      index: true,
    },
    reviewNotes: { type: String },
    rejectionReason: { type: String },
    corroboratingCount: { type: Number, default: 1 },
    disputeCount: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Search indexes
ReportSchema.index({ 'identifiers.normalizedSearchTokens': 1 });
ReportSchema.index({ status: 1, createdAt: -1 });

export const ReportModel = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
