import mongoose from "mongoose";
import { logger } from "./logger.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB...");
    return mongoose.connection;
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    logger.error("MongoDB connection error", { error: err.message, stack: err.stack });
    process.exit(1);
  }
};

export const getConnectionStatus = () => {
  return {
    status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    name: mongoose.connection.name || "unknown",
  };
};