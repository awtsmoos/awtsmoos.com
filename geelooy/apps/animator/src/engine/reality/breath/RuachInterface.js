// B"H

/**
 * @file RuachInterface.js
 * @description
 * Chapter: The Breath That Learned Not To Beg At A Locked Gate.
 * The Awtsmoos gives life without noise; this module now treats microphone
 * permission as optional grace, never as a console wound or render dependency.
 */
export class RuachInterface {
  static context = null;
  static analyser = null;
  static dataArray = null;
  static stream = null;
  static isListening = false;
  static fallbackRunning = false;

  /**
   * Opens microphone wind input only when the browser gate is truly open.
   *
   * @param {Object} state - Global app state.
   * @returns {Promise<void>}
   */
  static async awaken(state) {
    if (this.isListening || this.fallbackRunning) return;

    const devices = globalThis.navigator?.mediaDevices;
    const getUserMedia = devices?.getUserMedia;
    if (typeof getUserMedia !== 'function') return this.syntheticBreath(state);

    const allowed = await this.mayAskForMicrophone();
    if (!allowed) return this.syntheticBreath(state);

    try {
      this.stream = await getUserMedia.call(devices, { audio: true });
      this.bindAudioGraph(state);
    } catch (err) {
      console.info('B"H - Physical mic unavailable; synthetic ruach continues.', err?.name || err?.message || err);
      this.syntheticBreath(state);
    }
  }

  /**
   * Checks permission without creating a red DevTools event.
   *
   * @returns {Promise<boolean>} True when request is reasonable.
   */
  static async mayAskForMicrophone() {
    try {
      const status = await globalThis.navigator?.permissions?.query?.({ name: 'microphone' });
      return status?.state !== 'denied';
    } catch (_err) {
      return true;
    }
  }

  /**
   * Binds stream into analyser nodes.
   *
   * @param {Object} state - Global app state.
   * @returns {void}
   */
  static bindAudioGraph(state) {
    const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContext || !this.stream) return this.syntheticBreath(state);
    this.context = new AudioContext();
    this.analyser = this.context.createAnalyser();
    this.context.createMediaStreamSource(this.stream).connect(this.analyser);
    this.analyser.fftSize = 256;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.isListening = true;
    this.breathe(state);
  }

  /** @param {Object} state - Global app state. @returns {void} */
  static breathe(state) {
    if (!this.isListening || !this.analyser || !this.dataArray) return;
    this.analyser.getByteFrequencyData(this.dataArray);
    let lowEndSum = 0;
    for (let i = 0; i < 10; i++) lowEndSum += this.dataArray[i];
    this.setWind(state, Math.max(0, (lowEndSum / 10 - 30) / 40));
    requestAnimationFrame(() => this.breathe(state));
  }

  /** @param {Object} state @returns {void} */
  static syntheticBreath(state) {
    if (this.fallbackRunning) return;
    this.fallbackRunning = true;
    const loop = (time) => {
      const wind = 0.22 + Math.sin(time * 0.0012) * 0.12 + Math.sin(time * 0.0031) * 0.04;
      this.setWind(state, Math.max(0, wind));
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /** @param {Object} state @param {number} wind @returns {void} */
  static setWind(state, wind) {
    if (state && typeof state.set === 'function') state.set('globalWind', wind, true);
  }

  /** @returns {void} */
  static stop() {
    this.stream?.getTracks?.().forEach((track) => track.stop());
    this.context = null;
    this.analyser = null;
    this.dataArray = null;
    this.stream = null;
    this.isListening = false;
  }
}
