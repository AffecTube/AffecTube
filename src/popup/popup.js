async function getCurrentTabURL() {
  const tabs = await chrome.tabs.query({
      currentWindow: true,
      active: true
  });
  return tabs[0];
}

function getUsername() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("nickname", (result) => {
      resolve(result && result.nickname ? result.nickname : null);
    });
  });
};

function setUsername(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(data, () => {
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve();
    });
  });
};

async function addLabel(table, labelObj) {
  const tab = await getCurrentTabURL();
  const newRow = table.insertRow(-1);
  newRow.id = "content-" + labelObj.id;
  newRow.setAttribute("id", labelObj.id);

  const startTimeCell = newRow.insertCell(0);
  const startTimeInput = document.createElement("input");
  startTimeInput.type = "text";
  startTimeInput.value = labelObj.startTime;
  startTimeInput.addEventListener('input', updateStartTime);
  startTimeInput.addEventListener('click', (inputObj) => {
    chrome.tabs.sendMessage(tab.id, {
      type: "rewindPlayer",
      time: inputObj.target.value,
    });
  });
  startTimeCell.appendChild(startTimeInput);

  const startTimeSyncButton = document.createElement("img");
  startTimeSyncButton.src = "../.././assets/sync.png";
  startTimeSyncButton.addEventListener("click", updateStartTimeToCurrent);
  startTimeCell.appendChild(startTimeSyncButton);

  
  const endTimeCell = newRow.insertCell(1);
  const endTimeInput = document.createElement("input");
  endTimeInput.type = "text";
  endTimeInput.value = labelObj.endTime;
  endTimeInput.addEventListener('input', updateEndTime);
  endTimeInput.addEventListener('click', (inputObj) => {
    chrome.tabs.sendMessage(tab.id, {
      type: "rewindPlayer",
      time: inputObj.target.value,
    });
  });
  endTimeCell.appendChild(endTimeInput);

  if (Number(labelObj.endTime) < Number(labelObj.startTime)) {
    startTimeInput.style.backgroundColor = "red";
    endTimeInput.style.backgroundColor = "red";
  }

  const endTimeSyncButton = document.createElement("img");
  endTimeSyncButton.src = "../.././assets/sync.png";
  endTimeSyncButton.addEventListener("click", updateEndTimeToCurrent);
  endTimeCell.appendChild(endTimeSyncButton);


  const codeCell = newRow.insertCell(2);
  codeCell.innerHTML = labelObj.label;

  const deleteButton = document.createElement("img");
  deleteButton.src = "../.././assets/delete.png";
  deleteButton.addEventListener("click", deleteLabelButtonClicked);
  const btnCell = newRow.insertCell(3);
  btnCell.appendChild(deleteButton);
}

async function updateStartTime(inputObj) {
  const tab = await getCurrentTabURL();
  const id = inputObj.target.parentNode.parentNode.getAttribute("id");

  chrome.tabs.sendMessage(tab.id, {
    type: "updateStartTime",
    value: id,
    time: inputObj.target.value
  });
}

async function updateEndTime(inputObj) {
  const tab = await getCurrentTabURL();
  const id = inputObj.target.parentNode.parentNode.getAttribute("id");

  chrome.tabs.sendMessage(tab.id, {
    type: "updateEndTime",
    value: id,
    time: inputObj.target.value
  });
}

async function updateStartTimeToCurrent(inputObj) {
  const tab = await getCurrentTabURL();
  const id = inputObj.target.parentNode.parentNode.getAttribute("id");

  chrome.tabs.sendMessage(tab.id, {
    type: "syncStartTime",
    value: id
  }, showPopup);
}

async function updateEndTimeToCurrent(inputObj) {
  const tab = await getCurrentTabURL();
  const id = inputObj.target.parentNode.parentNode.getAttribute("id");

  chrome.tabs.sendMessage(tab.id, {
    type: "syncEndTime",
    value: id
  }, showPopup);
}

async function deleteLabelButtonClicked(labelObj) {
  const tab = await getCurrentTabURL();
  const id = labelObj.target.parentNode.parentNode.getAttribute("id");

  chrome.tabs.sendMessage(tab.id, {
    type: "delete",
    value: id,
  }, showPopup);
}

async function setUsernameButtonClicked() {
  const loginInput = document.getElementById("loginInput");
  if (loginInput.value) {
    setUsername({"nickname" : loginInput.value});
    loginInput.placeholder = loginInput.value;
    loginInput.value = "";
    document.getElementById("labeling").removeAttribute("hidden");
    document.getElementById("loginButton").innerText = "Update";
  }
}

async function uploadButtonClicked() {
  const tab = await getCurrentTabURL();
  chrome.tabs.sendMessage(tab.id, {
    type: "upload",
  });
  clearContent(document.getElementById("content"));
}

function clearContent(table) {
  table.innerHTML = "";
  const newRow = table.insertRow(-1);
  newRow.insertCell(0).innerHTML = "-";
  newRow.insertCell(1).innerHTML = "-";
  newRow.insertCell(2).innerHTML = "-";
  newRow.insertCell(3).innerHTML = "-";
}

function showPopup(savedLabels=[]) {
  const contentElement = document.getElementById("content");
  contentElement.innerHTML = "";

  if (savedLabels.length < 1)
    clearContent(contentElement);

  for (let i = 0; i < savedLabels.length; i++)
    addLabel(contentElement, savedLabels[i]);
}

document.addEventListener("DOMContentLoaded", async () => {
  const tab = await getCurrentTabURL();
  const username = await getUsername();
  const queryParameters = tab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);
  const urlParameterVideo = urlParameters.get("v");

  const saveButton = document.getElementById("saveButton");
  saveButton.addEventListener("click", uploadButtonClicked);
  const loginButton = document.getElementById("loginButton");
  loginButton.addEventListener("click", setUsernameButtonClicked);

  if (username) {
    const loginInput = document.getElementById("loginInput");
    loginInput.placeholder = username;
    document.getElementById("labeling").removeAttribute("hidden");
    document.getElementById("loginButton").innerText = "Update";
  }

  if (tab.url && tab.url.includes("watch?v") && urlParameterVideo) {
    chrome.storage.sync.get([urlParameterVideo], (data) => {
      if (data[urlParameterVideo]) {
        showPopup(JSON.parse(data[urlParameterVideo]));
      }
    });
  }
});
