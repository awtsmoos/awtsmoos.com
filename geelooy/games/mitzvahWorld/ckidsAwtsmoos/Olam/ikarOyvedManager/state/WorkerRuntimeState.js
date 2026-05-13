
/**
 * B"H
 * @file WorkerRuntimeState.js
 * @description
 * Small state vessel for worker runtime.
 */

/**
 * B"H
 * Runtime state.
 */
export class WorkerRuntimeState {
  /**
   * B"H
   */
  constructor() {
    this.opened = false;
    this.vesselIsReady = false;
    this.pawsawchDispatched = false;
    this.worldLoaded = false;
    this.canvasTransferred = false;
    this.createdAt = Date.now();
    this.lastResponseAt = Date.now();
  }

  /**
   * B"H
   * Marks response time.
   *
   * @returns {void}
   * Nothing.
   */
  touch() {
    this.lastResponseAt = Date.now();
  }

  /**
   * B"H
   * Gets silent milliseconds.
   *
   * @returns {number}
   * Milliseconds.
   */
  silenceMs() {
    return Date.now() - this.lastResponseAt;
  }
}
