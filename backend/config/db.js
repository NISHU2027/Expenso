import mongoose from 'mongoose';

export const connectDB = async () => {
    await mongoose.connect("mongodb+srv://alokgiri1926_db_user:Alok8578@cluster0.xu6bfhv.mongodb.net/Expense")
        .then(() => console.log("DB Connected"))
}