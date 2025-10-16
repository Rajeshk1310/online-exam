let questions = [];
let currentIndex = 0;
const answers = {};
const totalTime = 3600; // 60 minutes = 3600 seconds
let timeLeft = totalTime;
let timerInterval;

const startBtn = document.getElementById("startBtn");
const nameSection = document.getElementById("nameSection");
const questionSection = document.getElementById("questionSection");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressCircle = document.querySelector("#timer .progress");
const timerText = document.getElementById("timerText");
const questionNav = document.getElementById("questionNav");
const totalQuestionsText = document.getElementById("totalQuestions");

startBtn.addEventListener("click", async () => {
  const studentName = document.getElementById("studentName").value.trim();
  if (!studentName) { alert("Please enter your name"); return; }

  nameSection.style.display = "none";
  questionSection.style.display = "block";

  await loadQuestions();
  totalQuestionsText.textContent = `Total Questions: ${questions.length}`;
  createQuestionNav();
  showQuestion();
  startTimer();
});

async function loadQuestions() {
  const res = await fetch("/api/questions");
  questions = await res.json();
  if (questions.length === 0) {
    document.getElementById("questionContainer").innerHTML = "<p>No questions available.</p>";
    nextBtn.style.display = "none";
    prevBtn.style.display = "none";
  }
}

function startTimer() {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = 0;

  updateTimerDisplay(); // initialize timer display to 60:00

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    const ratio = timeLeft / totalTime;
    progressCircle.style.stroke = ratio > 0.5 ? "green" : ratio > 0.2 ? "orange" : "red";
    progressCircle.style.strokeDashoffset = circumference * (1 - ratio);

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Time's up! Submitting...");
      submitExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerText.textContent = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
}

function showQuestion() {
  if (questions.length === 0) return;

  const container = document.getElementById("questionContainer");
  container.innerHTML = "";

  const q = questions[currentIndex];
  const div = document.createElement("div");
  div.className = "question-card";

  const prevAnswer = answers[q._id] || "";
  div.innerHTML = `<p>Q${currentIndex + 1}: ${q.question}</p>`;
  q.options.forEach(opt => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = q._id;
    input.value = opt;
    if (prevAnswer === opt) input.checked = true;
    label.appendChild(input);
    label.append(` ${opt}`);
    div.appendChild(label);
  });

  container.appendChild(div);

  prevBtn.style.display = currentIndex === 0 ? "none" : "inline-block";
  nextBtn.textContent = currentIndex === questions.length - 1 ? "Submit" : "Next";
  nextBtn.style.display = "inline-block";

  document.getElementById("progress").style.width = ((currentIndex) / questions.length) * 100 + "%";

  updateQuestionNav();
}

nextBtn.addEventListener("click", () => {
  const selected = document.querySelector("input[type=radio]:checked");
  if (!selected) { alert("Please select an option"); return; }
  answers[selected.name] = selected.value;

  if (currentIndex < questions.length - 1) {
    currentIndex++;
    showQuestion();
  } else submitExam();
});

prevBtn.addEventListener("click", () => {
  if (currentIndex === 0) return;
  const selected = document.querySelector("input[type=radio]:checked");
  if (selected) answers[selected.name] = selected.value;
  currentIndex--;
  showQuestion();
});

function createQuestionNav() {
  questionNav.innerHTML = "";
  questions.forEach((q, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.className = "unanswered";
    btn.addEventListener("click", () => {
      const selected = document.querySelector("input[type=radio]:checked");
      if (selected) answers[selected.name] = selected.value;
      currentIndex = i;
      showQuestion();
    });
    questionNav.appendChild(btn);
  });
}

function updateQuestionNav() {
  const buttons = questionNav.querySelectorAll("button");
  buttons.forEach((btn, i) => {
    btn.className = answers[questions[i]._id] ? "answered" : "unanswered";
  });
}

async function submitExam() {
  clearInterval(timerInterval);
  const studentName = document.getElementById("studentName").value;
  try {
    await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentName, answers })
    });
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });

    const container = document.querySelector(".main");
    container.innerHTML = `
      <h1>Thank You!</h1>
      <p style="text-align:center; font-size:18px; margin-top:20px;">
        Your result will be Publish On or After 20th Dec 2025.
      </p>
    `;
  } catch (err) {
    alert("Submission failed: " + err.message);
  }
}
