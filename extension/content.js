let transcript = [];
let captionBuffer = "";
let lastCommitted = "";
const MAX_CAPTIONS = 40;

const observer = new MutationObserver(() => {
  document.querySelectorAll('[jsname="YSxPC"] span').forEach(el => {
    const text = el.innerText?.trim();

    if (!text || text.length < 3) return;

    if (captionBuffer && text.startsWith(captionBuffer)) {
      captionBuffer = text;
      return;
    }

    if (captionBuffer && captionBuffer !== lastCommitted) {
      transcript.push(captionBuffer);
      lastCommitted = captionBuffer;
    }

    captionBuffer = text;
  });

  if (transcript.length > MAX_CAPTIONS) {
    transcript = transcript.slice(-MAX_CAPTIONS);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === "GET_TRANSCRIPT") {
    const toSend = [...transcript];
    if (captionBuffer && captionBuffer !== lastCommitted) {
      toSend.push(captionBuffer);
      lastCommitted = captionBuffer;
    }

    sendResponse({ transcript: toSend.join(" ") });

    transcript = [];
    captionBuffer = "";
  }
});

