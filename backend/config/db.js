import mongoose from 'mongoose';

export const connectDB = async () => {
  await mongoose.connect("mongodb+srv://alokgiri1926_db_user:mGGijnS35BNLrKHR@cluster0.xu6bfhv.mongodb.net/Expense");
    try {
      await mongoose.connect(
        "mongodb+srv://alokgiri1926_db_user:mGGijnS35BNLrKHR@cluster0.xu6bfhv.mongodb.net/Expense",
        { useNewUrlParser: true, useUnifiedTopology: true }
      );
      console.log("DB CONNECTED");
    } catch (err) {
      console.error("DB CONNECTION ERROR", err);
      process.exit(1);
    }
};

