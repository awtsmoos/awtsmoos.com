// B"H
/**
 * @module UniversePulsator
 * @description The worker heartbeat schedules immediately after each measured
 * frame. The engine still uses real delta time and real render timings; the
 * scheduler no longer inserts extra sleep when the frame already has room.
 */
export default class UniversePulsator {
  constructor(olam) {
    this.olam = olam;
    this.lastTime = 0;
    this.isRunning = false;
    this._reqId = null;
    this._usesTimer = false;
    this._targetFrameMs = 1000 / 120;
    this._minDelayMs = 0;
  }
  ignite() {
    if (this.isRunning) return;
    const scope = typeof self !== 'undefined' ? self : globalThis;
    const isWorker = typeof document === 'undefined';
    this._usesTimer = isWorker || !scope.requestAnimationFrame || globalThis.__AWTSMOOS_USE_WORKER_TIMER__ === true;
    globalThis.__AWTSMOOS_PULSATOR_MODE__ = this._usesTimer ? 'worker-immediate-timer-for-sustained-60' : 'requestAnimationFrame';
    this.isRunning = true;
    this.lastTime = performance.now();
    this._schedule(0);
  }
  stop() {
    this.isRunning = false;
    const scope = typeof self !== 'undefined' ? self : globalThis;
    if (this._reqId != null) {
      if (this._usesTimer) clearTimeout(this._reqId);
      else scope.cancelAnimationFrame?.(this._reqId);
    }
    this._reqId = null;
  }
  _schedule(delayMs) {
    if (!this.isRunning) return;
    const scope = typeof self !== 'undefined' ? self : globalThis;
    const delay = this._usesTimer ? Math.max(this._minDelayMs, Math.floor(delayMs)) : delayMs;
    this._reqId = this._usesTimer || !scope.requestAnimationFrame
      ? setTimeout(() => this._tick(performance.now()), delay)
      : scope.requestAnimationFrame(time => this._tick(time));
  }
  _tick(currentTime) {
    if (!this.isRunning) return;
    const startedAt = performance.now();
    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    if (!Number.isFinite(dt) || dt > 0.05 || dt <= 0) dt = 1 / 60;
    this.olam.deltaTime = dt;
    try {
      if (this.olam.updateStep) this.olam.updateStep(dt);
      else if (!this._warnedMissingStep) { this._warnedMissingStep = true; console.warn('B"H - Pulsator updateStep missing'); }
    } catch (error) {
      if (!this._warnedTickError) { this._warnedTickError = true; console.error('B"H - Heartbeat issue:', error); }
    }
    const elapsed = performance.now() - startedAt;
    this._schedule(this._targetFrameMs - elapsed);
  }
}
