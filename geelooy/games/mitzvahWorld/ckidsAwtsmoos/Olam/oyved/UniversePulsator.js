// B"H
/**
 * @module UniversePulsator
 * @description Chapter 70: the heartbeat can now stop cleanly. The Awtsmoos
 * runs the world while it is healthy, but when a fatal render matrix is found,
 * the rhythm is cancelled in browser or worker without throwing another error.
 */
export default class UniversePulsator {
  /** @param {object} olam Runtime world. */
  constructor(olam) {
    this.olam = olam;
    this.lastTime = 0;
    this.isRunning = false;
    this._reqId = null;
    this._frameCount = 0;
  }

  /** @returns {void} Starts the constant frame river. */
  ignite() {
    if (this.isRunning) return;
    const scope = typeof self !== 'undefined' ? self : globalThis;
    if (!scope.requestAnimationFrame) {
      scope.requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 16);
    }
    if (!scope.cancelAnimationFrame) {
      scope.cancelAnimationFrame = id => clearTimeout(id);
    }
    this.isRunning = true;
    this.lastTime = performance.now();
    this._tick(this.lastTime);
  }

  /** @returns {void} Stops future pulses safely. */
  stop() {
    this.isRunning = false;
    const scope = typeof self !== 'undefined' ? self : globalThis;
    if (this._reqId != null) scope.cancelAnimationFrame?.(this._reqId);
    this._reqId = null;
  }

  /** @param {number} currentTime RAF time. @returns {void} */
  _tick(currentTime) {
    if (!this.isRunning) return;
    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    if (Number.isNaN(dt) || dt > 0.05 || dt <= 0) dt = 0.0166;
    this.olam.deltaTime = dt;
    try {
      if (this.olam.updateStep) this.olam.updateStep(dt);
      else console.warn('B"H - ⚠️ Pulsator: updateStep is missing on Olam instance!');
    } catch (error) {
      console.error('B"H - 🚨 Heartbeat shard issue:', error);
    }
    if (this.isRunning) {
      const scope = typeof self !== 'undefined' ? self : globalThis;
      this._reqId = scope.requestAnimationFrame(time => this._tick(time));
    }
  }
}
