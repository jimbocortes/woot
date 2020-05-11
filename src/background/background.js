let elapsedTimer;
const screenRecorder = new ScreenRecorder();
screenRecorder.onstop = function (err) {
  if (!err) {
    console.log("stopppeddd!");
    clearInterval(elapsedTimer);
    chrome.storage.local.remove(["status"]);
    chrome.storage.local.set({ url: screenRecorder.recording });
  }
};

console.log("New screenRecorder", screenRecorder);

const startCountdown = () => {
  let timing = 4;
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ status: "pending" }, function () {
      console.log("Pending...");
      const timer = setInterval(() => {
        timing -= 1;
        if (timing > 0) {
          chrome.browserAction.setBadgeBackgroundColor({
            color: "#F9C70C",
          });
          chrome.browserAction.setBadgeText({
            text: `${timing}`,
          });
        } else {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });
};

const trackElapsedTime = () => {
  let seconds = -1;

  const formattedTime = (seconds) => {
    const min = `${Math.round(seconds / 60)}`.padStart(2, "0");
    const sec = `${Math.round(seconds % 60)}`.padStart(2, "0");
    return `${min}:${sec}`;
  };

  elapsedTimer = setInterval(() => {
    seconds += 1;

    chrome.browserAction.setBadgeBackgroundColor({
      color: "#FF2876",
    });

    const time = formattedTime(seconds);
    chrome.browserAction.setBadgeText({
      text: time,
    });

    chrome.runtime.sendMessage({
      cmd: "elapsedRecordingTime",
      time: time,
    });
  }, 1000);
};

const startRecording = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ status: "recording" }, function () {
      console.log("Recording...");
      screenRecorder.start().then(() => {
        resolve();
      });
    });
  });
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.cmd === "startRecording") {
    screenRecorder
      .askPermission()
      .then(() => startCountdown())
      .then(() => startRecording())
      .then(() => trackElapsedTime());
    return true;
  }

  if (request.cmd === "stopRecording") {
    screenRecorder.stop("x");
    sendResponse({ result: true });
  }
});
