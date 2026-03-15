const API_BASE = "http://localhost:5000/api";

function $(id) { return document.getElementById(id); }

function setLoading(state) {
  $("spinner").style.display = state ? "block" : "none";
  document.querySelectorAll("button").forEach(b => b.disabled = state);
}

function setOutput(text, isPlain = false) {
  const box = $("output-box");
  box.className = isPlain ? "plain" : "";
  if (isPlain || (!text.includes("##") && !text.includes("- "))) {
    box.textContent = text; return;
  }
  const lines = text.split("\n");
  let html = "", inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { if (inList) { html += "</ul>"; inList = false; } continue; }
    if (line.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h2>${esc(line.slice(3))}</h2>`;
    } else if (line.startsWith("- ")) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${esc(line.slice(2))}</li>`;
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<p>${esc(line)}</p>`;
    }
  }
  if (inList) html += "</ul>";
  box.innerHTML = html;
}

function esc(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function getToken() {
  return new Promise(resolve => {
    chrome.storage.local.get("token", ({ token }) => resolve(token || null));
  });
}

/* ===================== MEET MESSAGING ===================== */

function sendToTab(message, callback) {
  chrome.runtime.sendMessage(message, response => {
    if (chrome.runtime.lastError) { callback(null); return; }
    callback(response);
  });
}

function checkCaptions(cb, attempt = 1) {
  sendToTab({ type: "HAS_CAPTIONS" }, res => {
    if (res && res.has) { cb(); return; }
    if (attempt < 5) {
      setOutput(`⏳ Checking for captions... (${attempt}/5)`, true);
      setTimeout(() => checkCaptions(cb, attempt + 1), 1200);
      return;
    }
    setOutput(!res
      ? "⚠️ No active Google Meet call found."
      : "⚠️ Turn captions ON in Google Meet (press C).",
    true);
    setLoading(false);
  });
}

// Returns transcript from textarea OR from Meet tab
// Returns null if neither is available
function getTranscript(cb) {
  const manual = $("transcript").value.trim();
  if (manual) { cb(manual); return; } // ← manual text skips Meet entirely

  sendToTab({ type: "GET_TRANSCRIPT" }, res => {
    if (!res) { setOutput("⚠️ Could not reach Meet tab.", true); setLoading(false); return; }
    cb(res.transcript || "");
  });
}

/* ===================== SUMMARIZE ===================== */

$("summarize").addEventListener("click", async () => {
  const token = await getToken();
  const manual = $("transcript").value.trim();

  setLoading(true);
  setOutput("⏳ Processing...", true);

  // If manual transcript is pasted — skip caption check, go straight to API
  if (manual) {
    await callSummarize(manual, token);
    return;
  }

  // Otherwise fetch from Meet tab (requires captions)
  checkCaptions(() => {
    setOutput("⏳ Fetching transcript...", true);
    getTranscript(async transcript => {
      if (!transcript.trim()) {
        setOutput("⚠️ No speech captured yet. Wait for someone to speak.", true);
        setLoading(false); return;
      }
      await callSummarize(transcript, token);
    });
  });
});

async function callSummarize(transcript, token) {
  setOutput("⏳ Summarizing...", true);
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/ai/summarize`, {
      method: "POST",
      headers,
      body: JSON.stringify({ meetingTitle: "Google Meet", transcript })
    });
    const data = await res.json();
    setOutput(data.output || data.error || "No output received.");
    if (data.summaryId) chrome.storage.local.set({ summaryId: data.summaryId });
  } catch {
    setOutput("❌ Could not reach server. Is it running?", true);
  } finally {
    setLoading(false);
  }
}

/* ===================== ACTION ITEMS ===================== */

$("actions").addEventListener("click", async () => {
  const token = await getToken();
  const manual = $("transcript").value.trim();

  chrome.storage.local.get("summaryId", async ({ summaryId }) => {
    if (!summaryId) { setOutput("⚠️ Generate a summary first.", true); return; }

    setLoading(true);
    setOutput("⏳ Processing...", true);

    // If manual transcript pasted — skip Meet tab
    if (manual) {
      await callActionItems(manual, summaryId, token);
      return;
    }

    getTranscript(async transcript => {
      if (!transcript.trim()) {
        setOutput("⚠️ No speech captured yet.", true);
        setLoading(false); return;
      }
      await callActionItems(transcript, summaryId, token);
    });
  });
});

async function callActionItems(transcript, summaryId, token) {
  setOutput("⏳ Getting action items...", true);
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/ai/action-items`, {
      method: "POST",
      headers,
      body: JSON.stringify({ transcript, summaryId })
    });
    const data = await res.json();
    setOutput(data.output || data.error || "No output received.");
  } catch {
    setOutput("❌ Could not reach server. Is it running?", true);
  } finally {
    setLoading(false);
  }
}

/* ===================== HISTORY ===================== */

$("btn-history").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:3000/history" });
});

/* ===================== LOGIN STATUS ===================== */
chrome.storage.local.get(["token", "user"], ({ token, user }) => {
  const box = $("output-box");
  if (token && user) {
    box.textContent = `✅ Logged in as ${user.email || user.name}. Ready to summarize.`;
  } else {
    box.textContent = `⚠️ Not linked to website account. Login at localhost:3000 to save history.`;
  }
});