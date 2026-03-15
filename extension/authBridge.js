// authBridge.js — runs in ISOLATED world (has chrome.storage access)
// Listens for CustomEvents from authSync.js and saves to chrome.storage.local

document.addEventListener("MEETSCRIBE_SYNC", (event) => {
  const { type, token, user } = event.detail;

  if (type === "LOGIN" && token && user) {
    chrome.storage.local.set({ token, user }, () => {
      console.log("✅ MeetScribe: token saved for", user.email);
    });
  }

  if (type === "LOGOUT") {
    chrome.storage.local.remove(["token", "user"], () => {
      console.log("✅ MeetScribe: token cleared");
    });
  }
});