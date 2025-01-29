import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, required: true },
  context: { type: String, required: true },
  questionNumber: { type: Number, required: true },
});

const Question = mongoose.model("Question", questionSchema);

export default Question;
