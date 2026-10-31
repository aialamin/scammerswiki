import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  adminId: string;
  adminName: string;
  action: string;
  targetId: string;
  targetType: 'report' | 'user' | 'dispute' | 'system';
  description: string;
  previousState?: any;
  newState?: any;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: String, required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true },
    targetId: { type: String, required: true },
    targetType: {
      type: String,
      enum: ['report', 'user', 'dispute', 'system'],
      required: true,
    },
    description: { type: String, required: true },
    previousState: { type: Schema.Types.Mixed },
    newState: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
