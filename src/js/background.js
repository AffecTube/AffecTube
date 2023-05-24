chrome.webNavigation.onCompleted.addListener((details) => {
  console.log("HIST")
  chrome.tabs.get(details.tabId, function(tab) {
    if (tab.url && tab.url.includes("watch?v")) {
      const queryParameters = tab.url.split("?")[1];
      const urlParameters = new URLSearchParams(queryParameters);
      const urlParameterVideo = urlParameters.get("v");
      
      chrome.tabs.sendMessage(details.tabId, {
        type: "init",
        videoURL: urlParameterVideo,
      });
    }
  });
});