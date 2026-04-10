const API_BASE = "http://localhost:5000/api";

/* ── Helpers ──────────────────────────────────────────── */
function $(id) { return document.getElementById(id); }

function setLoading(state) {
  $("spinner").style.display = state ? "block" : "none";
  document.querySelectorAll("button.primary").forEach(b => b.disabled = state);
}

function setOutput(text, isPlain = false) {
  const box = $("output-box");
  box.className = isPlain ? "plain" : "";
  if (isPlain || (!text.includes("##") && !text.includes("- "))) {
    box.textContent = text;
    return;
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
  return new Promise(resolve =>
    chrome.storage.local.get("token", ({ token }) => resolve(token || null))
  );
}

/* ── Star UI helper ───────────────────────────────────── */
// Single source of truth for rendering the star button.
// Also saves state locally so popup re-opens correctly.
function setStarUI(isStarred) {
  const btn = $("btn-star");
  if (isStarred) {
    btn.textContent = "★ Starred";
    btn.classList.add("starred");
  } else {
    btn.textContent = "☆ Star";
    btn.classList.remove("starred");
  }
  chrome.storage.local.set({ starredState: isStarred });
}

/* ── Fetch real star state from DB for a summaryId ───── */
// Called on popup open (when a summaryId already exists) and after
// a new summary is saved. This keeps the popup in sync with whatever
// state the history page set.
async function syncStarFromDB(summaryId) {
  const token = await getToken();
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res  = await fetch(`${API_BASE}/ai/summaries/${summaryId}`, { headers });
    if (!res.ok) return;
    const data = await res.json();
    setStarUI(!!data.starred);
  } catch { /* silent — fall back to cached state */ }
}

/* ── Live word count ─────────────────────────────────── */
$("transcript").addEventListener("input", () => {
  const words = $("transcript").value.trim().split(/\s+/).filter(Boolean).length;
  $("word-count").textContent = `${words} word${words !== 1 ? "s" : ""}`;
});

/* ── Tabs ────────────────────────────────────────────── */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.tab).classList.add("active");
  });
});

/* ── Meet messaging ──────────────────────────────────── */
function sendToTab(message, callback) {
  chrome.runtime.sendMessage(message, response => {
    if (chrome.runtime.lastError) { callback(null); return; }
    callback(response);
  });
}

function checkCaptions(cb, attempt = 1) {
  sendToTab({ type: "HAS_CAPTIONS" }, res => {
    if (res && res.has) {
      $("status-dot").classList.add("live");
      cb();
      return;
    }
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

function getTranscript(cb) {
  const manual = $("transcript").value.trim();
  if (manual) { cb(manual); return; }
  sendToTab({ type: "GET_TRANSCRIPT" }, res => {
    if (!res) { setOutput("⚠️ Could not reach Meet tab.", true); setLoading(false); return; }
    cb(res.transcript || "");
  });
}

/* ── UI helpers ──────────────────────────────────────── */
function showParticipants(list) {
  if (!list || !list.length) return;
  $("participants-row").style.display = "block";
  $("participants-list").textContent = list.join(", ");
}

function showTags(tags) {
  const row = $("tags-row");
  row.innerHTML = "";
  (tags || []).forEach(t => {
    const pill = document.createElement("span");
    pill.className = "tag-pill";
    pill.textContent = t;
    row.appendChild(pill);
  });
}

function showSentimentBadge(sentiment) {
  if (!sentiment || !sentiment.label) return;
  $("sentiment-badge").textContent = sentiment.label;
  $("sentiment-badge").className   = `sentiment-badge badge-${sentiment.label}`;
  $("sentiment-insight").textContent = sentiment.insight || "";
  $("sentiment-row").style.display = "flex";
}

/* ── SUMMARIZE ───────────────────────────────────────── */
$("summarize").addEventListener("click", async () => {
  const token  = await getToken();
  const manual = $("transcript").value.trim();
  setLoading(true);
  setOutput("⏳ Processing...", true);
  $("btn-copy").style.display   = "none";
  $("btn-export").style.display = "none";

  if (manual) { await callSummarize(manual, token); return; }
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
    const res  = await fetch(`${API_BASE}/ai/summarize`, {
      method: "POST", headers,
      body: JSON.stringify({ meetingTitle: "Google Meet", transcript })
    });
    const data = await res.json();
    setOutput(data.output || data.error || "No output received.");

    if (data.summaryId) {
      // New summary — reset star to unstarred, then sync from DB to be safe
      chrome.storage.local.set({ summaryId: data.summaryId });
      setStarUI(false);
      syncStarFromDB(data.summaryId);
      $("btn-copy").style.display   = "inline-block";
      $("btn-export").style.display = "inline-block";
    }
    if (data.participants) showParticipants(data.participants);
  } catch {
    setOutput("❌ Could not reach server. Is it running?", true);
  } finally { setLoading(false); }
}

/* ── ACTION ITEMS ────────────────────────────────────── */
$("actions").addEventListener("click", async () => {
  const token  = await getToken();
  const manual = $("transcript").value.trim();
  chrome.storage.local.get("summaryId", async ({ summaryId }) => {
    if (!summaryId) { setOutput("⚠️ Generate a summary first.", true); return; }
    setLoading(true);
    setOutput("⏳ Processing...", true);
    if (manual) { await callActionItems(manual, summaryId, token); return; }
    getTranscript(async transcript => {
      if (!transcript.trim()) {
        setOutput("⚠️ No speech captured yet.", true); setLoading(false); return;
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
    const res  = await fetch(`${API_BASE}/ai/action-items`, {
      method: "POST", headers,
      body: JSON.stringify({ transcript, summaryId })
    });
    const data = await res.json();
    setOutput(data.output || data.error || "No output received.");
  } catch {
    setOutput("❌ Could not reach server. Is it running?", true);
  } finally { setLoading(false); }
}

/* ── SENTIMENT ───────────────────────────────────────── */
$("btn-sentiment").addEventListener("click", async () => {
  chrome.storage.local.get("summaryId", async ({ summaryId }) => {
    if (!summaryId) { setOutput("⚠️ Generate a summary first.", true); return; }
    setLoading(true);
    setOutput("⏳ Analysing sentiment...", true);
    try {
      const token   = await getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res  = await fetch(`${API_BASE}/ai/sentiment`, {
        method: "POST", headers,
        body: JSON.stringify({ summaryId })
      });
      const data = await res.json();
      if (data.sentiment) {
        showSentimentBadge(data.sentiment);
        setOutput(
          `Sentiment: ${data.sentiment.label.toUpperCase()} (score: ${data.sentiment.score?.toFixed(2)})\n\n${data.sentiment.insight}`,
          true
        );
      } else {
        setOutput(data.error || "Could not determine sentiment.", true);
      }
    } catch {
      setOutput("❌ Server error.", true);
    } finally { setLoading(false); }
  });
});

/* ── AUTO-TAG ────────────────────────────────────────── */
$("btn-autotag").addEventListener("click", async () => {
  chrome.storage.local.get("summaryId", async ({ summaryId }) => {
    if (!summaryId) { setOutput("⚠️ Generate a summary first.", true); return; }
    setLoading(true);
    setOutput("⏳ Generating tags...", true);
    try {
      const token   = await getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res  = await fetch(`${API_BASE}/ai/auto-tag`, {
        method: "POST", headers,
        body: JSON.stringify({ summaryId })
      });
      const data = await res.json();
      if (data.tags) {
        showTags(data.tags);
        setOutput(`Tags generated: ${data.tags.join(", ")}`, true);
      } else {
        setOutput(data.error || "Could not generate tags.", true);
      }
    } catch {
      setOutput("❌ Server error.", true);
    } finally { setLoading(false); }
  });
});

/* ── ASK AI ──────────────────────────────────────────── */
$("btn-ask").addEventListener("click", askAI);
$("qa-input").addEventListener("keydown", e => { if (e.key === "Enter") askAI(); });

async function askAI() {
  const question = $("qa-input").value.trim();
  if (!question) return;
  chrome.storage.local.get("summaryId", async ({ summaryId }) => {
    if (!summaryId) {
      $("qa-history").innerHTML += `<div class="qa-a">⚠️ Generate a summary first.</div>`;
      return;
    }
    $("btn-ask").disabled = true;
    $("qa-input").value   = "";
    $("qa-history").innerHTML += `<div class="qa-q">Q: ${esc(question)}</div>`;
    $("qa-history").innerHTML += `<div class="qa-a" id="qa-pending">⏳ Thinking...</div>`;
    $("qa-history").scrollTop = $("qa-history").scrollHeight;
    try {
      const token   = await getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res  = await fetch(`${API_BASE}/ai/ask`, {
        method: "POST", headers,
        body: JSON.stringify({ summaryId, question })
      });
      const data = await res.json();
      const pending = $("qa-pending");
      if (pending) pending.remove();
      $("qa-history").innerHTML += `<div class="qa-a">${esc(data.answer || data.error || "No answer.")}</div>`;
    } catch {
      const pending = $("qa-pending");
      if (pending) pending.textContent = "❌ Server error.";
    } finally {
      $("btn-ask").disabled = false;
      $("qa-history").scrollTop = $("qa-history").scrollHeight;
    }
  });
}

/* ── COPY OUTPUT ─────────────────────────────────────── */
$("btn-copy").addEventListener("click", () => {
  navigator.clipboard.writeText($("output-box").innerText).then(() => {
    $("btn-copy").textContent = "✅ Copied";
    setTimeout(() => { $("btn-copy").textContent = "📋 Copy"; }, 1500);
  });
});

/* ── EXPORT .TXT ─────────────────────────────────────── */
// Fetches the saved summary from the API and downloads it as a .txt file.
// No chrome.downloads needed — just a Blob + anchor click.
$("btn-export").addEventListener("click", async () => {
  chrome.storage.local.get("summaryId", async ({ summaryId }) => {
    if (!summaryId) return;
    const token = await getToken();
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res  = await fetch(`${API_BASE}/ai/summaries/${summaryId}`, { headers });
      if (!res.ok) throw new Error("Fetch failed");
      const s = await res.json();

      const lines = [
        `Meeting: ${s.meetingTitle}`,
        `Date: ${new Date(s.createdAt).toLocaleString()}`,
        s.participants?.length ? `Participants: ${s.participants.join(", ")}` : null,
        s.tags?.length         ? `Tags: ${s.tags.join(", ")}` : null,
        ``,
        s.summary,
        s.actionItems?.length
          ? `\nAction Items:\n${s.actionItems.map(a => `- ${a}`).join("\n")}`
          : null,
        s.nextMeeting ? `\nNext Meeting: ${s.nextMeeting}` : null
      ].filter(Boolean).join("\n");

      const blob = new Blob([lines], { type: "text/plain" });
      const a    = document.createElement("a");
      a.href     = URL.createObjectURL(blob);
      a.download = `${s.meetingTitle.replace(/\s+/g, "_")}_summary.txt`;
      a.click();
      URL.revokeObjectURL(a.href);

      $("btn-export").textContent = "✅ Saved";
      setTimeout(() => { $("btn-export").textContent = "📥 Export .txt"; }, 2000);
    } catch {
      $("btn-export").textContent = "❌ Failed";
      setTimeout(() => { $("btn-export").textContent = "📥 Export .txt"; }, 2000);
    }
  });
});

/* ── STAR ────────────────────────────────────────────── */
$("btn-star").addEventListener("click", async () => {
  chrome.storage.local.get(["summaryId", "starredState"], async ({ summaryId, starredState }) => {
    if (!summaryId) {
      setOutput("⚠️ Generate a summary first.", true);
      return;
    }
    const newState = !starredState;
    const token    = await getToken();
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/ai/tag/${summaryId}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ starred: newState })
      });
      if (res.ok) setStarUI(newState);
    } catch { /* silent */ }
  });
});

/* ── HISTORY ─────────────────────────────────────────── */
$("btn-history").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:3000/history" });
});
$("btn-starred").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:3000/history?starred=true" });
});

/* ── INIT ────────────────────────────────────────────── */
// On popup open: restore login label, show toolbar buttons if a summary
// exists, and ALWAYS re-fetch the real starred state from the DB so
// changes made on the history page are reflected here immediately.
chrome.storage.local.get(
  ["token", "user", "summaryId", "starredState"],
  ({ token, user, summaryId, starredState }) => {
    const box = $("output-box");
    if (token && user) {
      box.textContent = `✅ Logged in as ${user.email || user.name}. Ready to summarize.`;
    } else {
      box.textContent = `⚠️ Not linked to account. Login at localhost:3000 to save history.`;
    }

    if (summaryId) {
      $("btn-copy").style.display   = "inline-block";
      $("btn-export").style.display = "inline-block";

      // Show cached state immediately so button isn't blank while fetching
      setStarUI(!!starredState);
      // Then overwrite with the live DB value
      syncStarFromDB(summaryId);
    }
  }
);

// Probe captions status on open
sendToTab({ type: "HAS_CAPTIONS" }, res => {
  if (res && res.has) $("status-dot").classList.add("live");
});