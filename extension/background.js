let meetTabId = null;

/* ---------- Startup ---------- */

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.session.get("meetTabId", ({ meetTabId: saved }) => {
    if (saved) meetTabId = saved;
  });
  findMeetTab();
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.session.get("meetTabId", ({ meetTabId: saved }) => {
    if (saved) meetTabId = saved;
  });
  findMeetTab();
});

/* ---------- Only track actual Meet call tabs, not /landing ---------- */

function isMeetCall(url) {
  if (!url) return false;
  return /meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(url);
}

function findMeetTab() {
  chrome.tabs.query({}, tabs => {
    for (const tab of tabs) {
      if (isMeetCall(tab.url)) {
        setMeetTab(tab.id);
        console.log("🟢 findMeetTab: found call tab", tab.id, tab.url);
        return;
      }
    }
    console.warn("🟡 findMeetTab: no active Meet call tab found");
  });
}

function setMeetTab(id) {
  meetTabId = id;
  chrome.storage.session.set({ meetTabId: id });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isMeetCall(tab.url)) {
    console.log("🟢 onUpdated: Meet call tab", tabId);
    setMeetTab(tabId);
  }
  if (tabId === meetTabId && tab.url && !isMeetCall(tab.url)) {
    console.log("🟡 onUpdated: left call, clearing meetTabId");
    meetTabId = null;
    chrome.storage.session.remove("meetTabId");
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === meetTabId) {
    console.log("🔴 Meet tab closed");
    meetTabId = null;
    chrome.storage.session.remove("meetTabId");
  }
});

/* ---------- Resolve Meet tab ---------- */

function resolveMeetTab(cb) {
  if (meetTabId) { cb(meetTabId); return; }
  chrome.storage.session.get("meetTabId", ({ meetTabId: saved }) => {
    if (saved) { meetTabId = saved; cb(meetTabId); return; }
    chrome.tabs.query({}, tabs => {
      for (const tab of tabs) {
        if (isMeetCall(tab.url)) {
          setMeetTab(tab.id);
          cb(meetTabId);
          return;
        }
      }
      console.error("❌ No active Meet call tab found");
      cb(null);
    });
  });
}

/* ---------- Inject content script if not already running ---------- */

function ensureContentScript(tabId, cb) {
  // Ping the tab — if content.js is alive it replies with {pong: true}
  chrome.tabs.sendMessage(tabId, { type: "PING" }, (response) => {
    if (!chrome.runtime.lastError && response && response.pong) {
      cb(null); // already running
      return;
    }
    // Not injected yet — inject programmatically (handles pre-existing tabs)
    console.log("💉 Injecting content.js into tab", tabId);
    chrome.scripting.executeScript(
      { target: { tabId: tabId }, files: ["content.js"] },
      () => {
        if (chrome.runtime.lastError) {
          console.error("❌ Injection failed:", chrome.runtime.lastError.message);
          cb(chrome.runtime.lastError);
          return;
        }
        console.log("✅ content.js injected into tab", tabId);
        setTimeout(() => cb(null), 800); // wait for script to initialise
      }
    );
  });
}

/* ---------- Message relay ---------- */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  resolveMeetTab(tabId => {
    if (!tabId) {
      console.warn("❌ No Meet tab to relay to");
      sendResponse(msg.type === "GET_TRANSCRIPT" ? { transcript: "" } : { has: false });
      return;
    }

    ensureContentScript(tabId, (err) => {
      if (err) {
        sendResponse(msg.type === "GET_TRANSCRIPT" ? { transcript: "" } : { has: false });
        return;
      }

      chrome.tabs.sendMessage(tabId, { type: msg.type }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("❌ Relay error:", chrome.runtime.lastError.message);
          meetTabId = null;
          chrome.storage.session.remove("meetTabId");
          sendResponse(msg.type === "GET_TRANSCRIPT" ? { transcript: "" } : { has: false });
          return;
        }
        console.log("✅ Response:", JSON.stringify(response));
        sendResponse(response);
      });
    });
  });

  return true;
});