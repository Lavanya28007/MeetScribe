let meetinngTrancript = "";

chrome.runtime.onMessage.addListener((msg, sender, sendRespone) =>{
    if(msg.type ==="TRANSCRIPT_UPDATE"){
        meetinngTrancript = msg.payload;
    }
    if(msg.type === "GET_TRANSCRIPT"){
        sendRespone({transcript: meetinngTrancript});
    }
});

