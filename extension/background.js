chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_TRANSCRIPT") {
    // Get active tab and forward request to content.js
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "GET_TRANSCRIPT" }, (response) => {
          sendResponse(response || { transcript: "" });
        });
      } else {
        sendResponse({ transcript: "" });
      }
    });
    return true; // Keep channel open for async response
  }
});

