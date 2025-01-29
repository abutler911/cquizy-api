import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import Question from "./models/questions.js";

dotenv.config();

const filePath = "./questions.json";

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB..."))
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err);
    process.exit(1);
  });

// Read JSON file and insert without duplicates
const importQuestions = async () => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const questions = JSON.parse(data);

    if (!Array.isArray(questions)) {
      throw new Error("JSON data is not an array.");
    }

    let insertedCount = 0;
    for (const question of questions) {
      const exists = await Question.findOne({ question: question.question });
      if (!exists) {
        await Question.create(question);
        insertedCount++;
      }
    }

    console.log(`✅ Successfully inserted ${insertedCount} new questions!`);
  } catch (error) {
    console.error("❌ Error importing data:", error);
  } finally {
    mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
  }
};

// Run import function
importQuestions();
