import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect("mongodb+srv://alokgiri8578_db_user:vaG3fPUOlU5TqKh9@cluster0.jmrxvrh.mongodb.net/Expenso")
    .then(() => console.log("DB connected"));
};


