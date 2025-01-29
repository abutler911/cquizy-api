import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import questionRoutes from "./routes/questions.js";

dotenv.config();

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to the DB..."))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
app.use("/api/questions", questionRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the CQuizy API");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`CQuizy API is running on http://localhost:${PORT}`);
});
