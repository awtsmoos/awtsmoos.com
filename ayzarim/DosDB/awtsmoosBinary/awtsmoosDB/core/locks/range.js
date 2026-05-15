// B"H

/**
 * @file core/locks/range.js
 * @chapter The Gates That Know Their Borders
 * @description
 * A small shared/exclusive range lock table. It lets non-overlapping byte
 * regions proceed without waiting on each other, while overlapping writes wait
 * until the earlier holder releases its gate.
 */

/**
 * @class RangeLockManager
 * @description Async shared/exclusive locks for named byte ranges.
 */
class RangeLockManager {
  /**
   * @constructor
   */
  constructor() {
    this.active = [];
    this.waiting = [];
  }

  /**
   * @method read
   * @param {string} resource - Resource id.
   * @param {number} offset - Start byte.
   * @param {number} length - Byte count.
   * @param {Function} fn - Work callback.
   * @returns {Promise<*>} Callback result.
   */
  read(resource, offset, length, fn) {
    return this.withLock({ resource, offset, length, mode: 'read' }, fn);
  }

  /**
   * @method write
   * @param {string} resource - Resource id.
   * @param {number} offset - Start byte.
   * @param {number} length - Byte count.
   * @param {Function} fn - Work callback.
   * @returns {Promise<*>} Callback result.
   */
  write(resource, offset, length, fn) {
    return this.withLock({ resource, offset, length, mode: 'write' }, fn);
  }

  /**
   * @method withLock
   * @param {object} lock - Lock request.
   * @param {Function} fn - Work callback.
   * @returns {Promise<*>} Callback result.
   */
  async withLock(lock, fn) {
    await this.acquire(lock);

    try {
      return await fn();
    } finally {
      this.release(lock);
    }
  }

  /**
   * @method acquire
   * @param {object} lock - Lock request.
   * @returns {Promise<void>} Resolution when granted.
   */
  acquire(lock) {
    this._clean(lock);

    if (!this._conflicts(lock)) {
      this.active.push(lock);
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.waiting.push({ lock, resolve });
    });
  }

  /**
   * @method release
   * @param {object} lock - Lock to release.
   * @returns {void}
   */
  release(lock) {
    const index = this.active.indexOf(lock);
    if (index !== -1) this.active.splice(index, 1);
    this._drain();
  }

  /**
   * @method _drain
   * @returns {void}
   */
  _drain() {
    for (let i = 0; i < this.waiting.length; i++) {
      const item = this.waiting[i];
      if (this._conflicts(item.lock)) continue;

      this.waiting.splice(i, 1);
      this.active.push(item.lock);
      item.resolve();
      i--;
    }
  }

  /**
   * @method _conflicts
   * @param {object} lock - Candidate lock.
   * @returns {boolean} True when active locks block it.
   */
  _conflicts(lock) {
    return this.active.some(active => this._blocks(active, lock));
  }

  /**
   * @method _blocks
   * @param {object} a - Active lock.
   * @param {object} b - Candidate lock.
   * @returns {boolean} True when locks conflict.
   */
  _blocks(a, b) {
    if (a.resource !== b.resource) return false;
    if (a.mode === 'read' && b.mode === 'read') return false;
    return a.offset < b.offset + b.length && b.offset < a.offset + a.length;
  }

  /**
   * @method _clean
   * @param {object} lock - Lock request.
   * @returns {void}
   */
  _clean(lock) {
    lock.offset = Math.max(0, Number(lock.offset || 0));
    lock.length = Math.max(0, Number(lock.length || 0));
    if (lock.length === 0) lock.length = 1;
  }
}

module.exports = RangeLockManager;
