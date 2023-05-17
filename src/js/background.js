chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("watch?v")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const urlParameterVideo = urlParameters.get("v");
    
    chrome.tabs.sendMessage(tabId, {
      type: "init",
      videoURL: urlParameterVideo,
    });
  }
});
