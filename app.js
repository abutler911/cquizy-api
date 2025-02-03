import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import questionRoutes from "./routes/questions.js";
import bodyParser from "body-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import winston from "winston";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "https://cquizy.com",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
];

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after an hour!",
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

app.use("/api", apiLimiter);
app.use(helmet());

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB..."))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

// Routes
app.use("/api/questions", questionRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the CQuizy API");
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 CQuizy API is running on http://localhost:${PORT}`);
});
