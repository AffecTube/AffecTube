class DataUploader {
  constructor() {
    this.urlApi = "https://api.github.com/repos/danielkulas/LabelingEmotionsDatabase/contents/";
    this.token = "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";
  }

  uploadData(data, onUploaded) {
    return fetch(
      this.urlApi + crypto.randomUUID().toString() + ".json",
      {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: "Bearer " + this.token
        },
        body: JSON.stringify({
          message: "Data uploaded from API",
          content: data
        })
      }
    ).then((res) => {
      console.log("Upload status: " + res.statusText);
      if (res.ok)
        onUploaded();
    });
  }
}

class PlayerManager {
  constructor() {
    this.videoClassName = "video-stream html5-main-video";
    this.emotionsContainterClassName = "ytp-left-controls";
  }

  getVideoPlayer() {
    var videoPlayers = document.getElementsByClassName(this.videoClassName);
    var videoPlayer;

    for (let i = 0; i < videoPlayers.length; i++) {
      let thisVideoRect = videoPlayers[i].getBoundingClientRect();
      if (thisVideoRect.width != 0 && thisVideoRect.height != 0) {
        videoPlayer = videoPlayers[i];
        break;
      }
    }

    return videoPlayer;
  }

  getEmotionsContainer() {
    return document.getElementsByClassName(this.emotionsContainterClassName)[0];
  }
}

class ChromeStorageManager {
  constructor() {

  }

  syncLabels(videoURL) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([videoURL], (obj) => {
        resolve(obj[videoURL] ? JSON.parse(obj[videoURL]) : []);
      });
    });
  };

  setStorageData(data) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(data, () => {
        chrome.runtime.lastError
          ? reject(Error(chrome.runtime.lastError.message))
          : resolve();
      });
    });
  };

  getStorageData(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([key], (result) => {
        chrome.runtime.lastError
          ? reject(Error(chrome.runtime.lastError.message))
          : resolve(result);
      });
    });
  };

  getStorageData2(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(key, (result) => {
        chrome.runtime.lastError
          ? reject(Error(chrome.runtime.lastError.message))
          : resolve(result);
      });
    });
  };

  resetStorage() {
    chrome.storage.sync.clear();
  }
}

(() => {
  let emotions = ["happiness", "sadness", "disgust", "fear", "surprise", "anger", "confusion"];
  let savedLabels = [];
  let videoPlayer;
  let videoURL;
  let lastID = -1;
  const dataUploader = new DataUploader();
  const playerManager = new PlayerManager();
  const chromeStorage = new ChromeStorageManager();


  async function addNewLabelClicked(event) {
    savedLabels = await chromeStorage.syncLabels(videoURL);
    var lastGlobalIDObj = await chromeStorage.getStorageData2('lastGlobalID');
    var lastGlobalID = lastGlobalIDObj.lastGlobalID;
    if (!lastGlobalID)
      lastGlobalID = 0;

    if (lastGlobalID != lastID) {
      document.getElementById("emotionButtonsContainer").setAttribute("hidden", "");
      document.getElementById("stopButtonsContainer").removeAttribute("hidden");
      var index = emotions.findIndex(e => e == event.srcElement.id) * 98;
      document.getElementById("stopButton").style.marginLeft = index.toString() + "px";

      lastGlobalID++;
      await chromeStorage.setStorageData({'lastGlobalID' : lastGlobalID});

      var newLabel = {
        id: lastGlobalID,
        startTime: videoPlayer.currentTime.toFixed(2),
        endTime: videoPlayer.currentTime.toFixed(2),
        label: event.srcElement.id
      };

      chrome.storage.sync.set({[videoURL]: JSON.stringify([...savedLabels, newLabel].sort((a, b) => a.startTime - b.startTime))});
      lastID = lastGlobalID;
    }
    else {
      document.getElementById("emotionButtonsContainer").removeAttribute("hidden");
      document.getElementById("stopButtonsContainer").setAttribute("hidden", "");

      var obj = savedLabels.find(e => e.id == lastID);
      if (obj) {
        obj.endTime = videoPlayer.currentTime.toFixed(2),
        chrome.storage.sync.set({[videoURL]: JSON.stringify([...savedLabels].sort((a, b) => a.startTime - b.startTime))});
      }
      lastID = -1;
    }
  }

  async function upload() {
    let labels = await chromeStorage.syncLabels(videoURL);
    labels.forEach(e => delete e.id);
    const nickname = await chromeStorage.getStorageData('nickname');
    const url = {"videoURL" : videoURL}
    const merged = {...url, ...nickname, ...labels}

    dataUploader.uploadData(btoa(JSON.stringify(merged)), () => chrome.storage.sync.remove([videoURL]));
  }

  function initialize(newVideoURL) {
    videoURL = newVideoURL;
    videoPlayer = playerManager.getVideoPlayer();
    var buttonsContainer = playerManager.getEmotionsContainer();
    var emotionButton = document.getElementsByClassName("emotionButton")[0];

    if (!emotionButton && buttonsContainer) {
      var buttonsToStyle = [];
      var emotionButtonsContainer = document.createElement("div");
      emotionButtonsContainer.className = "emotionButtonsContainer";
      emotionButtonsContainer.id = "emotionButtonsContainer";
      emotionButtonsContainer.removeAttribute("hidden");
      emotionButtonsContainer.style.marginRight = "0px";
      buttonsContainer.appendChild(emotionButtonsContainer);
      var stopButtonsContainer = document.createElement("div");
      stopButtonsContainer.className = "stopButtonsContainer";
      stopButtonsContainer.id = "stopButtonsContainer";
      stopButtonsContainer.setAttribute("hidden", "");
      buttonsContainer.appendChild(stopButtonsContainer);

      for (let i = 0; i < emotions.length; i++) {
        var emotionButton = document.createElement("button");
        emotionButton.innerHTML = emotions[i];

        emotionButton.className = "ytp-button " + "emotionButton";
        emotionButton.id = emotions[i];
        emotionButton.addEventListener("click", addNewLabelClicked);

        buttonsToStyle.push(emotionButton);
        emotionButtonsContainer.appendChild(emotionButton);
      }

      var stopButton = document.createElement("button");
      stopButton.innerHTML = "stop";
      stopButton.className = "stopButton";
      stopButton.id = "stopButton";
      stopButton.addEventListener("click", addNewLabelClicked);
      buttonsToStyle.push(stopButton);
      stopButtonsContainer.appendChild(stopButton);

      for (let i = 0; i < buttonsToStyle.length; i++) {
        var button = buttonsToStyle[i];
        button.style.backgroundColor = "#6c7a89";
        button.style.border = "none";
        button.style.color = "white";
        button.style.padding = "10px 20px";
        button.style.textAlign = "center";
        button.style.textDecoration = "none";
        button.style.display = "inline-block";
        button.style.fontSize = "16px";
        button.style.borderRadius = "4px";
        button.style.cursor = "pointer";
        button.style.width = "96px";
        button.style.height = "32px";
        button.style.marginLeft = "2px";
        button.style.lineHeight = "16px";
      }
    }
  }

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    switch (obj.type) {
      case "init":
        //chromeStorage.resetStorage();
        initialize(obj.videoURL);
        break;
      case "updateStartTime":
        var objToUpdate = savedLabels.find(e => e.id == obj.value);
        if (objToUpdate) {
          objToUpdate.startTime = obj.time;
          chrome.storage.sync.set({[videoURL]: JSON.stringify(savedLabels)});
        }
        break;
      case "updateEndTime":
        var objToUpdate = savedLabels.find(e => e.id == obj.value);
        if (objToUpdate) {
          objToUpdate.endTime = obj.time;
          chrome.storage.sync.set({[videoURL]: JSON.stringify(savedLabels)});
        }
        break;
      case "syncStartTime":
        var objToUpdate = savedLabels.find(e => e.id == obj.value);
        if (objToUpdate) {
          objToUpdate.startTime = videoPlayer.currentTime.toFixed(2);
          chrome.storage.sync.set({[videoURL]: JSON.stringify(savedLabels)});
          response(savedLabels);
        }
        break;
      case "syncEndTime":
        var objToUpdate = savedLabels.find(e => e.id == obj.value);
        if (objToUpdate) {
          objToUpdate.endTime = videoPlayer.currentTime.toFixed(2);
          chrome.storage.sync.set({[videoURL]: JSON.stringify(savedLabels)});
          response(savedLabels);
        }
        break;
      case "rewindPlayer":
        videoPlayer.currentTime = obj.time;
        break;
      case "delete":
        savedLabels = savedLabels.filter((b) => b.id != obj.value);
        chrome.storage.sync.set({[videoURL]: JSON.stringify(savedLabels)});
        response(savedLabels);
        break;
      case "upload":
        upload();
        break;
    }
  });
})();
  