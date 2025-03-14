import app from './app.js';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

const server = app.listen(PORT, () => {
  console.log(`🚀 CQuizy API is running on http://localhost:${PORT}`);
});

const gracefulShutdown = (signal) => {
  console.log(`${signal} signal received: closing HTTP server`);

  server.close(() => {
    console.log("HTTP server closed");

    mongoose.connection
      .close(false)
      .then(() => {
        console.log("MongoDB connection closed");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      });

    setTimeout(() => {
      console.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 10000);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));