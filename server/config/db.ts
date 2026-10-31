import mongoose from 'mongoose';
import { inAppDB } from '../services/mockDatabase.ts';

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Database] No MONGODB_URI found in environment. Using in-memory persistent data store.');
    return false;
  }

  try {
    console.log('[Database] Connecting to MongoDB Atlas cluster...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      dbName: 'scamalert_bd',
    });
    console.log('[Database] MongoDB Atlas connected successfully to database: scamalert_bd');
    await inAppDB.syncWithMongoDB();
    return true;
  } catch (err: any) {
    console.warn('[Database] MongoDB connection notice:', err.message, 'Falling back to in-memory store.');
    return false;
  }
}

