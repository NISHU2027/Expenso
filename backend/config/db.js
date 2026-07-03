import mongoose from 'mongoose';

export const connectDB = async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI is not set.");
    }

    if (/[<>]/.test(uri)) {
        throw new Error("MONGODB_URI contains angle brackets. Remove placeholder brackets and URL-encode special characters in the username/password.");
    }

    await mongoose.connect(uri);
    console.log("DB Connected");
}
