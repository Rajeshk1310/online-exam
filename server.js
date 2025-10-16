const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// ✅ MongoDB connection (use Atlas URL from environment variable)
const mongoURI = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/onlineexam";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// 🧩 Question Schema
const questionSchema = new mongoose.Schema({
  question: String,
  options: [String]
});

// Model (collection: questions)
const Question = mongoose.model("Question", questionSchema, "questions");

// 🧩 Submission Schema
const submissionSchema = new mongoose.Schema({
  studentName: String,
  answers: mongoose.Schema.Types.Mixed,
  submittedAt: { type: Date, default: Date.now }
});

// Model (collection: submissions)
const Submission = mongoose.model("Submission", submissionSchema, "submissions");

// 🧠 API: Fetch questions
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    if (!questions.length) {
      return res.status(404).json({ message: "No questions found in database" });
    }
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// 📝 API: Submit answers
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

// 🌍 Serve index.html for all routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🚀 Start server on Render-assigned port or 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
