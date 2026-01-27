let transcript = new Set();

const observer = new MutationObserver(()=>{
    document.querySelectorAll("span").forEach(el =>{
      const text = el.innerText?.trim();
        if( text &&text.length > 28){
            transcript.add(text);
        }
    });
});
observer.observe(document.body, { childList: true, subtree: true });

// Send transcript to background every 5s
setInterval(() => {
  if (chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: "TRANSCRIPT_UPDATE",
      payload: Array.from(transcript).join(" ")
    });
  }
}, 5000);