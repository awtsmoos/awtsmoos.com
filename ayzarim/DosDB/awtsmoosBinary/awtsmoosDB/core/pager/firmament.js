// B"H

/**
 * @file firmament.js
 * @chapter The Page-Cache Firmament
 * @description
 * The pager no longer needs to summon the whole database into RAM. It reads
 * only touched pages, writes only dirty pages, and still presents the same
 * lightning synchronous API to the rest of the system.
 */

const fs = require('fs');

const WAL_MAGIC = Buffer.from('AWAL1');

/**
 * @class PagerFirmament
 * @description Sparse page-cache pager with optional full-mirror mode.
 */
class PagerFirmament {
  /**
   * @constructor
   * @param {string} filePath - Database file path.
   */
  constructor(filePath) {
    this.filePath = filePath;
    this.fd = null;
    this.dirty = false;
    this.isBatching = false;
    this.currentFileSize = 0;
    this.initialized = false;
    this.memory = null;
    this.pageSize = 65536;
    this.pages = new Map();
    this.walPath = `${filePath}.wal`;
    this.walRecords = [];
    this.recovering = false;
  }

  /**
   * @method init
   * @description Opens the file without reading all bytes into RAM.
   * @returns {void}
   */
  init() {
    if (this.initialized) return;

    if (fs.existsSync(this.filePath)) {
      const stat = fs.statSync(this.filePath);
      this.currentFileSize = stat.size;
      this.fd = fs.openSync(this.filePath, 'r+');
    } else {
      this.currentFileSize = 0;
      this.fd = fs.openSync(this.filePath, 'w+');
    }

    this.initialized = true;
    this._recoverWal();

    if (this._useFullMirror()) {
      this.memory = this.currentFileSize > 0
        ? fs.readFileSync(this.filePath)
        : Buffer.allocUnsafe(this.pageSize).fill(0);
    }
  }

  /**
   * @method _useFullMirror
   * @description Checks whether the legacy whole-file mirror is explicitly enabled.
   * @returns {boolean} True for full mirror mode.
   */
  _useFullMirror() {
    return !!(this.db && this.db.options && this.db.options.fullMemoryMirror === true);
  }

  /**
   * @method _useWal
   * @description Checks whether exact-byte WAL is enabled.
   * @returns {boolean} True when WAL should protect fsync.
   */
  _useWal() {
    return !(this.db && this.db.options && this.db.options.wal === false);
  }

  /**
   * @method _recoverWal
   * @description Replays committed WAL records from a prior interrupted fsync.
   * @returns {void}
   */
  _recoverWal() {
    if (!this._useWal() || !fs.existsSync(this.walPath)) return;

    const stat = fs.statSync(this.walPath);
    if (stat.size === 0) return;

    const fd = fs.openSync(this.walPath, 'r+');
    const header = Buffer.allocUnsafe(WAL_MAGIC.length);
    let pos = 0;

    try {
      fs.readSync(fd, header, 0, header.length, pos);
      pos += header.length;
      if (!header.equals(WAL_MAGIC)) {
        fs.ftruncateSync(fd, 0);
        return;
      }

      this.recovering = true;

      while (pos + 12 <= stat.size) {
        const h = Buffer.allocUnsafe(12);
        fs.readSync(fd, h, 0, 12, pos);
        pos += 12;

        const offset = Number(h.readBigUInt64BE(0));
        const length = h.readUInt32BE(8);
        if (length < 0 || pos + length > stat.size) break;

        const data = Buffer.allocUnsafe(length);
        if (length) fs.readSync(fd, data, 0, length, pos);
        pos += length;
        fs.writeSync(this.fd, data, 0, data.length, offset);
        this.currentFileSize = Math.max(this.currentFileSize, offset + data.length);
      }

      fs.fsyncSync(this.fd);
      fs.ftruncateSync(fd, 0);
      fs.fsyncSync(fd);
    } finally {
      this.recovering = false;
      fs.closeSync(fd);
    }
  }

  /**
   * @method _recordWal
   * @description Queues one exact write for WAL protection at fsync.
   * @param {number} offset - Write offset.
   * @param {Buffer} buf - Write bytes.
   * @returns {void}
   */
  _recordWal(offset, buf) {
    if (this.recovering || !this._useWal() || !buf || buf.length === 0) return;
    this.walRecords.push({ offset, data: Buffer.from(buf) });
  }

  /**
   * @method _flushWal
   * @description Writes queued WAL records to disk before data pages.
   * @returns {void}
   */
  _flushWal() {
    if (!this._useWal() || this.walRecords.length === 0) return;

    const fd = fs.openSync(this.walPath, 'w+');
    try {
      fs.writeSync(fd, WAL_MAGIC, 0, WAL_MAGIC.length, 0);
      let pos = WAL_MAGIC.length;

      for (const rec of this.walRecords) {
        const h = Buffer.allocUnsafe(12);
        h.writeBigUInt64BE(BigInt(rec.offset), 0);
        h.writeUInt32BE(rec.data.length, 8);
        fs.writeSync(fd, h, 0, h.length, pos);
        pos += h.length;
        if (rec.data.length) {
          fs.writeSync(fd, rec.data, 0, rec.data.length, pos);
          pos += rec.data.length;
        }
      }

      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
  }

  /**
   * @method _clearWal
   * @description Clears WAL after data is safely flushed.
   * @returns {void}
   */
  _clearWal() {
    this.walRecords = [];
    if (!this._useWal()) return;

    const fd = fs.openSync(this.walPath, 'w+');
    try {
      fs.ftruncateSync(fd, 0);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
  }

  /**
   * @method _pageIndex
   * @param {number} offset - Absolute byte offset.
   * @returns {number} Page index.
   */
  _pageIndex(offset) {
    return Math.floor(offset / this.pageSize);
  }

  /**
   * @method _loadPage
   * @description Loads one page on demand.
   * @param {number} index - Page index.
   * @returns {{buf:Buffer,dirty:boolean}} Page record.
   */
  _loadPage(index) {
    let page = this.pages.get(index);
    if (page) return page;

    const buf = Buffer.allocUnsafe(this.pageSize).fill(0);
    const start = index * this.pageSize;

    if (start < this.currentFileSize) {
      const max = Math.min(this.pageSize, this.currentFileSize - start);
      fs.readSync(this.fd, buf, 0, max, start);
    }

    page = { buf, dirty: false };
    this.pages.set(index, page);
    return page;
  }

  /**
   * @method readExact
   * @description Reads exactly the requested bytes, touching only needed pages.
   * @param {number} offset - Start byte.
   * @param {number} length - Byte count.
   * @returns {Buffer|null} Bytes or null when outside reality.
   */
  readExact(offset, length) {
    if (!this.initialized) this.init();
    if (length <= 0) return Buffer.alloc(0);
    if (offset < 0 || offset + length > this.currentFileSize) return null;

    if (this.memory) {
      if (offset + length > this.memory.length) return null;
      return this.memory.subarray(offset, offset + length);
    }

    const out = Buffer.allocUnsafe(length);
    let copied = 0;

    while (copied < length) {
      const absolute = offset + copied;
      const page = this._loadPage(this._pageIndex(absolute));
      const pageOffset = absolute % this.pageSize;
      const take = Math.min(length - copied, this.pageSize - pageOffset);

      page.buf.copy(out, copied, pageOffset, pageOffset + take);
      copied += take;
    }

    return out;
  }

  /**
   * @method writeExact
   * @description Writes bytes into touched pages only.
   * @param {number} offset - Start byte.
   * @param {Buffer} buf - Bytes to write.
   * @returns {void}
   */
  writeExact(offset, buf) {
    if (!this.initialized) this.init();
    if (!buf || buf.length === 0) return;
    this._recordWal(offset, buf);

    if (this.memory) {
      const requiredEnd = offset + buf.length;
      if (requiredEnd > this.memory.length) this._expandUniverse(requiredEnd);
      buf.copy(this.memory, offset);
      this.currentFileSize = Math.max(this.currentFileSize, requiredEnd);
      this.dirty = true;
      return;
    }

    let copied = 0;

    while (copied < buf.length) {
      const absolute = offset + copied;
      const page = this._loadPage(this._pageIndex(absolute));
      const pageOffset = absolute % this.pageSize;
      const take = Math.min(buf.length - copied, this.pageSize - pageOffset);

      buf.copy(page.buf, pageOffset, copied, copied + take);
      page.dirty = true;
      copied += take;
    }

    this.currentFileSize = Math.max(this.currentFileSize, offset + buf.length);
    this.dirty = true;
  }

  /**
   * @method logicalSize
   * @description Returns the exact byte boundary to flush.
   * @returns {number} Logical byte size.
   */
  logicalSize() {
    const cursor = this.db && this.db.allocator
      ? Number(this.db.allocator.cursor || 0)
      : 0;

    if (Number.isFinite(cursor) && cursor >= 64) return cursor;
    return this.currentFileSize;
  }

  /**
   * @method memoryBytes
   * @description Reports bytes currently held by the pager.
   * @returns {number} Pager-owned RAM bytes.
   */
  memoryBytes() {
    if (this.memory) return this.memory.length;
    return this.pages.size * this.pageSize;
  }

  /**
   * @method _expandUniverse
   * @description Expands full-mirror mode.
   * @param {number} minSize - Required byte length.
   * @returns {void}
   */
  _expandUniverse(minSize) {
    let newSize = Math.max(minSize, this.memory.length * 2, this.pageSize);
    newSize = (newSize + 4095) & ~4095;

    const biggerMirror = Buffer.allocUnsafe(newSize).fill(0);
    this.memory.copy(biggerMirror, 0, 0, this.memory.length);
    this.memory = biggerMirror;
  }

  /**
   * @method fsync
   * @description Writes dirty pages and truncates to logical size.
   * @param {boolean} [force=false] - Ignore batching flag.
   * @returns {void}
   */
  fsync(force = false) {
    if (!this.dirty || this.fd === null) return;
    if (!force && this.isBatching) return;

    const exactSize = Math.max(0, this.logicalSize());
    this._flushWal();

    if (this.memory) {
      if (exactSize > 0) fs.writeSync(this.fd, this.memory, 0, exactSize, 0);
    } else {
      for (const [index, page] of this.pages) {
        if (!page.dirty) continue;

        const start = index * this.pageSize;
        if (start >= exactSize) {
          page.dirty = false;
          continue;
        }

        const len = Math.min(this.pageSize, exactSize - start);
        fs.writeSync(this.fd, page.buf, 0, len, start);
        page.dirty = false;
      }
    }

    fs.ftruncateSync(this.fd, exactSize);
    fs.fsyncSync(this.fd);
    this.currentFileSize = exactSize;
    this.dirty = false;
    this._clearWal();
  }

  /**
   * @method close
   * @description Flushes and releases cached pages.
   * @returns {void}
   */
  close() {
    this.fsync(true);

    if (this.fd !== null) {
      try { fs.closeSync(this.fd); } catch (_err) {}
      this.fd = null;
    }

    this.memory = null;
    this.pages.clear();
    this.initialized = false;
  }
}

module.exports = PagerFirmament;
