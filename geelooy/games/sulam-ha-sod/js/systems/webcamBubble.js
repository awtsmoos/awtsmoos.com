// B"H
/**
 * WebcamBubble is a voluntary crown-window.
 *
 * The Awtsmoos never opens the camera silently. Only a user action may call
 * enable(), and enable() requests video only: no microphone, no hidden audio
 * vessel. Frames are copied into a small buffer canvas at a capped cadence, then
 * the renderer clips that buffer into a circular face-light above the player.
 */
export class WebcamBubble {
  constructor({ width = 96, height = 96, fps = 18 } = {}) {
    this.enabled = false;
    this.ready = false;
    this.message = 'Webcam off';
    this.width = width;
    this.height = height;
    this.frameMs = 1000 / fps;
    this.lastCopy = 0;
    this.stream = null;
    this.video = null;
    this.buffer = makeCanvas(width, height);
    this.ctx = this.buffer.getContext?.('2d', { alpha: false }) || null;
  }

  /** Requests device webcam video only after a user gesture. */
  async enable() {
    if (this.enabled && this.ready) return { ok: true, message: 'Webcam already on.' };
    if (!globalThis.navigator?.mediaDevices?.getUserMedia) return this.fail('Webcam API unavailable on this device/browser.');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      this.video = makeVideo();
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.srcObject = this.stream;
      await this.video.play?.();
      this.enabled = true;
      this.ready = true;
      this.message = 'Webcam bubble on';
      return { ok: true, message: this.message };
    } catch (error) {
      return this.fail(error?.message || 'Webcam permission denied.');
    }
  }

  /** Stops tracks and clears the buffered face-window. */
  disable() {
    for (const track of this.stream?.getTracks?.() || []) track.stop();
    this.stream = null;
    this.video = null;
    this.enabled = false;
    this.ready = false;
    this.message = 'Webcam off';
    this.clear();
    return { ok: true, message: this.message };
  }

  /** Toggles camera state by explicit button action. */
  async toggle() { return this.enabled ? this.disable() : this.enable(); }

  /** @returns {string} button label */
  label() { return this.enabled ? 'Disable Webcam Bubble' : 'Enable Webcam Bubble'; }

  /** @param {number} now timestamp @returns {HTMLCanvasElement|OffscreenCanvas|null} buffered frame */
  frame(now = performanceNow()) {
    if (!this.ready || !this.video || !this.ctx) return null;
    if (now - this.lastCopy < this.frameMs) return this.buffer;
    if ((this.video.readyState || 0) < 2) return this.buffer;
    this.copyVideoIntoBuffer();
    this.lastCopy = now;
    return this.buffer;
  }

  /** Copies video into a square buffer with center-crop behavior. */
  copyVideoIntoBuffer() {
    const vw = this.video.videoWidth || this.width;
    const vh = this.video.videoHeight || this.height;
    const scale = Math.max(this.width / vw, this.height / vh);
    const sw = this.width / scale;
    const sh = this.height / scale;
    const sx = Math.max(0, (vw - sw) / 2);
    const sy = Math.max(0, (vh - sh) / 2);
    this.ctx.drawImage?.(this.video, sx, sy, sw, sh, 0, 0, this.width, this.height);
  }

  /** Clears the private buffer. */
  clear() { this.ctx?.clearRect?.(0, 0, this.width, this.height); }

  /** @param {string} message failure message @returns {object} */
  fail(message) {
    this.disable();
    this.message = message;
    return { ok: false, message };
  }
}

/** @param {number} width width @param {number} height height @returns {HTMLCanvasElement|OffscreenCanvas|object} */
function makeCanvas(width, height) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  if (globalThis.document?.createElement) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  return { width, height, getContext: () => ({ drawImage() {}, clearRect() {} }) };
}

/** @returns {HTMLVideoElement|object} */
function makeVideo() {
  if (globalThis.document?.createElement) {
    const video = document.createElement('video');
    video.setAttribute('aria-hidden', 'true');
    return video;
  }
  return { muted: true, playsInline: true, readyState: 2, videoWidth: 96, videoHeight: 96, play: async () => {} };
}

/** @returns {number} current time */
function performanceNow() { return globalThis.performance?.now?.() || Date.now(); }
