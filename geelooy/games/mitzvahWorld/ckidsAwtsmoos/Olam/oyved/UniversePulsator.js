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
    this._usesTimer = false;
    this._messagePump = null;
    this._targetFrameMs = 1000 / 60;
  }

  /** @returns {void} Starts the constant frame river. */
  ignite() {
    if (this.isRunning) return;
    const scope = typeof self !== 'undefined' ? self : globalThis;
    const isWorker = typeof document === "undefined";
    this._usesTimer = isWorker || !scope.requestAnimationFrame || globalThis.__AWTSMOOS_USE_WORKER_TIMER__ === true;
    if (this._usesTimer && typeof MessageChannel !== "undefined") {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => this._tick(performance.now());
      this._messagePump = channel;
    }
    globalThis.__AWTSMOOS_PULSATOR_MODE__ = this._messagePump ? "worker-message-pump" : this._usesTimer ? "worker-fast-timer" : "requestAnimationFrame";
    this.isRunning = true;
    this.lastTime = performance.now();
    this._tick(this.lastTime);
  }

  /** @returns {void} Stops future pulses safely. */
  stop() {
    this.isRunning = false;
    const scope = typeof self !== 'undefined' ? self : globalThis;
    if (this._reqId != null) {
      if (this._usesTimer) clearTimeout(this._reqId);
      else scope.cancelAnimationFrame?.(this._reqId);
    }
    try { this._messagePump?.port1?.close?.(); this._messagePump?.port2?.close?.(); } catch (_) {}
    this._messagePump = null;
    this._reqId = null;
  }

  /** @param {number} currentTime RAF time. @returns {void} */
  _tick(currentTime) {
    if (!this.isRunning) return;
    const tickStartedAt = performance.now();
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
      const elapsedMs = performance.now() - tickStartedAt;
      const delayMs = this._usesTimer ? 0 : Math.max(0, Math.round(this._targetFrameMs - elapsedMs));
      if (this._messagePump) this._messagePump.port2.postMessage(0);
      else this._reqId = this._usesTimer || !scope.requestAnimationFrame
        ? setTimeout(() => this._tick(performance.now()), delayMs)
        : scope.requestAnimationFrame(time => this._tick(time));
    }
  }
}
