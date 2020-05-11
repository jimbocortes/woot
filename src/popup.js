chrome.storage.local.get(["status"], function ({ status }) {
  if (status === "recording") {
    // show recording panel
    const recording = document.querySelector(".recording");
    recording.classList.remove("hide");

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      console.log(request);
      if (request.cmd === "elapsedRecordingTime") {
        const elapsedTime = document.querySelector(".elapsed-time");
        elapsedTime.textContent = request.time;
      }
    });
  } else {
    // show pre-recording panel
    const preRecording = document.querySelector(".pre-recording");
    preRecording.classList.remove("hide");
    chrome.browserAction.setBadgeText({ text: "" });
  }
});

const startRecordingBtn = document.getElementById("start-recording");
startRecordingBtn.addEventListener("click", (e) => {
  chrome.runtime.sendMessage({ cmd: "startRecording" });
  window.close();
});

const stopRecordingBtn = document.getElementById("stop-recording");
stopRecordingBtn.addEventListener("click", (e) => {
  chrome.storage.local.get(["status"], function ({ status }) {
    if (status === "recording") {
      chrome.runtime.sendMessage({ cmd: "stopRecording" }, function () {
        chrome.runtime.openOptionsPage();
      });
    }
  });
});
