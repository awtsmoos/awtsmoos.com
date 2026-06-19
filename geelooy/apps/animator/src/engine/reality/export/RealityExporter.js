// B"H
/**
 * @file RealityExporter.js
 * @description Captures the active canvas into a downloadable WebM vessel.
 */
export class RealityExporter {
  static recorder = null;
  static chunks = [];

  /**
   * Starts capturing pixels and optional audio.
   *
   * @param {HTMLCanvasElement} canvas - Primary stage canvas.
   * @param {AudioContext} audioCtx - Optional audio context.
   * @returns {{ok:boolean,error?:string}} Start result.
   */
  static beginHarvest(canvas, audioCtx) {
    if (!canvas || typeof canvas.captureStream !== 'function') {
      return { ok: false, error: 'Canvas capture is unavailable on this device.' };
    }

    if (typeof MediaRecorder === 'undefined') {
      return { ok: false, error: 'MediaRecorder is unavailable in this browser.' };
    }

    this.chunks = [];
    const canvasStream = canvas.captureStream(60);
    let finalStream = canvasStream;

    if (audioCtx && typeof audioCtx.createMediaStreamDestination === 'function') {
      const audioDest = audioCtx.createMediaStreamDestination();
      const audioTracks = audioDest.stream.getAudioTracks();
      if (audioTracks.length > 0) finalStream = new MediaStream([...canvasStream.getTracks(), ...audioTracks]);
    }

    let options = { mimeType: 'video/webm; codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) options = { mimeType: 'video/webm' };

    try {
      this.recorder = new MediaRecorder(finalStream, options);
    } catch (error) {
      return { ok: false, error: `Recording could not start: ${error?.message || error}` };
    }

    this.recorder.ondataavailable = event => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };
    this.recorder.onstop = () => this.crystallizeVessel();
    this.recorder.start();
    return { ok: true };
  }

  /**
   * Stops the active recording.
   *
   * @returns {{ok:boolean,error?:string}} Stop result.
   */
  static endHarvest() {
    if (!this.recorder || this.recorder.state === 'inactive') {
      return { ok: false, error: 'No active recording to stop.' };
    }

    this.recorder.stop();
    return { ok: true };
  }

  /**
   * Converts byte chunks into a hidden download link and releases the URL.
   *
   * @returns {void}
   */
  static crystallizeVessel() {
    const blob = new Blob(this.chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.className = 'aw-download-link';
    link.href = url;
    link.download = `Awtsmoos_Emanation_${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}
