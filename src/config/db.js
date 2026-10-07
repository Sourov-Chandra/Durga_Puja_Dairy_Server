import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    if (ENV.NODE_ENV === "production") {
      process.exit(1);
    } else {
      console.log("⚠️ Running in development mode without active MongoDB. Please configure MONGODB_URI in server/.env (e.g. MongoDB Atlas cluster).");
    }
  }
};
