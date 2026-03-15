// authSync.js — runs in MAIN world so it can read localStorage directly

function syncFromLocalStorage() {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      // Send to background via custom event (MAIN world can't use chrome.storage directly)
      document.dispatchEvent(new CustomEvent("MEETSCRIBE_SYNC", {
        detail: { type: "LOGIN", token, user }
      }));
    } catch (e) {}
  } else {
    document.dispatchEvent(new CustomEvent("MEETSCRIBE_SYNC", {
      detail: { type: "LOGOUT" }
    }));
  }
}

syncFromLocalStorage();

// Also re-sync on storage changes (when user logs in/out)
window.addEventListener("storage", () => syncFromLocalStorage());

// Listen for manual postMessage triggers from login page
window.addEventListener("message", (event) => {
  if (event.origin !== "http://localhost:3000") return;
  if (event.data?.type === "MEETSCRIBE_LOGIN" || event.data?.type === "MEETSCRIBE_LOGOUT") {
    syncFromLocalStorage();
  }
});