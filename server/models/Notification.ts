import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: 'report_status' | 'dispute_update' | 'admin_alert' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['report_status', 'dispute_update', 'admin_alert', 'system'],
      default: 'system',
    },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
