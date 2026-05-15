// B"H

/**
 * @file api/dosdb/index.js
 * @chapter The Earlier Storehouse Rebuilt In The New Vessel
 * @description
 * Native DosDB compatibility methods for the new single-file database. No old
 * implementation is imported. Paths become nested records under a chosen root,
 * binary files become Awtsmoos blobs, and JSON files become live values. The
 * old caravan arrives, but the new city receives it with its own gates.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = '__dosdb__';

/**
 * @class DosDBBridge
 * @description Native compatibility facade for common old DosDB workflows.
 */
class DosDBBridge {
  /**
   * @constructor
   * @param {object} db - New database instance.
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * @method methods
   * @description Lists native compatibility methods.
   * @returns {Array<string>} Method names.
   */
  methods() {
    return [
      'copy',
      'delete',
      'exists',
      'get',
      'importJSON',
      'importPath',
      'list',
      'read',
      'readFileWithOffset',
      'rename',
      'traverse',
      'write'
    ].sort();
  }

  /**
   * @method old
   * @description Returns this native facade for callers that previously asked for old().
   * @returns {DosDBBridge} Native facade.
   */
  old() {
    return this;
  }

  /**
   * @method call
   * @description Calls a named native method.
   * @param {string} name - Method name.
   * @param {...*} args - Arguments.
   * @returns {*} Method result.
   */
  call(name, ...args) {
    const fn = this[name];
    if (typeof fn !== 'function') throw new Error(`B"H: native DosDB method not found: ${name}`);
    return fn.apply(this, args);
  }

  /**
   * @method write
   * @description Writes a value at a slash path under the native DosDB root.
   * @param {string} filePath - Slash path.
   * @param {*} value - Value.
   * @param {object} [options] - Options.
   * @returns {*} Stored value.
   */
  write(filePath, value, options = {}) {
    const slot = this._slot(filePath, options);
    slot.parent[slot.key] = value;
    return value;
  }

  /**
   * @method get
   * @description Reads a value by slash path.
   * @param {string} filePath - Slash path.
   * @param {object} [options] - Options.
   * @returns {*} Stored value.
   */
  get(filePath, options = {}) {
    const slot = this._slot(filePath, { ...options, create: false });
    const value = slot.parent ? slot.parent[slot.key] : undefined;
    if (isContainer(value) && value.__awtsmoosBlob !== true && value.__value !== undefined) {
      return value.__value;
    }
    return value;
  }

  /**
   * @method read
   * @description Alias for get.
   * @param {string} filePath - Slash path.
   * @param {object} [options] - Options.
   * @returns {*} Stored value.
   */
  read(filePath, options = {}) {
    return this.get(filePath, options);
  }

  /**
   * @method exists
   * @description Tests whether a native DosDB path exists.
   * @param {string} filePath - Slash path.
   * @param {object} [options] - Options.
   * @returns {boolean} True when present.
   */
  exists(filePath, options = {}) {
    const slot = this._slot(filePath, { ...options, create: false });
    if (!slot.parent) return false;
    if (this.db.has(slot.parent, slot.key)) return true;
    return slot.parent[slot.key] !== undefined;
  }

  /**
   * @method delete
   * @description Deletes a native DosDB path.
   * @param {string} filePath - Slash path.
   * @param {object} [options] - Options.
   * @returns {boolean} True when deleted.
   */
  delete(filePath, options = {}) {
    const slot = this._slot(filePath, { ...options, create: false });
    if (!slot.parent || !this.db.has(slot.parent, slot.key)) return false;
    delete slot.parent[slot.key];
    return true;
  }

  /**
   * @method rename
   * @description Moves a value between native DosDB paths.
   * @param {string} from - Source path.
   * @param {string} to - Destination path.
   * @param {object} [options] - Options.
   * @returns {boolean} True when moved.
   */
  rename(from, to, options = {}) {
    if (!this.exists(from, options)) return false;
    const value = this.get(from, options);
    this.write(to, value, options);
    this.delete(from, options);
    return true;
  }

  /**
   * @method copy
   * @description Copies a JSON-compatible value between native paths.
   * @param {string} from - Source path.
   * @param {string} to - Destination path.
   * @param {object} [options] - Options.
   * @returns {boolean} True when copied.
   */
  copy(from, to, options = {}) {
    if (!this.exists(from, options)) return false;
    this.write(to, clonePlain(this.get(from, options)), options);
    return true;
  }

  /**
   * @method list
   * @description Lists child keys for a path.
   * @param {string} [filePath=''] - Slash path.
   * @param {object} [options] - Options.
   * @returns {Array<string>} Child keys.
   */
  list(filePath = '', options = {}) {
    const value = filePath ? this.get(filePath, options) : this._root(options);
    if (!isContainer(value)) return [];
    return this.db.keys(value, options.keys || {});
  }

  /**
   * @method traverse
   * @description Walks native DosDB records without loading binary blob bodies.
   * @param {Function} visitor - Receives path and value.
   * @param {object} [options] - Options.
   * @returns {number} Count visited.
   */
  traverse(visitor, options = {}) {
    let count = 0;
    const walk = (node, parts) => {
      if (!node || typeof node !== 'object') return;
      for (const key of this.db.keys(node, options.keys || {})) {
        const value = node[key];
        const here = parts.concat(key);
        count++;
        visitor(here.join('/'), value);
        if (isContainer(value) && value.__awtsmoosBlob !== true) walk(value, here);
      }
    };
    walk(this._root(options), []);
    return count;
  }

  /**
   * @method readFileWithOffset
   * @description Reads a byte range from a blob-backed imported file.
   * @param {string} filePath - Native DosDB path.
   * @param {number} [offset=0] - Byte offset.
   * @param {number} [length] - Byte count.
   * @param {object} [options] - Options.
   * @returns {Buffer} Bytes.
   */
  readFileWithOffset(filePath, offset = 0, length = undefined, options = {}) {
    const value = this.get(filePath, options);
    if (!value || value.__awtsmoosBlob !== true) return Buffer.from(String(value == null ? '' : value));
    return this.db.blob.read(value, offset, length);
  }

  /**
   * @method importJSON
   * @description Imports a plain object at a root key.
   * @param {string} key - Root key.
   * @param {*} value - Plain value.
   * @returns {*} Imported value.
   */
  importJSON(key, value) {
    this.db.root[key] = value;
    return value;
  }

  /**
   * @method importPath
   * @description Imports a file or directory tree into native DosDB storage.
   * @param {string} sourcePath - Existing file/folder path.
   * @param {object} [options] - Options.
   * @returns {{files:number,dirs:number,bytes:number}} Import stats.
   */
  importPath(sourcePath, options = {}) {
    const base = path.resolve(sourcePath);
    const rootKey = options.rootKey || DEFAULT_ROOT;
    const stats = { files: 0, dirs: 0, bytes: 0 };

    const importOne = (abs) => {
      const st = fs.statSync(abs);
      const rel = path.relative(base, abs).split(path.sep).filter(Boolean).join('/');
      const target = rel || path.basename(abs);

      if (st.isDirectory()) {
        stats.dirs++;
        if (rel) this.write(target, {}, { rootKey });
        for (const child of fs.readdirSync(abs)) importOne(path.join(abs, child));
        return;
      }

      const raw = fs.readFileSync(abs);
      stats.files++;
      stats.bytes += raw.length;
      const value = parseJsonOrBlob(this.db, raw, { source: abs, bytes: raw.length });
      this.write(target, value, { rootKey });
    };

    importOne(base);
    return stats;
  }

  /**
   * @method _root
   * @param {object} [options] - Options.
   * @returns {object} Native root handle.
   */
  _root(options = {}) {
    const rootKey = options.rootKey || DEFAULT_ROOT;
    if (!this.db.has(this.db.root, rootKey) && this.db.root[rootKey] === undefined) this.db.root[rootKey] = {};
    return this.db.root[rootKey];
  }

  /**
   * @method _slot
   * @param {string} filePath - Slash path.
   * @param {object} [options] - Options.
   * @returns {{parent:object|null,key:string}}
   */
  _slot(filePath, options = {}) {
    const parts = splitPath(filePath);
    const key = parts.pop() || '';
    let parent = this._root(options);

    for (const part of parts) {
      if (!this.db.has(parent, part) && parent[part] === undefined) {
        if (options.create === false) return { parent: null, key };
        parent[part] = {};
      }
      parent = parent[part];
      if (!isContainer(parent)) return { parent: null, key };
    }

    return { parent, key };
  }
}

function splitPath(filePath) {
  return String(filePath || '').replace(/\\/g, '/').split('/').filter(Boolean);
}

function clonePlain(value) {
  if (value == null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value));
}

function parseJsonOrBlob(db, raw, meta) {
  const text = raw.toString('utf8');
  if (!text.includes('\u0000')) {
    try { return JSON.parse(text); } catch (_err) {}
  }
  return db.blob.create(raw, meta);
}

function isContainer(value) {
  const type = typeof value;
  return !!value && (type === 'object' || type === 'function');
}

module.exports = DosDBBridge;
