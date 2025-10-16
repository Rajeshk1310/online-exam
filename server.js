const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/onlineexam", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Question schema
const questionSchema = new mongoose.Schema({
  question: String,
  options: [String]
});

// Model (collection name: questions)
const Question = mongoose.model("Question", questionSchema, "questions");

// Submission schema
const submissionSchema = new mongoose.Schema({
  studentName: String,
  answers: mongoose.Schema.Types.Mixed,
  submittedAt: { type: Date, default: Date.now }
});

// Model (collection name: submissions)
const Submission = mongoose.model("Submission", submissionSchema, "submissions");

// API to fetch questions
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// API to submit answers
app.post("/api/submit", async (req, res) => {
  try {
    const { studentName, answers } = req.body;
    const submission = new Submission({ studentName, answers });
    await submission.save();
    res.json({ status: "success", message: "Submission saved!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Submission failed" });
  }
});

// Start server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
