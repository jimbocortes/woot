class ScreenRecorder {
  constructor() {
    this.stream = null;
    this.chunks = [];
    this.mediaRecorder = null;
    this.recording = null;
    this.id = Number(new Date());
    this.onstop = null;
  }

  async askPermission() {
    this.stream = await this._displayMedia();
    this.stream.addEventListener("inactive", (e) => {
      this.stop(e);
    });
  }

  async start() {
    if (this.recording) {
      window.URL.revokeObjectURL(this.recording);
    }

    this.chunks = [];
    this.recording = null;

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: "video/webm" });
    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data && event.data.size > 0) {
        console.log("Pushing data.");
        this.chunks.push(event.data);
      }
    });
    this.mediaRecorder.start(10);
  }

  stop(e) {
    if (this.mediaRecorder) {
      console.log("Stopping....", e);
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.recording = window.URL.createObjectURL(new Blob(this.chunks, { type: "video/webm" }));
      if (this.onstop) {
        this.onstop(null);
      }
    } else {
      console.log("Already stopped", e);
    }
  }

  _displayMedia() {
    if (navigator.getDisplayMedia) {
      return navigator.getDisplayMedia({ video: true });
    } else if (navigator.mediaDevices.getDisplayMedia) {
      return navigator.mediaDevices.getDisplayMedia({ video: true });
    } else {
      return navigator.mediaDevices.getUserMedia({ video: { mediaSource: "screen" } });
    }
  }
}
