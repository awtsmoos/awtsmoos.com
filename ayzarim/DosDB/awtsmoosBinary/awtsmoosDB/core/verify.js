// B"H

/**
 * @file core/verify.js
 * @chapter The Range Ledger Of Truth
 * @description
 * Walks pointer seals without hydrating values. It marks reachable byte ranges,
 * validates structure magic, and can build the complement free-list.
 */

const constants = require('../constants.js');
const Pointer = require('../utils/pointer/crown.js');
const Scribe = require('../utils/leb128/scribe.js');
const serializer = require('../utils/serializer.js');

const T = constants.VAL_TYPE;
const STRUCT = new Set([T.ANCHOR, T.DICTIONARY, T.MAP, T.SEQUENCE, T.SET, T.ARRAY, T.JS_SET, T.JS_MAP, T.OBJECT, T.SMART_OBJECT, T.SMART_ARRAY]);

/**
 * @class DbVerifier
 * @description Reachability verifier and free-space builder.
 */
class DbVerifier {
  /**
   * @constructor
   * @param {object} db - Database instance.
   */
  constructor(db) {
    this.db = db;
    this.ranges = [{ offset: 0, length: 64, tag: 'superblock' }];
    this.bad = [];
    this.seen = new Set();
  }

  /**
   * @method run
   * @description Verifies reachable pointer graph.
   * @returns {object} Verification report.
   */
  run() {
    this.visitSeal(this.db.rootPtrRaw, 'root');
    this.visitSeal(this.db.freeListPtrRaw, 'free-list');
    this.visitSparseArrays();

    const ranges = this.merge(this.ranges);
    const logicalBytes = this.db.allocator.cursor;
    const free = this.complement(ranges, 64, logicalBytes);

    return {
      ok: this.bad.length === 0,
      errors: this.bad,
      reachableRanges: ranges.length,
      reachableBytes: ranges.reduce((sum, r) => sum + r.length, 0),
      freeRanges: free.length,
      freeBytes: free.reduce((sum, r) => sum + r.length, 0),
      free,
      logicalBytes,
      physicalBytes: this.db.storageStats().physicalBytes
    };
  }

  /**
   * @method key
   * @param {object} ptr - Decoded pointer.
   * @returns {string} Pointer key.
   */
  key(ptr) {
    return `${ptr.type}:${ptr.offset}:${ptr.length}`;
  }

  /**
   * @method mark
   * @param {object} ptr - Decoded pointer.
   * @param {string} tag - Range tag.
   * @returns {boolean} True when range is valid enough to read.
   */
  mark(ptr, tag) {
    if (!ptr || ptr.offset < 0 || ptr.length < 0 || ptr.offset + ptr.length > this.db.allocator.cursor) {
      this.bad.push({ tag, reason: 'pointer-out-of-bounds', ptr });
      return false;
    }

    if (ptr.length > 0) this.ranges.push({ offset: ptr.offset, length: ptr.length, tag });
    return true;
  }

  /**
   * @method visitSeal
   * @description Decodes and visits one pointer seal.
   * @param {Buffer|object} seal - Pointer seal or decoded pointer.
   * @param {string} tag - Debug tag.
   * @returns {void}
   */
  visitSeal(seal, tag) {
    if (!seal) return;

    let ptr = null;
    try {
      ptr = Buffer.isBuffer(seal) ? Pointer.decode(seal) : seal;
    } catch (err) {
      this.bad.push({ tag, reason: 'bad-pointer', message: err.message });
      return;
    }

    if (!ptr) return;
    const k = this.key(ptr);
    if (this.seen.has(k)) return;
    this.seen.add(k);
    if (!this.mark(ptr, tag)) return;
    if (ptr.type === T.BLOB) {
      this.visitBlob(ptr, tag);
      return;
    }
    if (ptr.type === T.TEXT) {
      this.visitText(ptr, tag);
      return;
    }
    if (!STRUCT.has(ptr.type)) return;

    const routes = {
      [T.ANCHOR]: () => this.visitAnchor(ptr, tag),
      [T.DICTIONARY]: () => this.visitDictionary(ptr, tag),
      [T.MAP]: () => this.visitMap(ptr, tag),
      [T.SEQUENCE]: () => this.visitSequence(ptr, tag),
      [T.SET]: () => this.visitSequence(ptr, tag),
      [T.ARRAY]: () => this.visitSequence(ptr, tag),
      [T.JS_SET]: () => this.visitSequence(ptr, tag),
      [T.JS_MAP]: () => this.visitMap(ptr, tag),
      [T.OBJECT]: () => this.visitDictionary(ptr, tag),
      [T.SMART_OBJECT]: () => this.visitDictionary(ptr, tag),
      [T.SMART_ARRAY]: () => this.visitFlatArray(ptr, tag)
    };

    try {
      const fn = routes[ptr.type];
      if (fn) fn();
    } catch (err) {
      this.bad.push({ tag, reason: 'visit-failed', message: err.message, ptr });
    }
  }

  /**
   * @method visitBlob
   * @description Marks the separate byte body owned by a reachable blob token.
   * @param {object} ptr - Blob token pointer.
   * @param {string} tag - Debug tag.
   * @returns {void}
   */
  visitBlob(ptr, tag) {
    const raw = this.db._readChainSafe(ptr);
    let token = null;

    try {
      token = raw ? JSON.parse(raw.toString('utf8')) : null;
    } catch (err) {
      this.bad.push({ tag, reason: 'bad-blob-token-json', message: err.message, ptr });
      return;
    }

    if (!token || token.__awtsmoosBlob !== true) {
      this.bad.push({ tag, reason: 'bad-blob-token', ptr });
      return;
    }

    const body = {
      type: T.BUFFER,
      offset: Number(token.offset || 0),
      length: Number(token.length || 0)
    };

    if (body.length > 0) this.mark(body, `${tag}.blob.body`);
  }

  /**
   * @method visitText
   * @description Marks blob bodies referenced by a reachable chunked text token.
   * @param {object} ptr - Text token pointer.
   * @param {string} tag - Debug tag.
   * @returns {void}
   */
  visitText(ptr, tag) {
    const raw = this.db._readChainSafe(ptr);
    let token = null;

    try {
      token = raw ? JSON.parse(raw.toString('utf8')) : null;
    } catch (err) {
      this.bad.push({ tag, reason: 'bad-text-token-json', message: err.message, ptr });
      return;
    }

    if (!token || token.__awtsmoosText !== true || !Array.isArray(token.blocks)) {
      this.bad.push({ tag, reason: 'bad-text-token', ptr });
      return;
    }

    for (let i = 0; i < token.blocks.length; i++) {
      const blob = token.blocks[i] && token.blocks[i].blob;
      if (!blob || blob.__awtsmoosBlob !== true) continue;
      const body = {
        type: T.BUFFER,
        offset: Number(blob.offset || 0),
        length: Number(blob.length || 0)
      };
      if (body.length > 0) this.mark(body, `${tag}.text.${i}.blob.body`);
    }
  }

  /**
   * @method visitAnchor
   * @param {object} ptr - Anchor pointer.
   * @param {string} tag - Debug tag.
   * @returns {void}
   */
  visitAnchor(ptr, tag) {
    const b = this.db._readChainSafe(ptr);
    if (!b || b.length < 6 || b.subarray(0, 4).toString() !== constants.MAGIC_ANCH) {
      this.bad.push({ tag, reason: 'bad-anchor', ptr });
      return;
    }

    const len = b.readUInt8(5);
    if (len > 0) this.visitSeal(b.subarray(6, 6 + len), `${tag}.anchor`);
  }

  /**
   * @method visitDictionary
   * @param {object} ptr - Dictionary pointer.
   * @param {string} tag - Debug tag.
   * @returns {void}
   */
  visitDictionary(ptr, tag) {
    const b = this.db._readChainSafe(ptr);
    if (!b || b.length < 6 || b.subarray(0, 4).toString() !== constants.MAGIC_DIC) {
      this.bad.push({ tag, reason: 'bad-dictionary', ptr });
      return;
    }

    let pos = 4;
    const mapLen = b.readUInt8(pos++);
    this.visitSeal(b.subarray(pos, pos + mapLen), `${tag}.dict.map`);
    pos += mapLen;
    const seqLen = b.readUInt8(pos++);
    this.visitSeal(b.subarray(pos, pos + seqLen), `${tag}.dict.seq`);
  }

  /**
   * @method visitMap
   * @param {object} ptr - Map node pointer.
   * @param {string} tag - Debug tag.
   * @returns {void}
   */
  visitMap(ptr, tag) {
    const b = this.db._readChainSafe(ptr);
    if (!b || b.length < 6 || b.subarray(0, 4).toString() !== constants.MAGIC_MAP) {
      this.bad.push({ tag, reason: 'bad-map', ptr });
      return;
    }

    const isLeaf = b[4] === 1;
    const count = Scribe.read(b, 5);
    let pos = 5 + count.bytesRead;

    for (let i = 0; i < count.value; i++) {
      const kLen = Scribe.read(b, pos);
      pos += kLen.bytesRead + kLen.value;
      const p = Pointer.decode(b, pos);
      const seal = b.subarray(pos, pos + p.byteSize);
      this.visitSeal(seal, `${tag}.map.${i}`);
      pos += p.byteSize;
    }

    if (!isLeaf && pos < b.length) {
      const p = Pointer.decode(b, pos);
      this.visitSeal(b.subarray(pos, pos + p.byteSize), `${tag}.map.last`);
    }
  }

  /**
   * @method visitSequence
   * @param {object} ptr - Sequence node pointer.
   * @param {string} tag - Debug tag.
   * @returns {void}
   */
  visitSequence(ptr, tag) {
    const b = this.db._readChainSafe(ptr);
    if (!b || b.length < 17 || b.subarray(0, 4).toString() !== constants.MAGIC_SEQ_NODE) {
      this.bad.push({ tag, reason: 'bad-sequence', ptr });
      return;
    }

    const isLeaf = (b.readUInt8(4) & 1) === 1;
    const count = b.readUInt16BE(5);
    let pos = 17;

    for (let i = 0; i < count; i++) {
      const len = serializer.readVarInt(b, pos);
      pos += len.bytesRead;
      const seal = b.subarray(pos, pos + len.value);
      this.visitSeal(seal, `${tag}.seq.${i}`);
      pos += len.value;
      if (!isLeaf) pos += 4;
    }
  }

  /**
   * @method visitFlatArray
   * @param {object} ptr - Flat array pointer.
   * @param {string} tag - Debug tag.
   * @returns {void}
   */
  visitFlatArray(ptr, tag) {
    const b = this.db._readChainSafe(ptr);
    if (!b || b.length < 10 || b.subarray(0, 4).toString() !== 'FLTA') {
      this.bad.push({ tag, reason: 'bad-flat-array', ptr });
      return;
    }

    const count = b.readUInt16BE(4);
    let pos = 10;
    for (let i = 0; i < count && pos < b.length; i++) {
      const p = Pointer.decode(b, pos);
      const seal = b.subarray(pos, pos + p.byteSize);
      this.visitSeal(seal, `${tag}.flat.${i}`);
      pos += p.byteSize;
    }
  }

  /**
   * @method visitSparseArrays
   * @description Marks sparse sidecar values so GC never frees far indexes.
   * @returns {void}
   */
  visitSparseArrays() {
    if (!this.db.sparseArrays || !this.db.sparseArrays.arrays) return;
    for (const [path, record] of this.db.sparseArrays.arrays.entries()) {
      if (!record || !record.chunks) continue;
      for (const [chunk, slots] of Object.entries(record.chunks)) {
        for (const [slot, entry] of Object.entries(slots || {})) {
          if (entry && entry.ptr) this.visitSeal(Buffer.from(entry.ptr, 'hex'), `sparse.${path}.${chunk}.${slot}`);
        }
      }
    }
  }

  /**
   * @method merge
   * @param {Array<object>} ranges - Ranges.
   * @returns {Array<object>} Merged ranges.
   */
  merge(ranges) {
    const sorted = ranges
      .filter(r => r.length > 0)
      .sort((a, b) => a.offset - b.offset || a.length - b.length);
    const out = [];

    for (const r of sorted) {
      const last = out[out.length - 1];
      if (last && last.offset + last.length >= r.offset) {
        const end = Math.max(last.offset + last.length, r.offset + r.length);
        last.length = end - last.offset;
      } else {
        out.push({ offset: r.offset, length: r.length });
      }
    }

    return out;
  }

  /**
   * @method complement
   * @param {Array<object>} ranges - Live ranges.
   * @param {number} start - Start boundary.
   * @param {number} end - End boundary.
   * @returns {Array<object>} Free ranges.
   */
  complement(ranges, start, end) {
    const out = [];
    let pos = start;

    for (const r of ranges) {
      if (r.offset > pos) out.push({ offset: pos, length: r.offset - pos });
      pos = Math.max(pos, r.offset + r.length);
    }

    if (pos < end) out.push({ offset: pos, length: end - pos });
    return out.filter(r => r.length > 0);
  }
}

module.exports = DbVerifier;
