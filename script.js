
const sections = document.querySelectorAll(".page-section");
const progress = document.getElementById("progress");
const themeToggle = document.getElementById("themeToggle");
const soundToggle = document.getElementById("soundToggle");
const toast = document.getElementById("toast");

let soundEnabled = false;
let toastTimeout;
let quizIndex = 0;
let quizScore = 0;
let quizLocked = false;
let quizTimer;

function showSection(sectionId) {
  sections.forEach(function(section) {
    section.classList.remove("active");
  });

  const target = document.getElementById(sectionId);

  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    updateProgress();
  }
}

function updateProgress() {
  const activeSection = document.querySelector(".page-section.active");
  const sectionList = Array.from(sections);
  const currentIndex = sectionList.indexOf(activeSection);

  const percent = sectionList.length > 1
    ? (currentIndex / (sectionList.length - 1)) * 100
    : 0;

  progress.style.width = percent + "%";
}

window.addEventListener("scroll", function() {
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;

  const percent = pageHeight > 0
    ? (window.scrollY / pageHeight) * 100
    : 0;

  progress.style.width = percent + "%";
});

themeToggle.addEventListener("click", function() {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    themeToggle.textContent = "☀";
  } else {
    themeToggle.textContent = "☾";
  }

  playSound(500);
});

soundToggle.addEventListener("click", function() {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? "♫ On" : "♫";

  showToast(soundEnabled
    ? "Sound effects enabled! ♫"
    : "Sound effects muted.");

  if (soundEnabled) playSound(600);
});

function playSound(frequency) {
  if (!soundEnabled) return;

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.15
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);

    oscillator.onended = function() {
      audioContext.close();
    };
  } catch (error) {
    // The website still works if sound is unavailable.
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(function() {
    toast.classList.remove("show");
  }, 2500);
}

/* HOBBY FUN FACT */
document.getElementById("hobbyReveal").addEventListener("click", function() {
  const fact = document.getElementById("hobbyFact");

  fact.classList.toggle("hidden");

  this.textContent = fact.classList.contains("hidden")
    ? "Reveal a Fun Fact ✨"
    : "Hide Fun Fact ↑";

  playSound(550);
});

/* MOOD CHECKER */
const moodMessages = {
  happy: "Yay! Keep that beautiful smile and spread your happiness! 🌸",
  calm: "Take your time, enjoy the moment, and keep that peaceful energy. 🌷",
  tired: "You've been doing your best. It's okay to rest and recharge! ☁️",
  curious: "Stay curious! Asking questions is a wonderful way to learn. 💡",
  excited: "That's the spirit! Keep that positive energy going! ✨"
};

document.querySelectorAll(".mood-choice").forEach(function(button) {
  button.addEventListener("click", function() {
    document.querySelectorAll(".mood-choice").forEach(function(choice) {
      choice.classList.remove("selected");
    });

    this.classList.add("selected");

    const mood = this.dataset.mood;
    const message = document.getElementById("moodMessage");

    message.textContent = moodMessages[mood];
    message.classList.remove("hidden");

    playSound(620);
  });
});

/* HCI CHALLENGE */
document.querySelectorAll(".design-choice").forEach(function(button) {
  button.addEventListener("click", function() {
    const feedback = document.getElementById("designFeedback");

    if (this.dataset.choice === "clear") {
      feedback.textContent =
        "Correct! 'ADD TO CART' clearly explains what will happen. 💗";

      playSound(700);
    } else {
      feedback.textContent =
        "Good try! 'ADD TO CART' gives users a clearer idea of the action. 🌷";

      playSound(400);
    }
  });
});

/* QUIZ */
const questions = [
  {
    question: "What course am I taking?",
    answers: ["BSIT", "BSHM", "BSN", "BSED"],
    correct: "BSIT"
  },
  {
    question: "What are my favorite colors?",
    answers: ["Blue and green", "Purple and pink", "Red and black", "Yellow and orange"],
    correct: "Purple and pink"
  },
  {
    question: "What is my favorite animal?",
    answers: ["Cats", "Birds", "Dogs", "Rabbits"],
    correct: "Dogs"
  },
  {
    question: "What do I enjoy watching to improve my coding?",
    answers: ["Cooking shows", "Coding tutorials", "Sports", "Travel videos"],
    correct: "Coding tutorials"
  },
  {
    question: "What is one of my goals?",
    answers: ["Stop learning", "Avoid technology", "Improve my coding skills", "Never try new things"],
    correct: "Improve my coding skills"
  }
];

function loadQuestion() {
  clearTimeout(quizTimer);
  quizLocked = false;

  const question = questions[quizIndex];

  document.getElementById("questionCounter").textContent =
    "Question " + (quizIndex + 1) + " of " + questions.length;

  document.getElementById("quizScore").textContent =
    "Score: " + quizScore;

  document.getElementById("quizProgress").style.width =
    ((quizIndex + 1) / questions.length * 100) + "%";

  document.getElementById("questionText").textContent = question.question;
  document.getElementById("quizFeedback").textContent = "";
  document.getElementById("quizResult").classList.add("hidden");

  const answerButtons = document.getElementById("answerButtons");
  answerButtons.innerHTML = "";

  question.answers.forEach(function(answer) {
    const button = document.createElement("button");

    button.className = "answer-button";
    button.textContent = answer;

    button.addEventListener("click", function() {
      checkAnswer(button, answer);
    });

    answerButtons.appendChild(button);
  });
}

function checkAnswer(button, answer) {
  if (quizLocked) return;

  quizLocked = true;

  const correctAnswer = questions[quizIndex].correct;
  const feedback = document.getElementById("quizFeedback");
  const buttons = document.querySelectorAll(".answer-button");

  buttons.forEach(function(answerButton) {
    answerButton.disabled = true;

    if (answerButton.textContent === correctAnswer) {
      answerButton.classList.add("correct");
    }
  });

  if (answer === correctAnswer) {
    quizScore++;
    feedback.textContent = "Correct! Great job! 🎉";
    playSound(700);
  } else {
    button.classList.add("wrong");

    feedback.textContent =
      "Not quite! The correct answer is " + correctAnswer + ". 🌷";

    playSound(350);
  }

  document.getElementById("quizScore").textContent =
    "Score: " + quizScore;

  quizTimer = setTimeout(function() {
    quizIndex++;

    if (quizIndex < questions.length) {
      loadQuestion();
    } else {
      showQuizResult();
    }
  }, 1200);
}

function showQuizResult() {
  document.getElementById("answerButtons").innerHTML = "";
  document.getElementById("quizFeedback").textContent = "";
  document.getElementById("questionCounter").textContent = "Quiz completed!";
  document.getElementById("quizProgress").style.width = "100%";

  document.getElementById("resultTitle").textContent =
    quizScore === questions.length ? "Perfect Score! 🌟" : "Nice job! 💗";

  document.getElementById("resultText").textContent =
    "You scored " + quizScore + " out of " + questions.length +
    ". Thank you for playing!";

  document.getElementById("quizResult").classList.remove("hidden");

  celebrate();
}

function resetQuiz() {
  clearTimeout(quizTimer);

  quizIndex = 0;
  quizScore = 0;
  quizLocked = false;

  loadQuestion();
}

document.getElementById("playAgain").addEventListener("click", function() {
  resetQuiz();
  playSound(600);
});

document.getElementById("quizContinue").addEventListener("click", function() {
  showSection("letter");
});

/* LETTER */
document.getElementById("openLetter").addEventListener("click", function() {
  document.getElementById("letterContent").classList.toggle("hidden");

  this.querySelector(".envelope-hint").textContent =
    document.getElementById("letterContent").classList.contains("hidden")
      ? "Tap to open ✨"
      : "Tap to close ♡";

  playSound(600);
});

/* SURPRISE */
document.getElementById("surpriseButton").addEventListener("click", function() {
  const message = document.getElementById("surpriseMessage");
  const art = document.getElementById("surpriseArt");

  message.classList.remove("hidden");
  art.classList.remove("hidden");

  this.textContent = "Surprise Opened! 💗";
  this.disabled = true;

  celebrate();
  playSound(750);
});

/* WEBSITE FEEDBACK */
const feedbackForm = document.getElementById("feedbackForm");
const feedbackThanks = document.getElementById("feedbackThanks");

feedbackForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const rating = document.getElementById("websiteRating").value;

  if (!rating) {
    showToast("Please select a rating from 1 to 5. ⭐");
    return;
  }

  document.getElementById("submittedRating").textContent =
    "Your rating: " + rating + "/5 " + "★".repeat(Number(rating));

  feedbackForm.classList.add("hidden");
  feedbackThanks.classList.remove("hidden");

  showToast("Thank you for your feedback! 💗");
  celebrate();
  playSound(740);
});

/* CONFETTI */
function celebrate() {
  const area = document.getElementById("celebration");
  const symbols = ["💗", "✨", "🌸", "🎉", "💕", "🥳", "👏", "🎊"];

  area.innerHTML = "";

  for (let i = 0; i < 24; i++) {
    const piece = document.createElement("span");

    piece.className = "confetti-piece";
    piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    piece.style.left = Math.random() * 100 + "%";
    piece.style.animationDelay = Math.random() * 0.8 + "s";

    area.appendChild(piece);
  }

  setTimeout(function() {
    area.innerHTML = "";
  }, 3500);
}

/* RESTART */
function restartWebsite() {
  resetQuiz();

  document.querySelectorAll(".mood-choice").forEach(function(button) {
    button.classList.remove("selected");
  });

  document.getElementById("moodMessage").classList.add("hidden");
  document.getElementById("designFeedback").textContent = "";
  document.getElementById("hobbyFact").classList.add("hidden");
  document.getElementById("hobbyReveal").textContent = "Reveal a Fun Fact ✨";

  document.getElementById("letterContent").classList.add("hidden");
  document.querySelector("#openLetter .envelope-hint").textContent =
    "Tap to open ✨";

  document.getElementById("surpriseMessage").classList.add("hidden");
  document.getElementById("surpriseArt").classList.add("hidden");

  document.getElementById("surpriseButton").disabled = false;
  document.getElementById("surpriseButton").textContent =
    "Open Your Surprise ✨";

  feedbackForm.reset();
  feedbackForm.classList.remove("hidden");
  feedbackThanks.classList.add("hidden");

  showSection("home");
  showToast("Welcome back to Rhea's World! 🌷");
}

document.getElementById("year").textContent = new Date().getFullYear();

resetQuiz();
showSection("home");
