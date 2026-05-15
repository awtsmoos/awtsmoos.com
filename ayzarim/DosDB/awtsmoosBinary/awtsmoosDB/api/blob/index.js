// B"H

/**
 * @file api/blob/index.js
 * @chapter The File Within The File
 * @description
 * Dedicated blob API for filesystem-like binary operations without adding
 * methods to live handles. Bodies are exact byte ranges; metadata is a small
 * JSON token the normal database can store.
 */

const crypto = require('crypto');
const COPY_CHUNK = 64 * 1024;
const ZERO_CHUNK = Buffer.alloc(COPY_CHUNK);

/**
 * @class BlobManager
 * @description Offset read/write/delete/info helpers for binary bodies.
 */
class BlobManager {
  /**
   * @constructor
   * @param {object} db - Database instance.
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * @method create
   * @description Allocates a blob and optionally writes initial bytes.
   * @param {number|Buffer|Uint8Array|string} input - Size or initial content.
   * @param {object} [meta={}] - User metadata.
   * @returns {object} Blob token.
   */
  create(input = 0, meta = {}) {
    const initial = Buffer.isBuffer(input) || input instanceof Uint8Array || typeof input === 'string'
      ? Buffer.from(input)
      : null;
    const size = initial ? initial.length : Math.max(0, Number(input || 0));
    const loc = this.db.allocator.allocate(size);

    if (initial && initial.length) this.db.pager.writeExact(loc.offset, initial);
    if (!initial && size > 0) this._zero(loc.offset, size);

    return {
      __awtsmoosBlob: true,
      id: crypto.randomBytes(8).toString('hex'),
      offset: loc.offset,
      length: size,
      meta
    };
  }

  /**
   * @method info
   * @description Returns safe blob metadata.
   * @param {object} blob - Blob token.
   * @returns {object} Blob info.
   */
  info(blob) {
    const b = this._plain(blob);
    this._assertBlob(b);

    return {
      id: b.id,
      offset: b.offset,
      length: b.length,
      meta: b.meta || {}
    };
  }

  /**
   * @method read
   * @description Reads a byte range from a blob.
   * @param {object} blob - Blob token.
   * @param {number} [offset=0] - Blob-relative offset.
   * @param {number} [length] - Byte count.
   * @returns {Buffer} Range bytes.
   */
  read(blob, offset = 0, length = undefined) {
    const b = this._plain(blob);
    this._assertBlob(b);

    const start = this._rangeStart(b, offset);
    const take = length === undefined
      ? b.length - start
      : Math.max(0, Math.min(Number(length || 0), b.length - start));

    return this.db.pager.readExact(b.offset + start, take) || Buffer.alloc(0);
  }

  /**
   * @method write
   * @description Writes bytes at a blob-relative offset, growing by relocation if needed.
   * @param {object} blob - Blob token.
   * @param {number} offset - Blob-relative offset.
   * @param {Buffer|Uint8Array|string} data - Bytes to write.
   * @returns {object} Updated blob token.
   */
  write(blob, offset, data) {
    const b = this._plain(blob);
    this._assertBlob(b);

    const source = Buffer.from(data || []);
    const start = Math.max(0, Number(offset || 0));
    const end = start + source.length;

    if (end <= b.length) {
      if (source.length) this.db.pager.writeExact(b.offset + start, source);
      return b;
    }

    const next = this.create(end, b.meta || {});
    this._copy(b.offset, next.offset, b.length);
    if (source.length) this.db.pager.writeExact(next.offset + start, source);
    this.delete(b);

    return {
      ...b,
      offset: next.offset,
      length: end
    };
  }

  /**
   * @method readAsync
   * @description Reads a range behind a shared byte-range lock.
   * @param {object} blob - Blob token.
   * @param {number} [offset=0] - Blob-relative offset.
   * @param {number} [length] - Byte count.
   * @returns {Promise<Buffer>} Range bytes.
   */
  readAsync(blob, offset = 0, length = undefined) {
    const b = this._plain(blob);
    this._assertBlob(b);
    const start = this._rangeStart(b, offset);
    const take = length === undefined
      ? b.length - start
      : Math.max(0, Math.min(Number(length || 0), b.length - start));

    return this.db.concurrent.rangeRead(this._resource(b), start, take, () => this.read(b, start, take));
  }

  /**
   * @method writeAsync
   * @description Writes behind an exclusive byte-range lock.
   * @param {object} blob - Blob token.
   * @param {number} offset - Blob-relative offset.
   * @param {Buffer|Uint8Array|string} data - Bytes to write.
   * @returns {Promise<object>} Updated blob token.
   */
  writeAsync(blob, offset, data) {
    const b = this._plain(blob);
    this._assertBlob(b);
    const source = Buffer.from(data || []);
    const start = Math.max(0, Number(offset || 0));
    const end = start + source.length;
    const length = Math.max(1, source.length);
    const resource = this._resource(b);

    if (end <= b.length) {
      return this.db.concurrent.rangeWrite(resource, start, length, () => this.write(b, start, source));
    }

    return this.db.concurrent.rangeWrite(resource, 0, Math.max(1, end), () => this.write(b, start, source));
  }

  /**
   * @method resize
   * @description Resizes a blob, preserving existing prefix bytes.
   * @param {object} blob - Blob token.
   * @param {number} size - New size.
   * @returns {object} Updated blob token.
   */
  resize(blob, size) {
    const b = this._plain(blob);
    this._assertBlob(b);

    const nextSize = Math.max(0, Number(size || 0));
    if (nextSize === b.length) return b;

    const next = this.create(nextSize, b.meta || {});
    const keep = Math.min(b.length, nextSize);

    this._copy(b.offset, next.offset, keep);
    this.delete(b);

    return {
      ...b,
      offset: next.offset,
      length: nextSize
    };
  }

  /**
   * @method delete
   * @description Marks blob body space reusable when reuse mode allows it.
   * @param {object} blob - Blob token.
   * @returns {boolean} True when accepted.
   */
  delete(blob) {
    const b = this._plain(blob);
    this._assertBlob(b);
    this.db.allocator.free(b.offset, b.length);
    return true;
  }

  /**
   * @method _plain
   * @param {*} value - Possible live handle.
   * @returns {*} Plain value.
   */
  _plain(value) {
    return value && value.__resolve__ ? value.__resolve__() : value;
  }

  /**
   * @method _assertBlob
   * @param {object} blob - Blob token.
   * @returns {void}
   */
  _assertBlob(blob) {
    if (!blob || blob.__awtsmoosBlob !== true) {
      throw new Error('B"H: Expected an Awtsmoos blob token');
    }
  }

  /**
   * @method _rangeStart
   * @param {object} blob - Blob token.
   * @param {number} offset - Requested offset.
   * @returns {number} Clamped offset.
   */
  _rangeStart(blob, offset) {
    return Math.max(0, Math.min(Number(offset || 0), blob.length));
  }

  /**
   * @method _resource
   * @param {object} blob - Blob token.
   * @returns {string} Lock resource.
   */
  _resource(blob) {
    return `blob:${blob.id || blob.offset}`;
  }

  /**
   * @method _copy
   * @description Copies blob bytes in fixed chunks so large bodies stay calm in RAM.
   * @param {number} from - Source absolute offset.
   * @param {number} to - Destination absolute offset.
   * @param {number} length - Byte count.
   * @returns {void}
   */
  _copy(from, to, length) {
    let pos = 0;

    while (pos < length) {
      const take = Math.min(COPY_CHUNK, length - pos);
      const chunk = this.db.pager.readExact(from + pos, take);
      if (chunk && chunk.length) this.db.pager.writeExact(to + pos, chunk);
      pos += take;
    }
  }

  /**
   * @method _zero
   * @description Writes zeros in reusable chunks instead of allocating the whole void.
   * @param {number} offset - Absolute offset.
   * @param {number} length - Byte count.
   * @returns {void}
   */
  _zero(offset, length) {
    let pos = 0;

    while (pos < length) {
      const take = Math.min(ZERO_CHUNK.length, length - pos);
      this.db.pager.writeExact(offset + pos, ZERO_CHUNK.subarray(0, take));
      pos += take;
    }
  }
}

module.exports = BlobManager;
