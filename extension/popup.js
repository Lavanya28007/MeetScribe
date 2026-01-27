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

// Generic handler (easy to plug backend later)
async function handleAction(actionType) {
  try {
    setLoading(true);
    output.textContent = "Processing...";

    // 🔌 Replace this with chrome.tabs / backend call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = `${actionType} completed successfully`;
    output.textContent = result;
    showToast("Success!", "success");

  } catch (err) {
    output.textContent = "Something went wrong.";
    showToast("Error occurred", "error");
  } finally {
    setLoading(false);
  }
}

document
  .getElementById("summarize")
  .addEventListener("click", () => handleAI("summarize"));

document
  .getElementById("actions")
  .addEventListener("click", () => handleAI("action-items"));

document
  .getElementById("Document")
  .addEventListener("click", () => handleAI("generate-docs")); 

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
