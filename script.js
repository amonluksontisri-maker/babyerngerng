// ===== Editable story content =====
const STORY = {
  intro: {
    scene: "intro",
    speaker: "Earn",
    button: "Next",
    lines: [
      "วันนี้เอินมีอะไรอยากบอกเอิง...",
      "แต่ตอนนี้... เอิงอยู่ไหนนะ?",
      "เอินกำลังวิ่งตามหาเอิงอยู่ 💨"
    ]
  },
  found: {
    scene: "found",
    speaker: "Earn",
    button: "Next",
    lines: [
      "เจอแล้ว...",
      "เอิงรู้ไหม เอินตั้งใจตามหาเอิงเลยนะ",
      "เพราะเอินมีบางอย่างอยากบอก..."
    ]
  },
  confession: {
    scene: "confession",
    speaker: "Earn",
    lines: [
      "ให้เอินเป็นคนโปรดของเอิงไปนานๆ ได้ไหม?"
    ]
  },
  yesEnding: {
    scene: "ending",
    speaker: "Earn",
    lines: [
      "เย้~ เอินดีใจที่สุดเลย 💖",
      "จากนี้ไป ขออยู่ข้างเอิงไปนานๆ นะ"
    ]
  },
  noMessages: [
    "แน่ใจหรอ 🥺",
    "ลองคิดอีกทีน้า",
    "เอินตั้งใจมาหาเลยนะ 🌸",
    "ปุ่ม Yes เหงาแล้วน้า 💕"
  ]
};

const game = document.querySelector("#game");
const loadingScreen = document.querySelector("#loadingScreen");
const dialogueText = document.querySelector("#dialogueText");
const speakerName = document.querySelector("#speakerName");
const nextButton = document.querySelector("#nextButton");
const choiceRow = document.querySelector("#choiceRow");
const yesButton = document.querySelector("#yesButton");
const noButton = document.querySelector("#noButton");
const replayButton = document.querySelector("#replayButton");
const finalCard = document.querySelector("#finalCard");
const girl = document.querySelector("#girl");
const boy = document.querySelector("#boy");
const particleLayer = document.querySelector("#particleLayer");
const confettiLayer = document.querySelector("#confettiLayer");
const musicToggle = document.querySelector("#musicToggle");

let currentChapter = "intro";
let lineIndex = 0;
let typeTimer = null;
let isTyping = false;
let noCount = 0;
let audioContext = null;
let musicNodes = [];

function typeLine(text) {
  clearInterval(typeTimer);
  isTyping = true;
  dialogueText.textContent = "";
  let index = 0;

  typeTimer = setInterval(() => {
    dialogueText.textContent += text.charAt(index);
    index += 1;

    if (index >= text.length) {
      clearInterval(typeTimer);
      isTyping = false;
    }
  }, 34);
}

function showChapter(chapterKey) {
  const chapter = STORY[chapterKey];
  currentChapter = chapterKey;
  lineIndex = 0;
  game.dataset.scene = chapter.scene;
  speakerName.textContent = chapter.speaker;
  choiceRow.classList.add("hidden");
  finalCard.classList.add("hidden");
  nextButton.classList.remove("hidden");
  nextButton.textContent = chapter.button || "Next";

  if (chapterKey === "intro") {
    girl.classList.add("hidden");
    boy.classList.add("running");
    nextButton.textContent = "Help Earn find Eung";
  }

  if (chapterKey === "found" || chapterKey === "confession" || chapterKey === "yesEnding") {
    girl.classList.remove("hidden");
    boy.classList.remove("running");
  }

  if (chapterKey === "confession") {
    nextButton.classList.add("hidden");
    choiceRow.classList.remove("hidden");
  }

  typeLine(chapter.lines[lineIndex]);
}

function advanceDialogue() {
  const chapter = STORY[currentChapter];

  if (isTyping) {
    clearInterval(typeTimer);
    dialogueText.textContent = chapter.lines[lineIndex];
    isTyping = false;
    return;
  }

  lineIndex += 1;

  if (lineIndex < chapter.lines.length) {
    typeLine(chapter.lines[lineIndex]);
    return;
  }

  if (currentChapter === "intro") {
    showChapter("found");
    return;
  }

  if (currentChapter === "found") {
    showChapter("confession");
    return;
  }

  if (currentChapter === "yesEnding") {
    nextButton.classList.add("hidden");
    finalCard.classList.remove("hidden");
  }
}

function makeParticle(isBurst = false) {
  const particle = document.createElement("span");
  const isSpark = Math.random() > 0.58;
  particle.className = `particle${isSpark ? " spark" : ""}`;
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.bottom = `${isBurst ? 28 + Math.random() * 38 : -5}%`;
  particle.style.setProperty("--duration", `${3.5 + Math.random() * 3}s`);
  particle.style.setProperty("--drift", `${-55 + Math.random() * 110}px`);
  particle.style.transform = `scale(${0.7 + Math.random() * 1.1})`;
  particleLayer.appendChild(particle);
  particle.addEventListener("animationend", () => particle.remove());
}

function startAmbientParticles() {
  setInterval(() => makeParticle(false), 520);
}

function celebrate() {
  game.dataset.scene = "ending";
  choiceRow.classList.add("hidden");
  nextButton.classList.remove("hidden");
  nextButton.textContent = "Next";
  showChapter("yesEnding");

  for (let i = 0; i < 72; i += 1) {
    const confetti = document.createElement("span");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `${-10 - Math.random() * 20}%`;
    confetti.style.background = ["#ff6f9f", "#ffd36e", "#bca7ff", "#fff4dd"][i % 4];
    confetti.style.setProperty("--fall-drift", `${-100 + Math.random() * 200}px`);
    confetti.style.animationDelay = `${Math.random() * 0.35}s`;
    confettiLayer.appendChild(confetti);
    confetti.addEventListener("animationend", () => confetti.remove());
  }

  for (let i = 0; i < 28; i += 1) {
    setTimeout(() => makeParticle(true), i * 24);
  }
}

function dodgeNoButton() {
  const message = STORY.noMessages[noCount % STORY.noMessages.length];
  noCount += 1;
  typeLine(message);

  const maxX = Math.min(180, window.innerWidth * 0.28);
  const maxY = 54;
  const x = Math.round(-maxX + Math.random() * maxX * 2);
  const y = Math.round(-maxY + Math.random() * maxY * 2);
  noButton.style.transform = `translate(${x}px, ${y}px)`;
}

function resetGame() {
  noCount = 0;
  noButton.style.transform = "";
  showChapter("intro");
}

function startMusic() {
  audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
  const master = audioContext.createGain();
  master.gain.setValueAtTime(0.035, audioContext.currentTime);
  master.connect(audioContext.destination);

  const notes = [392, 440, 523.25, 659.25];
  musicNodes = notes.map((frequency, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = index === 0 ? 0.42 : 0.18;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    return { osc, gain, master };
  });
}

function stopMusic() {
  musicNodes.forEach(({ osc }) => {
    try {
      osc.stop();
    } catch (error) {
      // The oscillator may already be stopped during a quick toggle.
    }
  });
  musicNodes = [];
}

function toggleMusic() {
  const isOn = musicToggle.getAttribute("aria-pressed") === "true";

  if (isOn) {
    stopMusic();
    musicToggle.setAttribute("aria-pressed", "false");
    return;
  }

  startMusic();
  musicToggle.setAttribute("aria-pressed", "true");
}

window.addEventListener("load", () => {
  setTimeout(() => {
    loadingScreen.classList.add("is-gone");
    showChapter("intro");
    startAmbientParticles();
  }, 850);
});

nextButton.addEventListener("click", advanceDialogue);
yesButton.addEventListener("click", celebrate);
noButton.addEventListener("mouseenter", dodgeNoButton);
noButton.addEventListener("click", dodgeNoButton);
replayButton.addEventListener("click", resetGame);
musicToggle.addEventListener("click", toggleMusic);
