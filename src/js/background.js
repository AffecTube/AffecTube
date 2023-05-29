function sendInitMessage(url, tabId){
  if (url && url.includes("watch?v")) {
    const queryParameters = url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const urlParameterVideo = urlParameters.get("v");
    
    chrome.tabs.sendMessage(tabId, {
      type: "init",
      videoURL: urlParameterVideo,
    });
  }
}

/* Launched by entering a direct URL */
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  sendInitMessage(tab.url, tabId);
});

/* Launched when reloading a YouTube video page or navigating on the YouTube site. */
chrome.webNavigation.onCompleted.addListener((details) => {
  chrome.tabs.get(details.tabId, function(tab) {
    sendInitMessage(tab.url, details.tabId);
  });
});