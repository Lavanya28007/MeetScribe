const API_BASE = "http://localhost:5000/api/ai";
const buttons = document.querySelectorAll("button");
const spinner = document.getElementById("spinner");
const output = document.getElementById("output");

function setLoading(isLoading) {
  spinner.style.display = isLoading ? "block" : "none";
  buttons.forEach(btn => (btn.disabled = isLoading));
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

async function handleAction(endpoint) {
  try {
    setLoading(true);
    output.textContent = "⏳ Processing...";

    // 1️⃣ Ask background for transcript
    chrome.runtime.sendMessage(
      { type: "GET_TRANSCRIPT" },
      async (response) => {
        if (!response || !response.transcript) {
          output.textContent = "⚠️ No transcript found. Turn captions ON.";
          setLoading(false);
          return;
        }

        // 2️⃣ Send transcript to backend
        console.log(response.transcript);
        const res = await fetch(`http://localhost:5000/api/ai/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: response.transcript,
            meetingTitle: document.title || "Google Meet"
          })
        });

        if (!res.ok) throw new Error("Backend error");

        const data = await res.json();

        // 3️⃣ Show result
        output.textContent = data.output || "No response";
        showToast("Success!", "success");
        setLoading(false);
      }
    );

  } catch (err) {
    console.error(err);
    output.textContent = "❌ Something went wrong.";
    showToast("Error occurred", "error");
    setLoading(false);
  }
}


const summarizeBtn = document.getElementById("summarize");
if (summarizeBtn) {
  summarizeBtn.addEventListener("click", async () => {
    setLoading(true);
    output.textContent = "⏳ Processing...";

    chrome.runtime.sendMessage(
      { type: "GET_TRANSCRIPT" },
      async (response) => {
        if (!response || !response.transcript) {
          output.textContent = "⚠️ No transcript found. Turn captions ON.";
          setLoading(false);
          return;
        }

        try {
          console.log(response.transcript);
          const res = await fetch("http://localhost:5000/api/ai/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              meetingTitle: "Google Meet",
              transcript: response.transcript
            })
          });

          if (!res.ok) throw new Error("Backend error");
          const data = await res.json();

          // 🔑 SAVE summaryId
          if (data && data.summaryId) localStorage.setItem("summaryId", data.summaryId);

          // Show summary in UI
          output.textContent = data.output || "No output";
          showToast("Summary generated!", "success");
        } catch (err) {
          console.error("Summarize failed", err);
          output.textContent = "❌ Summarize failed";
          showToast("Error: " + err.message, "error");
        }
        setLoading(false);
      }
    );
  });
}



const actionsBtn = document.getElementById("actions");
if (actionsBtn) {
  actionsBtn.addEventListener("click", async () => {
    const summaryId = localStorage.getItem("summaryId");

    if (!summaryId) {
      showToast("Please generate summary first", "error");
      return;
    }

    setLoading(true);
    output.textContent = "⏳ Processing...";

    chrome.runtime.sendMessage(
      { type: "GET_TRANSCRIPT" },
      async (response) => {
        if (!response || !response.transcript) {
          output.textContent = "⚠️ No transcript found. Turn captions ON.";
          setLoading(false);
          return;
        }

        try {
          console.log(response.transcript);
          const res = await fetch("http://localhost:5000/api/ai/action-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transcript: response.transcript,
              summaryId
            })
          });

          if (!res.ok) throw new Error("Backend error");
          const data = await res.json();

          output.textContent = data.output || "No output";
          showToast("Action items generated!", "success");
        } catch (err) {
          console.error("Action items failed", err);
          output.textContent = "❌ Action items failed";
          showToast("Error: " + err.message, "error");
        }
        setLoading(false);
      }
    );
  });
}


async function handleAI(endpoint) {
  const output = document.getElementById("output");
  output.innerText = "⏳ Processing...";

  chrome.runtime.sendMessage(
    { type: "GET_TRANSCRIPT" },
    async (response) => {
      if (!response || !response.transcript) {
        output.innerText = "⚠️ No transcript found. Turn captions ON.";
        return;
      }

      try {
        console.log(response.transcript);
        const res = await fetch(`${API_BASE}/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: response.transcript
          })
        });

        const data = await res.json();
        output.innerText = data.output || "No response";
      } catch (err) {
        output.innerText = "❌ Failed to reach backend";
      }
    }
  );
}


