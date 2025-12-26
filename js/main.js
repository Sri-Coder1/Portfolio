
// CHITTI MINI CHATBOT
const miniBtn = document.getElementById("mini-chitti-btn");
const miniPanel = document.getElementById("mini-chitti-panel");
const miniInput = document.getElementById("mini-chatbox");
const miniSend = document.getElementById("mini-send");
const miniChat = document.getElementById("mini-chat-status");

// Toggle chatbot
miniBtn.addEventListener("click", () => {
  miniPanel.style.display =
    miniPanel.style.display === "flex" ? "none" : "flex";

  if (miniChat.children.length === 0) {
    addBot("Hi 👋 I’m CHITTI.I am CHITTI, a chatbot assistant AI created by Srivatsankith. Type a section name like 'projects', 'skills', or 'contact'.");
  }
});

// Add user bubble
function addUser(text) {
  const bubble = document.createElement("div");
  bubble.className = "mini-bubble user";
  bubble.innerText = text;
  miniChat.appendChild(bubble);
  autoScroll();
}

// Add bot bubble
function addBot(text) {
  const bubble = document.createElement("div");
  bubble.className = "mini-bubble bot";
  bubble.innerText = text;
  miniChat.appendChild(bubble);
  autoScroll();
}

// Auto-scroll
function autoScroll() {
  miniChat.scrollTop = miniChat.scrollHeight;
}

// Section navigation map
const sectionMap = {
  "home": "#home",
  "about": "#about",
  "skills": "#skills",
  "projects": "#projects",
  "experience": "#experience",
  "journey": "#experience",
  "contact": "#contact"
};

// Replies map
const miniReplies = {
  "who are you": "I am CHITTI, a chatbot assistant AI created by Srivatsankith."
};

// Handle send
function handleMiniSend() {
  const text = miniInput.value.trim();
  if (!text) return;

  const query = text.toLowerCase();

  addUser(text);

  // ✅ SECTION NAVIGATION
  if (sectionMap[query]) {
    addBot(`Taking you to the ${query} section.`);
    document.querySelector(sectionMap[query])
      .scrollIntoView({ behavior: "smooth" });
  }
  // ✅ PREDEFINED RESPONSES
  else if (miniReplies[query]) {
    addBot(miniReplies[query]);
  }
  // ❌ FALLBACK
  else {
    addBot("I can navigate you through the portfolio. Try typing a section name.");
  }

  miniInput.value = "";
}

// Click + Enter
miniSend.addEventListener("click", handleMiniSend);
miniInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleMiniSend();
});
