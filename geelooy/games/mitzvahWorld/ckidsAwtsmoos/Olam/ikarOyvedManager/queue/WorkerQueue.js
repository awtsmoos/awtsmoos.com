
/**
 * B"H
 * @file WorkerQueue.js
 * @description
 * Tiny worker message queue.
 */

/**
 * B"H
 * Message queue before worker opens.
 */
export class WorkerQueue {
  /**
   * B"H
   */
  constructor() {
    this.items = [];
  }

  /**
   * B"H
   * Adds a queued function.
   *
   * @param {Function} fn
   * Function.
   *
   * @returns {void}
   * Nothing.
   */
  add(fn) {
    this.items.push(fn);
  }

  /**
   * B"H
   * Flushes queue.
   *
   * @returns {void}
   * Nothing.
   */
  flush() {
    const items = this.items.slice();
    this.items.length = 0;

    for (const fn of items) {
      fn();
    }
  }

  /**
   * B"H
   * Gets queue length.
   *
   * @returns {number}
   * Count.
   */
  get length() {
    return this.items.length;
  }
}
