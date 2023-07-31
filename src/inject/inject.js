class DataUploaderAPI {
  constructor() {
    this.urlApi = "https://labelling-api.affectivese.org/LabelingEmotionsDatabase/";
  }

  uploadData(data, onSuccess, onFailure) {
    return fetch(
      this.urlApi + crypto.randomUUID().toString() + ".json",
      {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    ).then((res) => {
      console.log("Upload status: " + res.statusText);
      if (res.ok) {
        onSuccess.forEach((onSuccessCallback) => {
          onSuccessCallback();
        });
      }
      else
      {
        onFailure.forEach((onFailureCallback) => {
          onFailureCallback();
        });
      }
    });
  }
}

class DataUploaderGithub {
  constructor() {
    this.urlApi = "https://api.github.com/repos/danielkulas/LabelingEmotionsDatabase/contents/";
    this.token1 = "11AJOQWMQ0p2ptv7D9hBch";
    this.token2 = "rAFk3RfO94NyVncAT9pYdeej0NGnC7U0jWqJtMOu9WwI7V2AKEQ7NDzFrGt";
  }

  uploadData(data, onSuccess, onFailure) {
    return fetch(
      this.urlApi + crypto.randomUUID().toString() + ".json",
      {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: "Bearer " + "github_pat_" + this.token1 + "_" + this.token2
        },
        body: JSON.stringify({
          message: "Data uploaded from API",
          content: btoa(data)
        })
      }
    ).then((res) => {
      console.log("Upload status: " + res.statusText);
      if (res.ok) {
        onSuccess.forEach((onSuccessCallback) => {
          onSuccessCallback();
        });
      }
      else
      {
        onFailure.forEach((onFailureCallback) => {
          onFailureCallback();
        });
      }
    });
  }
}


class PlayerManager {
  constructor() {
    this.videoClassName = "video-stream html5-main-video";
    this.emotionsContainterClassName = "ytp-left-controls";
  }

  getVideoPlayer() {
    return document.getElementsByClassName(this.videoClassName)[0];
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
  let emotionsButtonStates = Array.apply(null, Array(emotions.length)).map(e => -1);
  let savedLabels = [];
  let videoPlayer;
  let videoURL;

  const dataUploader = new DataUploaderAPI();
  //const dataUploader = new DataUploaderGithub();
  const playerManager = new PlayerManager();
  const chromeStorage = new ChromeStorageManager();

  
  async function addNewLabelClicked(event) {
    savedLabels = await chromeStorage.syncLabels(videoURL);
    var emotionID = emotions.findIndex(e => e == event.srcElement.id);

    var lastGlobalIDObj = await chromeStorage.getStorageData2('lastGlobalID');
    var lastGlobalID = lastGlobalIDObj.lastGlobalID;
    if (!lastGlobalID)
      lastGlobalID = 0;

    if (emotionsButtonStates[emotionID] == -1) {
      event.target.style.backgroundColor = "#780c0c";

      lastGlobalID++;
      await chromeStorage.setStorageData({'lastGlobalID' : lastGlobalID});

      var newLabel = {
        id: lastGlobalID,
        startTime: videoPlayer.currentTime.toFixed(2),
        endTime: videoPlayer.currentTime.toFixed(2),
        label: event.srcElement.id
      };

      chrome.storage.sync.set({[videoURL]: JSON.stringify([...savedLabels, newLabel].sort((a, b) => a.startTime - b.startTime))});
      emotionsButtonStates[emotionID] = lastGlobalID;
    }
    else {
      event.target.style.backgroundColor = "#5c5a59";

      var obj = savedLabels.find(e => e.id == emotionsButtonStates[emotionID]);
      if (obj) {
        obj.endTime = videoPlayer.currentTime.toFixed(2),
        chrome.storage.sync.set({[videoURL]: JSON.stringify([...savedLabels].sort((a, b) => a.startTime - b.startTime))});
      }
      emotionsButtonStates[emotionID] = -1;
    }
  }

  async function upload() {
    let labels = await chromeStorage.syncLabels(videoURL);
    labels.forEach(e => delete e.id);
    const nickname = await chromeStorage.getStorageData('nickname');
    const url = {"videoURL" : videoURL}
    const merged = {...url, ...nickname, ...labels}

    dataUploader.uploadData(
      JSON.stringify(merged),
      [() => chrome.storage.sync.remove([videoURL]), () => alert("The data has been successfully uploaded")],
      [() => alert("Something went wrong...")]
    );
  }

  function initialize(newVideoURL) {
    savedLabels = chromeStorage.syncLabels(newVideoURL);

    videoURL = newVideoURL;
    videoPlayer = playerManager.getVideoPlayer();
    var buttonsContainer = playerManager.getEmotionsContainer();
    var emotionButton = document.getElementsByClassName("emotionButton")[0];

    if (!emotionButton && buttonsContainer) {
      var emotionButtonsContainer = document.createElement("div");
      emotionButtonsContainer.className = "emotionButtonsContainer";
      emotionButtonsContainer.id = "emotionButtonsContainer";
      emotionButtonsContainer.removeAttribute("hidden");
      emotionButtonsContainer.style.marginRight = "0px";
      buttonsContainer.appendChild(emotionButtonsContainer);

      for (let i = 0; i < emotions.length; i++) {
        var emotionButton = document.createElement("button");
        emotionButton.innerHTML = emotions[i];

        emotionButton.className = "ytp-button " + "emotionButton";
        emotionButton.id = emotions[i];
        emotionButton.addEventListener("click", addNewLabelClicked);

        emotionButton.style.backgroundColor = "#5c5a59";
        emotionButton.style.border = "none";
        emotionButton.style.color = "white";
        emotionButton.style.padding = "10px 10px";
        emotionButton.style.textAlign = "center";
        emotionButton.style.textDecoration = "none";
        emotionButton.style.display = "inline-block";
        emotionButton.style.fontSize = "16px";
        emotionButton.style.borderRadius = "4px";
        emotionButton.style.cursor = "pointer";
        emotionButton.style.width = "96px";
        emotionButton.style.height = "32px";
        emotionButton.style.marginLeft = "2px";
        emotionButton.style.lineHeight = "16px";

        emotionButtonsContainer.appendChild(emotionButton);
      }
    }
  }

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    (async () => {
      if (obj.type != "init")
        savedLabels = await chromeStorage.syncLabels(videoURL);

      switch (obj.type) {
        case "init":
          //chromeStorage.resetStorage();
          initialize(obj.videoURL);
          response();
          break;
        case "updateStartTime":
          var objToUpdate = savedLabels.find(e => e.id == obj.value);
          if (objToUpdate) {
            objToUpdate.startTime = obj.time;
            chrome.storage.sync.set({[videoURL]: JSON.stringify(savedLabels)});
          }
          response();
          break;
        case "updateEndTime":
          var objToUpdate = savedLabels.find(e => e.id == obj.value);
          if (objToUpdate) {
            objToUpdate.endTime = obj.time;
            chrome.storage.sync.set({[videoURL]: JSON.stringify(savedLabels)});
          }
          response();
          break;
        case "syncStartTime":
          var objToUpdate = savedLabels.find(e => e.id == obj.value);
          if (objToUpdate) {
            objToUpdate.startTime = videoPlayer.currentTime.toFixed(2);
            chrome.storage.sync.set({[videoURL]: JSON.stringify(savedLabels)});
          }
          response(savedLabels);
          break;
        case "syncEndTime":
          var objToUpdate = savedLabels.find(e => e.id == obj.value);
          if (objToUpdate) {
            objToUpdate.endTime = videoPlayer.currentTime.toFixed(2);
            chrome.storage.sync.set({[videoURL]: JSON.stringify(savedLabels)});
          }
          response(savedLabels);
          break;
        case "rewindPlayer":
          videoPlayer.currentTime = obj.time;
          response();
          break;
        case "delete":
          savedLabels = savedLabels.filter((b) => b.id != obj.value);
          chrome.storage.sync.set({[videoURL]: JSON.stringify(savedLabels)});
          response(savedLabels);
          break;
        case "upload":
          upload();
          response();
          break;
      }
    })();

    return true;
  });
})();
  