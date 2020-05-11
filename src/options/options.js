const video = document.querySelector("video");
chrome.storage.local.get(["url"], function ({ url }) {
  video.src = url;
});
