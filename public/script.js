let questions = [];
let currentIndex = 0;
const answers = {};
const totalTime = 600; // 10 minutes
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

  timerInterval = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerText.textContent = `${minutes}:${seconds < 10 ? "0"+seconds : seconds}`;
    const ratio = timeLeft / totalTime;
    progressCircle.style.stroke = ratio>0.5?"green":ratio>0.2?"orange":"red";
    progressCircle.style.strokeDashoffset = circumference*(1-ratio);

    if(timeLeft<=0){
      clearInterval(timerInterval);
      alert("Time's up! Submitting...");
      submitExam();
    }
  },1000);
}

function showQuestion() {
  if(questions.length === 0) return;

  const container = document.getElementById("questionContainer");
  container.innerHTML = "";

  const q = questions[currentIndex];
  const div = document.createElement("div");
  div.className = "question-card";

  const prevAnswer = answers[q._id] || "";
  div.innerHTML = `<p>Q${currentIndex+1}: ${q.question}</p>`;
  q.options.forEach(opt => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = q._id;
    input.value = opt;
    if(prevAnswer === opt) input.checked = true;
    label.appendChild(input);
    label.append(` ${opt}`);
    div.appendChild(label);
  });

  container.appendChild(div);

  prevBtn.style.display = currentIndex === 0 ? "none" : "inline-block";
  nextBtn.textContent = currentIndex === questions.length - 1 ? "Submit" : "Next";
  nextBtn.style.display = "inline-block";

  document.getElementById("progress").style.width = ((currentIndex)/questions.length)*100+"%";

  updateQuestionNav();
}

nextBtn.addEventListener("click", () => {
  const selected = document.querySelector("input[type=radio]:checked");
  if(!selected){ alert("Please select an option"); return; }
  answers[selected.name] = selected.value;

  if(currentIndex < questions.length-1){
    currentIndex++;
    showQuestion();
  } else submitExam();
});

prevBtn.addEventListener("click", () => {
  if(currentIndex === 0) return;
  const selected = document.querySelector("input[type=radio]:checked");
  if(selected) answers[selected.name] = selected.value;
  currentIndex--;
  showQuestion();
});

function createQuestionNav() {
  questionNav.innerHTML = "";
  questions.forEach((q, i) => {
    const btn =
