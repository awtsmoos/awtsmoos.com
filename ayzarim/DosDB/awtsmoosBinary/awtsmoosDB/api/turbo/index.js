// B"H

/**
 * @file api/turbo/index.js
 * @chapter The Swift Scribe Who Waits To Carve
 * @description
 * Write-behind overlay for high fan-in sync-looking workloads. Ordinary set
 * traps may record intent in RAM, reads see it immediately, and idle/close
 * flushes through the proven writer as the fallback persistence path.
 */

/**
 * @class TurboWriteBehind
 * @description Sync-looking overlay with durable fallback flush.
 */
class TurboWriteBehind {
  /**
   * @constructor
   * @param {object} db - Database instance.
   */
  constructor(db) {
    this.db = db;
    this.pending = new Map();
    this.durable = new Map();
    this.compacted = new Map();
    this.flushing = false;
    this.compacting = false;
    this.timer = null;
    this.compactTimer = null;
    this.exitHooked = false;
  }

  /**
   * @method enabled
   * @returns {boolean} True when overlay capture is enabled.
   */
  enabled() {
    return !!(this.db.options && this.db.options.turboWrites);
  }

  /**
   * @method pathFor
   * @param {object} state - Handle state.
   * @param {string|number} key - Property key.
   * @returns {string} Logical path.
   */
  pathFor(state, key) {
    const base = state && typeof state.getPath === 'function' ? state.getPath() : 'root';
    return `${base}.${String(key)}`;
  }

  /**
   * @method captureSet
   * @description Records a sync-looking set operation when safe.
   * @param {object} state - Handle state.
   * @param {string|number} key - Property key.
   * @param {*} value - Value to write.
   * @returns {boolean} True when captured.
   */
  captureSet(state, key, value) {
    if (!this.enabled() || this.flushing || typeof key === 'symbol') return false;

    const path = this.pathFor(state, key);
    this.pending.set(path, { kind: 'set', path, value });
    this._pruneChildren(path);
    this._scheduleFlush();
    return true;
  }

  /**
   * @method captureDelete
   * @param {object} state - Handle state.
   * @param {string|number} key - Property key.
   * @returns {boolean} True when captured.
   */
  captureDelete(state, key) {
    if (!this.enabled() || this.flushing || typeof key === 'symbol') return false;

    const path = this.pathFor(state, key);
    this.pending.set(path, { kind: 'delete', path });
    this._pruneChildren(path);
    this._scheduleFlush();
    return true;
  }

  /**
   * @method get
   * @description Reads an overlaid value for one child key.
   * @param {object} state - Handle state.
   * @param {string|number} key - Property key.
   * @returns {{hit:boolean,value:*}} Overlay result.
   */
  get(state, key) {
    if (!this.enabled() || this.flushing || typeof key === 'symbol') {
      return { hit: false, value: undefined };
    }

    const path = this.pathFor(state, key);
    const item = this.pending.get(path);

    if (item) {
      if (item.kind === 'delete') return { hit: true, value: undefined };
      return { hit: true, value: item.value };
    }

    const durable = this.durable.get(path);
    if (durable) {
      if (durable.kind === 'delete') return { hit: true, value: undefined };
      return { hit: true, value: durable.value };
    }

    const compacted = this.compacted.get(path);
    if (!compacted) return { hit: false, value: undefined };
    if (compacted.kind === 'delete') return { hit: true, value: undefined };
    return { hit: true, value: compacted.value };
  }

  /**
   * @method has
   * @description Checks overlay existence, including tombstones.
   * @param {object} state - Handle state.
   * @param {string|number} key - Property key.
   * @returns {{hit:boolean,value:boolean}} Overlay result.
   */
  has(state, key) {
    if (!this.enabled() || this.flushing || typeof key === 'symbol') {
      return { hit: false, value: false };
    }

    const path = this.pathFor(state, key);
    const item = this.pending.get(path) || this.durable.get(path) || this.compacted.get(path);
    if (!item) return { hit: false, value: false };
    return { hit: true, value: item.kind !== 'delete' };
  }

  /**
   * @method keys
   * @description Returns direct child keys present in the overlay for a handle.
   * @param {object} state - Handle state.
   * @returns {Array<string>} Overlay keys.
   */
  keys(state) {
    if (!this.enabled() || this.flushing) return [];

    const base = state && typeof state.getPath === 'function' ? state.getPath() : 'root';
    const prefix = `${base}.`;
    const out = new Map();

    for (const source of [this.compacted, this.durable, this.pending]) {
      for (const item of source.values()) {
        if (!item.path.startsWith(prefix)) continue;
        const rest = item.path.slice(prefix.length);
        if (!rest || rest.includes('.')) continue;
        out.set(rest, item.kind !== 'delete');
      }
    }

    return Array.from(out.entries())
      .filter(([, live]) => live)
      .map(([key]) => key);
  }

  /**
   * @method load
   * @description Loads durable overlay entries from the append sidecar.
   * @returns {void}
   */
  load() {
    if (!this.enabled()) return;

    const fs = require('fs');
    const file = this._sidecarPath();
    this._loadCompacted();
    if (!fs.existsSync(file)) return;

    try {
      const list = JSON.parse(fs.readFileSync(file, 'utf8'));
      this.durable.clear();
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.path && item.kind) this.durable.set(item.path, item);
        }
      }
    } catch (_err) {
      this.durable.clear();
    }
  }

  /**
   * @method flush
   * @description Persists pending overlay operations into the append sidecar.
   * @returns {void}
   */
  flush() {
    if (this.flushing || this.pending.size === 0) return;
    const items = Array.from(this.pending.values());
    this.pending.clear();
    this.flushing = true;

    try {
      for (const item of items) {
        this.durable.set(item.path, item);
      }
      this._writeSidecar();
      this._appendLog(items);
      this._scheduleCompaction();
    } finally {
      this.flushing = false;
    }
  }

  /**
   * @method compactToMain
   * @description Optional slow fallback merge into the main DB structure.
   * @returns {void}
   */
  compactToMain() {
    if (this.flushing || this.durable.size === 0) return;
    const items = Array.from(this.durable.values());
    this.flushing = true;

    try {
      for (const item of items) {
        if (item.kind === 'delete') this._deletePath(item.path);
        else this._setPath(item.path, item.value);
      }
      this.durable.clear();
      this._writeSidecar();
    } finally {
      this.flushing = false;
    }
  }

  /**
   * @method compactOverlay
   * @description
   * Copy-on-write compacts durable delta records into a stable turbo tree
   * snapshot. The current binary DB is untouched; if anything fails, the
   * durable delta remains readable and safe.
   *
   * @returns {boolean} True when compaction completed.
   */
  compactOverlay() {
    if (this.compacting || this.flushing || this.durable.size === 0) return false;
    this.compacting = true;

    try {
      const next = new Map(this.compacted);

      for (const item of this.durable.values()) {
        next.set(item.path, item);
      }

      this._writeCompacted(next);
      this.compacted = next;
      this.durable.clear();
      this._writeSidecar();
      return true;
    } catch (_err) {
      return false;
    } finally {
      this.compacting = false;
    }
  }

  /**
   * @method _setPath
   * @param {string} path - Dotted root path.
   * @param {*} value - Value to write.
   * @returns {void}
   */
  _setPath(path, value) {
    const parts = path.split('.').filter(Boolean);
    if (parts[0] === 'root') parts.shift();
    if (!parts.length) return;

    let cursor = this.db.root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (cursor[part] === undefined) cursor[part] = {};
      cursor = cursor[part];
    }

    cursor[parts[parts.length - 1]] = value;
  }

  /**
   * @method _deletePath
   * @param {string} path - Dotted root path.
   * @returns {void}
   */
  _deletePath(path) {
    const parts = path.split('.').filter(Boolean);
    if (parts[0] === 'root') parts.shift();
    if (!parts.length) return;

    let cursor = this.db.root;
    for (let i = 0; i < parts.length - 1; i++) {
      cursor = cursor[parts[i]];
      if (cursor == null) return;
    }

    delete cursor[parts[parts.length - 1]];
  }

  /**
   * @method _pruneChildren
   * @param {string} path - Parent path.
   * @returns {void}
   */
  _pruneChildren(path) {
    const prefix = `${path}.`;
    for (const key of this.pending.keys()) {
      if (key.startsWith(prefix)) this.pending.delete(key);
    }
  }

  /**
   * @method _sidecarPath
   * @returns {string} Durable overlay path.
   */
  _sidecarPath() {
    return `${this.db.pager.filePath}.turbo.json`;
  }

  /**
   * @method _treePath
   * @returns {string} Copy-on-write compacted turbo tree path.
   */
  _treePath() {
    return `${this.db.pager.filePath}.turbo.tree.json`;
  }

  /**
   * @method _writeSidecar
   * @returns {void}
   */
  _writeSidecar() {
    const fs = require('fs');
    const file = this._sidecarPath();
    const data = JSON.stringify(Array.from(this.durable.values()));
    fs.writeFileSync(file, data);
  }

  /**
   * @method _loadCompacted
   * @returns {void}
   */
  _loadCompacted() {
    const fs = require('fs');
    const file = this._treePath();
    if (!fs.existsSync(file)) return;

    try {
      const list = JSON.parse(fs.readFileSync(file, 'utf8'));
      this.compacted.clear();
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.path && item.kind) this.compacted.set(item.path, item);
        }
      }
    } catch (_err) {
      this.compacted.clear();
    }
  }

  /**
   * @method _writeCompacted
   * @param {Map<string,object>} next - Next compacted snapshot.
   * @returns {void}
   */
  _writeCompacted(next) {
    const fs = require('fs');
    const file = this._treePath();
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(Array.from(next.values())));
    fs.renameSync(tmp, file);
  }

  /**
   * @method _appendLog
   * @param {Array<object>} items - Applied records.
   * @returns {void}
   */
  _appendLog(items) {
    if (!items.length) return;
    const fs = require('fs');
    const lines = items.map(item => JSON.stringify({
      at: Date.now(),
      kind: item.kind,
      path: item.path
    })).join('\n') + '\n';
    fs.appendFileSync(`${this.db.pager.filePath}.turbo.log`, lines);
  }

  /**
   * @method _scheduleFlush
   * @description Debounces durability so callers do not need to remember close().
   * @returns {void}
   */
  _scheduleFlush() {
    this._hookExit();
    if (this.timer) clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.timer = null;
      this.flush();
    }, Number(this.db.options.turboFlushMs || 10));

    if (this.timer && typeof this.timer.unref === 'function') this.timer.unref();
  }

  /**
   * @method _scheduleCompaction
   * @description Schedules lagging copy-on-write overlay compaction.
   * @returns {void}
   */
  _scheduleCompaction() {
    if (this.compactTimer) clearTimeout(this.compactTimer);

    this.compactTimer = setTimeout(() => {
      this.compactTimer = null;
      this.compactOverlay();
    }, Number(this.db.options.turboCompactMs || 100));

    if (this.compactTimer && typeof this.compactTimer.unref === 'function') this.compactTimer.unref();
  }

  /**
   * @method _hookExit
   * @description Installs one final safety flush for normal process endings.
   * @returns {void}
   */
  _hookExit() {
    if (this.exitHooked || typeof process === 'undefined' || !process.once) return;
    this.exitHooked = true;
    process.once('beforeExit', () => this.flush());
    process.once('SIGINT', () => {
      try { this.flush(); } finally { process.exit(130); }
    });
  }
}

module.exports = TurboWriteBehind;
