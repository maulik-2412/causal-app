import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();
let isConnected = false; 


export const connectDB = async () => {
  if (isConnected) {
    console.log("⚡ Using existing MongoDB connection");
    return mongoose.connection; 
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
