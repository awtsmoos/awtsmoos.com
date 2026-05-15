// B"H

/**
 * @file core/locks/path.js
 * @chapter The Tree Gates Of Meaning
 * @description
 * Logical path locks for database structures. A write to root.users blocks a
 * write to root.users.123, while root.users.123 and root.users.456 may proceed
 * independently through the outer semantic gate.
 */

/**
 * @class PathLockManager
 * @description Async shared/exclusive locks for dotted logical paths.
 */
class PathLockManager {
  /**
   * @constructor
   */
  constructor() {
    this.active = [];
    this.waiting = [];
  }

  /**
   * @method read
   * @param {string|Array<string|number>} path - Logical path.
   * @param {Function} fn - Work callback.
   * @returns {Promise<*>} Callback result.
   */
  read(path, fn) {
    return this.withLock({ path: this.parts(path), mode: 'read' }, fn);
  }

  /**
   * @method write
   * @param {string|Array<string|number>} path - Logical path.
   * @param {Function} fn - Work callback.
   * @returns {Promise<*>} Callback result.
   */
  write(path, fn) {
    return this.withLock({ path: this.parts(path), mode: 'write' }, fn);
  }

  /**
   * @method readSync
   * @param {string|Array<string|number>} path - Logical path.
   * @param {Function} fn - Work callback.
   * @returns {*} Callback result.
   */
  readSync(path, fn) {
    return this.withLockSync({ path: this.parts(path), mode: 'read' }, fn);
  }

  /**
   * @method writeSync
   * @param {string|Array<string|number>} path - Logical path.
   * @param {Function} fn - Work callback.
   * @returns {*} Callback result.
   */
  writeSync(path, fn) {
    return this.withLockSync({ path: this.parts(path), mode: 'write' }, fn);
  }

  /**
   * @method parts
   * @param {string|Array<string|number>} path - Path input.
   * @returns {Array<string>} Path parts.
   */
  parts(path) {
    if (Array.isArray(path)) return path.map(String).filter(Boolean);
    return String(path || '').split('.').filter(Boolean);
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
   * @method withLockSync
   * @param {object} lock - Lock request.
   * @param {Function} fn - Work callback.
   * @returns {*} Callback result.
   */
  withLockSync(lock, fn) {
    this.active.push(lock);

    try {
      return fn();
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
    if (a.mode === 'read' && b.mode === 'read') return false;
    return this._overlap(a.path, b.path);
  }

  /**
   * @method _overlap
   * @param {Array<string>} a - First path.
   * @param {Array<string>} b - Second path.
   * @returns {boolean} True when one path is the same or contains the other.
   */
  _overlap(a, b) {
    const n = Math.min(a.length, b.length);

    for (let i = 0; i < n; i++) {
      if (a[i] !== b[i]) return false;
    }

    return true;
  }
}

module.exports = PathLockManager;
