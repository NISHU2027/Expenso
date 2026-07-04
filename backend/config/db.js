import mongoose from 'mongoose';

export async function connectToMongoDB() {
  try {
    await mongoose.connect("mongodb+srv://alokgiri1926_db_user:mGGijnS35BNLrKHR@cluster0.xu6bfhv.mongodb.net/Tracker Expense");
    console.log("You successfully connected to MongoDB!");
    return mongoose;
  } catch (err) {
    console.dir(err);
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  await mongoose.connection.close();
}