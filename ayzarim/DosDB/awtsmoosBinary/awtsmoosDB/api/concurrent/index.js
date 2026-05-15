// B"H

/**
 * @file api/concurrent/index.js
 * @chapter The Many Hands And The One Scroll
 * @description
 * Public async doorway for path/range coordinated work. It keeps normal live
 * handles clean while giving servers a place to perform many independent reads
 * and writes without one broad application-level lock.
 */

const RangeLocks = require('../../core/locks/range.js');
const PathLocks = require('../../core/locks/path.js');
const constants = require('../../constants.js');

/**
 * @class ConcurrentManager
 * @description Path and range lock facade.
 */
class ConcurrentManager {
  /**
   * @constructor
   * @param {object} db - Database instance.
   */
  constructor(db) {
    this.db = db;
    this.ranges = new RangeLocks();
    this.paths = new PathLocks();
    this._pendingPathWrites = [];
    this._pathWriteFlushScheduled = false;
    this._pendingPathWrites = [];
    this._pathWriteFlushScheduled = false;
  }

  /**
   * @method readPath
   * @param {string|Array<string|number>} path - Logical path.
   * @returns {Promise<*>} Stored value.
   */
  readPath(path) {
    return this.paths.read(path, () => this._get(path));
  }

  /**
   * @method writePath
   * @param {string|Array<string|number>} path - Logical path.
   * @param {*} value - Value to write.
   * @returns {Promise<*>} Written value.
   */
  writePath(path, value) {
    const parts = this._parts(path);
    if (!parts.length) return Promise.reject(new Error('B"H: Cannot write the empty root path'));

    return new Promise((resolve, reject) => {
      this._pendingPathWrites.push({ parts, value, resolve, reject });
      if (this._pathWriteFlushScheduled) return;
      this._pathWriteFlushScheduled = true;
      queueMicrotask(() => this._flushPathWrites());
    });
  }

  /**
   * @method autoRead
   * @description Internal sync read lock for ordinary handle APIs.
   * @param {string|Array<string|number>} path - Logical path.
   * @param {Function} fn - Work callback.
   * @returns {*} Callback result.
   */
  autoRead(path, fn) {
    return this.paths.readSync(path, fn);
  }

  /**
   * @method autoWrite
   * @description Internal sync write lock for ordinary handle APIs.
   * @param {string|Array<string|number>} path - Logical path.
   * @param {Function} fn - Work callback.
   * @returns {*} Callback result.
   */
  autoWrite(path, fn) {
    return this.paths.writeSync(path, fn);
  }

  /**
   * @method deletePath
   * @param {string|Array<string|number>} path - Logical path.
   * @returns {Promise<boolean>} Delete result.
   */
  deletePath(path) {
    return this.paths.write(path, () => this._delete(path));
  }

  /**
   * @method rangeRead
   * @param {string} resource - Resource id.
   * @param {number} offset - Start byte.
   * @param {number} length - Byte count.
   * @param {Function} fn - Work callback.
   * @returns {Promise<*>} Callback result.
   */
  rangeRead(resource, offset, length, fn) {
    return this.ranges.read(resource, offset, length, fn);
  }

  /**
   * @method rangeWrite
   * @param {string} resource - Resource id.
   * @param {number} offset - Start byte.
   * @param {number} length - Byte count.
   * @param {Function} fn - Work callback.
   * @returns {Promise<*>} Callback result.
   */
  rangeWrite(resource, offset, length, fn) {
    return this.ranges.write(resource, offset, length, fn);
  }

  /**
   * @method _parts
   * @param {string|Array<string|number>} path - Path input.
   * @returns {Array<string>} Parts.
   */
  _parts(path) {
    return this.paths.parts(path);
  }

  /**
   * @method _flushPathWrites
   * @description Flushes coalesced writes grouped by parent path.
   * @returns {void}
   */
  _flushPathWrites() {
    const batch = this._pendingPathWrites.splice(0);
    this._pathWriteFlushScheduled = false;
    if (!batch.length) return;

    const groups = new Map();
    for (const item of batch) {
      const parentParts = item.parts.slice(0, -1);
      const key = parentParts.join('\u0000');
      let group = groups.get(key);
      if (!group) {
        group = { parentParts, items: [] };
        groups.set(key, group);
      }
      group.items.push(item);
    }

    for (const group of groups.values()) {
      this.paths.write(group.parentParts, () => {
        try {
          this._applyWriteGroup(group.parentParts, group.items);
          for (const item of group.items) item.resolve(item.value);
        } catch (err) {
          for (const item of group.items) item.reject(err);
        }
      });
    }
  }

  /**
   * @method _applyWriteGroup
   * @param {Array<string>} parentParts - Parent container path.
   * @param {Array<object>} items - Write items with leaf keys.
   * @returns {void}
   */
  _applyWriteGroup(parentParts, items) {
    if (items.length === 1) {
      this._set(items[0].parts, items[0].value);
      return;
    }

    if (!parentParts.length) {
      for (const item of items) this._set(item.parts, item.value);
      return;
    }

    const parentTarget = this._parent(parentParts);
    if (!parentTarget) {
      for (const item of items) this._set(item.parts, item.value);
      return;
    }

    let current = parentTarget.parent[parentTarget.key];
    let plain = current && typeof current.__resolve__ === 'function'
      ? current.__resolve__()
      : current;

    if (!plain || typeof plain !== 'object') plain = {};

    for (const item of items) {
      plain[item.parts[item.parts.length - 1]] = item.value;
    }

    parentTarget.parent[parentTarget.key] = plain;
  }

  /**
   * @method _flushPathWrites
   * @description Flushes coalesced writes grouped by parent path.
   * @returns {void}
   */
  _flushPathWrites() {
    const batch = this._pendingPathWrites.splice(0);
    this._pathWriteFlushScheduled = false;
    if (!batch.length) return;

    const groups = new Map();
    for (const item of batch) {
      const parentParts = item.parts.slice(0, -1);
      const key = parentParts.join('\u0000');
      let group = groups.get(key);
      if (!group) {
        group = { parentParts, items: [] };
        groups.set(key, group);
      }
      group.items.push(item);
    }

    for (const group of groups.values()) {
      this.paths.write(group.parentParts, () => {
        try {
          this._applyWriteGroup(group.parentParts, group.items);
          for (const item of group.items) item.resolve(item.value);
        } catch (err) {
          for (const item of group.items) item.reject(err);
        }
      });
    }
  }

  /**
   * @method _applyWriteGroup
   * @param {Array<string>} parentParts - Parent container path.
   * @param {Array<object>} items - Write items with leaf keys.
   * @returns {void}
   */
  _applyWriteGroup(parentParts, items) {
    if (items.length === 1) {
      this._set(items[0].parts, items[0].value);
      return;
    }

    if (!parentParts.length) {
      for (const item of items) this._set(item.parts, item.value);
      return;
    }

    const parentTarget = this._parent(parentParts);
    if (!parentTarget) {
      for (const item of items) this._set(item.parts, item.value);
      return;
    }

    let current = parentTarget.parent[parentTarget.key];
    let plain = current && typeof current.__resolve__ === 'function'
      ? current.__resolve__()
      : current;

    if (!plain || typeof plain !== 'object') plain = {};

    for (const item of items) {
      plain[item.parts[item.parts.length - 1]] = item.value;
    }

    parentTarget.parent[parentTarget.key] = plain;
  }

  /**
   * @method _get
   * @param {string|Array<string|number>} path - Logical path.
   * @returns {*} Stored value.
   */
  _get(path) {
    const parts = this._parts(path);
    let cursor = this.db.root;

    for (const part of parts) {
      if (cursor == null) return undefined;
      cursor = cursor[part];
    }

    return cursor;
  }

  /**
   * @method _parent
   * @param {string|Array<string|number>} path - Logical path.
   * @returns {{parent:*,key:string}|null} Parent and key.
   */
  _parent(path) {
    const parts = this._parts(path);
    if (!parts.length) return null;
    let parent = this.db.root;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (parent[part] === undefined) parent[part] = {};
      parent = parent[part];
      if (parent == null) return null;
    }

    return { parent, key: parts[parts.length - 1] };
  }

  /**
   * @method _set
   * @param {string|Array<string|number>} path - Logical path.
   * @param {*} value - Value to write.
   * @returns {void}
   */
  _set(path, value) {
    const target = this._parent(path);
    if (!target) throw new Error('B"H: Cannot write the empty root path');

    const soul = target.parent && target.parent[constants.SYMBOLS.INTERNALS];
    if (soul && soul.writer && typeof soul.writer.set === 'function') {
      soul.writer.set(target.key, value, {
        assumeNew: true,
        skipFree: true,
        skipIndexes: true,
        skipOldState: true
      });
      return;
    }

    target.parent[target.key] = value;
  }

  /**
   * @method _delete
   * @param {string|Array<string|number>} path - Logical path.
   * @returns {boolean} Delete result.
   */
  _delete(path) {
    const target = this._parent(path);
    return target ? delete target.parent[target.key] : false;
  }
}

module.exports = ConcurrentManager;
