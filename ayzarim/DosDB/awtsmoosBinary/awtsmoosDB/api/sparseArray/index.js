// B"H

/**
 * @file api/sparseArray/index.js
 * @chapter The Array Whose Ends Are Hidden
 * @description
 * Internal sparse chunk layer for existing ARRAY/SEQUENCE handles. No new value
 * type is exposed. Far numeric indexes are stored by path and chunk number so
 * `arr[824791248912]` creates one tiny entry, not an impossible ocean of gaps.
 */

const fs = require('fs');
const SmartPointer = require('../../utils/smartPointer/index.js');

const DEFAULT_CHUNK = 256;

/**
 * @class SparseArrayManager
 * @description Path-keyed sparse chunks for huge array indexes.
 */
class SparseArrayManager {
  constructor(db) {
    this.db = db;
    this.arrays = new Map();
    this.dirty = false;
  }

  load() {
    const file = this.file();
    if (!fs.existsSync(file)) return;
    try {
      const json = JSON.parse(fs.readFileSync(file, 'utf8'));
      this.arrays = new Map(Object.entries(json.arrays || {}));
    } catch (_err) {
      this.arrays = new Map();
    }
  }

  flush() {
    if (!this.dirty) return;
    fs.writeFileSync(this.file(), JSON.stringify({ arrays: Object.fromEntries(this.arrays) }));
    this.dirty = false;
  }

  file() {
    return `${this.db.pager.filePath}.sparse.json`;
  }

  has(state, index) {
    const record = this.recordForState(state, false);
    if (!record) return false;
    return !!this.entry(record, index);
  }

  getPtr(state, index) {
    const record = this.recordForState(state, false);
    const entry = record && this.entry(record, index);
    return entry ? Buffer.from(entry.ptr, 'hex') : null;
  }

  setPtr(state, index, ptr) {
    const idx = normalizeIndex(index);
    const record = this.recordForState(state, true);
    const chunkId = Math.floor(idx / record.chunkSize);
    const offset = idx % record.chunkSize;
    if (!record.chunks[chunkId]) record.chunks[chunkId] = {};
    record.chunks[chunkId][offset] = { ptr: Buffer.from(ptr).toString('hex') };
    record.maxIndex = Math.max(Number(record.maxIndex || -1), idx);
    this.dirty = true;
    this.flush();
    return true;
  }

  delete(state, index) {
    const record = this.recordForState(state, false);
    if (!record) return false;
    const idx = normalizeIndex(index);
    const chunkId = Math.floor(idx / record.chunkSize);
    const offset = idx % record.chunkSize;
    if (!record.chunks[chunkId] || !record.chunks[chunkId][offset]) return false;
    delete record.chunks[chunkId][offset];
    if (Object.keys(record.chunks[chunkId]).length === 0) delete record.chunks[chunkId];
    record.maxIndex = this.computeMax(record);
    this.dirty = true;
    this.flush();
    return true;
  }

  length(state, denseLength = 0) {
    const record = this.recordForState(state, false);
    if (!record) return denseLength;
    return Math.max(denseLength, Number(record.maxIndex || -1) + 1);
  }

  keys(state) {
    const record = this.recordForState(state, false);
    if (!record) return [];
    const out = [];
    for (const chunkKey of Object.keys(record.chunks)) {
      const base = Number(chunkKey) * record.chunkSize;
      for (const offset of Object.keys(record.chunks[chunkKey])) out.push(base + Number(offset));
    }
    out.sort((a, b) => a - b);
    return out;
  }

  ranges(state) {
    const keys = this.keys(state);
    const ranges = [];
    for (const key of keys) {
      const last = ranges[ranges.length - 1];
      if (last && last.end + 1 === key) last.end = key;
      else ranges.push({ start: key, end: key });
    }
    return ranges;
  }

  slice(state, start, end, wrap) {
    const out = [];
    for (const key of this.keys(state)) {
      if (key < start || key >= end) continue;
      const ptr = this.getPtr(state, key);
      if (!ptr) continue;
      const val = SmartPointer.resolve(ptr, this.db.allocator);
      out.push(wrap ? wrap(val, key, ptr) : val);
    }
    return out;
  }

  entry(record, index) {
    const idx = normalizeIndex(index);
    const chunkId = Math.floor(idx / record.chunkSize);
    const offset = idx % record.chunkSize;
    return record.chunks[chunkId] && record.chunks[chunkId][offset];
  }

  recordForState(state, create) {
    const key = this.keyFor(state);
    let record = this.arrays.get(key);
    if (!record && create) {
      record = { chunkSize: DEFAULT_CHUNK, maxIndex: -1, chunks: {} };
      this.arrays.set(key, record);
    }
    return record;
  }

  keyFor(state) {
    return state && typeof state.getPath === 'function' ? state.getPath() : 'root';
  }

  computeMax(record) {
    let max = -1;
    for (const chunkKey of Object.keys(record.chunks)) {
      const base = Number(chunkKey) * record.chunkSize;
      for (const offset of Object.keys(record.chunks[chunkKey])) max = Math.max(max, base + Number(offset));
    }
    return max;
  }
}

function normalizeIndex(index) {
  const idx = Number(index);
  if (!Number.isSafeInteger(idx) || idx < 0) throw new Error(`B"H: invalid sparse array index ${index}`);
  return idx;
}

module.exports = SparseArrayManager;
