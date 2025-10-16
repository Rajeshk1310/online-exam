// server.js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
const mongoURI = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/onlineexam";
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection failed:", err));

// Question schema & model
const questionSchema = new mongoose.Schema({
  question: String,
  options: [String]
});
const Question = mongoose.model("Question", questionSchema, "questions");

// Submission schema & model
const submissionSchema = new mongoose.Schema({
  studentName: String,
  answers: mongoose.Schema.Types.Mixed,
  submittedAt: { type: Date, default: Date.now }
});
const Submission = mongoose.model("Submission", submissionSchema, "submissions");

// API: fetch all questions
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// API: submit answers
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

// Start server using Render-assigned port
const PORT = process.env.PORT || 10000;  // ✅ use Render-assigned port if available
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


