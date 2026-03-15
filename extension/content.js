console.log("✅ MeetScribe content script loaded");

let transcript = [];
let lastText = "";
let debounceTimer = null;
let activeObserver = null;
let captionsActive = false;

/* ---------- UI Noise Filter ---------- */

const UI_NOISE = [
  "turn off microphone", "turn on microphone", "turn off camera", "turn on camera",
  "leave call", "more options", "raise hand", "send a reaction", "share screen",
  "meeting details", "chat with everyone", "host controls", "meeting tools",
  "audio settings", "video settings", "show more info", "open caption settings",
  "stop presenting", "you are presenting", "presentation is starting",
  "scroll & zoom", "enter full screen", "unpin", "remove from the call",
  "reframe", "backgrounds and effects", "press down arrow",
  "keyboard_arrow", "closed_caption", "back_hand", "more_vert", "call_end",
  "lock_person", "present_to_all", "frame_person", "visual_effects",
  "volume_up", "volume_off", "computer_arrow", "swap_vert", "open_in_full",
  "keep_off", "remove_circle", "format_size", "you have joined the call",
  "you are the first one here", "your hand is lowered", "your hand is raised",
  "your camera is off", "your camera is on", "your microphone is on",
  "your microphone is off", "your presentation is on", "added to the main screen",
  "someone joined", "someone left", "joined the meeting", "left the meeting",
  "is now presenting", "stopped presenting", "recording has started",
  "recording has stopped", "this call is being recorded",
  "joined as", "your meeting's ready", "add others", "copy link",
  "people who use this meeting link", "get your permission",
  "content_copy", "person_add", "meet.google.com",
];

function cleanCaptionText(raw) {
  if (!raw) return "";
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const speechLines = lines.filter(line => {
    if (/^(your presentation|you|presenting|lavanya)$/i.test(line)) return false;
    if (line.split(" ").length <= 2 && line.length < 25 && /^[A-Z]/.test(line)) return false;
    const lower = line.toLowerCase();
    for (const noise of UI_NOISE) {
      if (lower.includes(noise)) return false;
    }
    return true;
  });
  return speechLines.join(" ").trim();
}

function looksLikeSpeech(text) {
  if (!text || text.length < 15) return false;
  const lower = text.toLowerCase();
  for (const noise of UI_NOISE) {
    if (lower.includes(noise)) return false;
  }
  const words = text.trim().split(/\s+/);
  if (words.length < 4) return false;
  const singleChars = words.filter(w => w.length <= 2).length;
  if (singleChars / words.length > 0.4) return false;
  return true;
}

/* ---------- Caption Detection ---------- */

// Target ONLY the specific caption text element, not the whole page
function findCaptionTextElement() {
  // Strategy 1: aria-live regions (most reliable — Meet uses these for accessibility)
  const ariaLive = [
    ...document.querySelectorAll('[aria-live="polite"]'),
    ...document.querySelectorAll('[aria-live="assertive"]'),
  ];
  for (const el of ariaLive) {
    const text = cleanCaptionText(el.innerText);
    if (looksLikeSpeech(text)) return el;
  }

  // Strategy 2: known caption jsnames
  for (const name of ["tgaKEf", "YSxPC", "ds6Mcd", "K4s0sb"]) {
    const el = document.querySelector(`[jsname="${name}"]`);
    if (el) {
      const text = cleanCaptionText(el.innerText);
      if (looksLikeSpeech(text)) return el;
    }
  }

  // Strategy 3: find element by aria-label containing caption
  for (const el of document.querySelectorAll('[aria-label*="caption" i], [aria-label*="subtitle" i]')) {
    const text = cleanCaptionText(el.innerText);
    if (looksLikeSpeech(text)) return el;
  }

  // Strategy 4: STRICT heuristic — element must be:
  // - in bottom 40% of screen
  // - small (few children = not a container)
  // - contain ONLY speech-like text (no UI noise at all)
  const vh = window.innerHeight;
  for (const el of document.querySelectorAll("div, span")) {
    if (el.children.length > 5) continue; // skip large containers
    const rect = el.getBoundingClientRect();
    if (rect.top < vh * 0.55 || rect.height < 10 || rect.width < 100) continue;
    const raw = el.innerText?.trim();
    if (!raw) continue;
    // Reject if ANY line contains UI noise
    const hasNoise = raw.split("\n").some(line => {
      const l = line.toLowerCase();
      return UI_NOISE.some(n => l.includes(n));
    });
    if (hasNoise) continue;
    const cleaned = cleanCaptionText(raw);
    if (looksLikeSpeech(cleaned)) return el;
  }

  return null;
}

/* ---------- Wait for Captions ---------- */

function waitForCaptions() {
  let attempts = 0;
  const check = () => {
    if (attempts++ > 400) { console.warn("MeetScribe: gave up"); return; }
    const el = findCaptionTextElement();
    if (!el) {
      if (attempts % 10 === 1) console.log("⏳ Waiting for captions...", attempts);
      setTimeout(check, 1500);
      return;
    }
    console.log("✅ Caption element found:", el.tagName, el.getAttribute("jsname") || el.getAttribute("aria-label") || el.className.slice(0,30));
    captionsActive = true;
    startObserver(el);
  };
  check();
}

/* ---------- Observer ---------- */

function startObserver(container) {
  if (activeObserver) { activeObserver.disconnect(); activeObserver = null; }
  let lastMutation = Date.now();

  const observer = new MutationObserver(() => {
    lastMutation = Date.now();
    const raw = container.innerText?.trim();
    const text = cleanCaptionText(raw);
    if (!text) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (!looksLikeSpeech(text)) return;
      if (text === lastText) return;
      if (transcript.length > 0 && text.startsWith(lastText) && lastText.length > 0) {
        transcript[transcript.length - 1] = text;
      } else {
        transcript.push(text);
      }
      lastText = text;
      console.log("📢 Caption:", text.slice(0, 80) + (text.length > 80 ? "…" : ""));
    }, 800);
  });

  observer.observe(container, { childList: true, subtree: true, characterData: true });
  activeObserver = observer;

  const watchdog = setInterval(() => {
    if (!activeObserver) { clearInterval(watchdog); return; }
    if (Date.now() - lastMutation > 60_000) {
      console.log("🔄 Re-searching for caption element...");
      clearInterval(watchdog);
      observer.disconnect();
      activeObserver = null;
      waitForCaptions();
    }
  }, 20_000);
}

/* ---------- Start ---------- */
setTimeout(waitForCaptions, 2500);

/* ---------- Messaging ---------- */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "PING") { sendResponse({ pong: true }); return true; }
  if (msg.type === "GET_TRANSCRIPT") {
    sendResponse({ transcript: transcript.join(" ") });
  }
  if (msg.type === "HAS_CAPTIONS") {
    sendResponse({ has: captionsActive || transcript.length > 0, sample: transcript[0] || "" });
  }
  return true;
});