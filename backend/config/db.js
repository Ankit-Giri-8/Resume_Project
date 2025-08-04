import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://23ucc514:ankit123@cluster0.anxuht3.mongodb.net/RESUME')
    .then(() => {console.log("MongoDB connected successfully");})
};
