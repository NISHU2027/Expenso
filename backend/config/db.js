import mongoose from 'mongoose';

const isDbAuthError = (err) =>
  err?.code === 8000 ||
  err?.codeName === 'AtlasError' ||
  /bad auth|authentication failed/i.test(err?.message ?? '');

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    throw new Error('Missing required environment variable: MONGODB_URI');
  }

  try {
    await mongoose.connect(uri.trim(), {
      autoIndex: false,
      serverSelectionTimeoutMS: 10000,
    });

    console.log('DB CONNECTED');
  } catch (err) {
    console.error('DB CONNECTION ERROR', err);

    if (isDbAuthError(err)) {
      throw new Error(
        'MongoDB authentication failed. Check MONGODB_URI username, password, and URL-encoding.'
      );
    }

    throw err;
  }
};
