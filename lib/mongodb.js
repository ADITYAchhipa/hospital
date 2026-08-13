import mongoose from 'mongoose';

const rawUri = process.env.MONGO_URI || 'mongodb+srv://adichhipa2_db_user:Oo2WWuEiChjI7Ab8@swasthyatap.abo8hz9.mongodb.net/swasthyatap?appName=swasthyatap';
const MONGO_URI = rawUri.trim().replace(/^["']|["']$/g, '');

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongooseInstance) => {
      console.log('✅ Connected to MongoDB (SwasthyaTap Shared DB)');
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      console.error('❌ MongoDB Connection Error:', err);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
