// B"H

/**
 * @file firmament.js
 * @chapter The Page-Cache Firmament
 * @description
 * Sparse page-cache pager with bounded memory pressure. It never needs to
 * summon the whole database into RAM. Pages are read on demand, clean pages are
 * evicted LRU-style, dirty pages can be pressure-flushed without fsync, and
 * close()/waitForIdle() still perform the durable boundary.
 */

const fs = require('fs');

const WAL_MAGIC = Buffer.from('AWAL1');
const DEFAULT_PAGE_SIZE = 65536;
const DEFAULT_MAX_CACHED_PAGES = 512;
const DEFAULT_DIRTY_FLUSH_THRESHOLD = 384;

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
    this.pageSize = DEFAULT_PAGE_SIZE;
    this.pages = new Map();
    this.walPath = `${filePath}.wal`;
    this.walRecords = [];
    this.walFd = null;
    this.walPosition = 0;
    this.walActive = false;
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
   * @method _optionNumber
   * @private
   * @param {string} key - Option key.
   * @param {number} fallback - Default value.
   * @returns {number} Positive numeric option.
   */
  _optionNumber(key, fallback) {
    const raw = this.db && this.db.options ? this.db.options[key] : undefined;
    const n = Number(raw === undefined ? fallback : raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
  }

  /**
   * @method _maxCachedPages
   * @private
   * @returns {number} Maximum sparse pages to hold.
   */
  _maxCachedPages() {
    return this._optionNumber('maxCachedPages', DEFAULT_MAX_CACHED_PAGES);
  }

  /**
   * @method _dirtyFlushThreshold
   * @private
   * @returns {number} Dirty-page pressure threshold.
   */
  _dirtyFlushThreshold() {
    const max = this._maxCachedPages();
    return Math.min(max, this._optionNumber('dirtyPageFlushThreshold', DEFAULT_DIRTY_FLUSH_THRESHOLD));
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
   * @method _ensureWalOpen
   * @private
   * @description Opens the WAL stream and writes its magic header once.
   * @returns {void}
   */
  _ensureWalOpen() {
    if (this.walFd !== null) return;
    this.walFd = fs.openSync(this.walPath, 'w+');
    fs.writeSync(this.walFd, WAL_MAGIC, 0, WAL_MAGIC.length, 0);
    this.walPosition = WAL_MAGIC.length;
    this.walActive = true;
  }

  /**
   * @method _recordWal
   * @description Streams one exact write record to WAL without retaining bytes in RAM.
   * @param {number} offset - Write offset.
   * @param {Buffer} buf - Write bytes.
   * @returns {void}
   */
  _recordWal(offset, buf) {
    if (this.recovering || !this._useWal() || !buf || buf.length === 0) return;
    this._ensureWalOpen();

    const h = Buffer.allocUnsafe(12);
    h.writeBigUInt64BE(BigInt(offset), 0);
    h.writeUInt32BE(buf.length, 8);
    fs.writeSync(this.walFd, h, 0, h.length, this.walPosition);
    this.walPosition += h.length;
    fs.writeSync(this.walFd, buf, 0, buf.length, this.walPosition);
    this.walPosition += buf.length;
  }

  /**
   * @method _flushWal
   * @description Fsyncs streamed WAL records before dirty data pages are written.
   * @returns {void}
   */
  _flushWal() {
    if (!this._useWal() || !this.walActive || this.walFd === null) return;
    fs.fsyncSync(this.walFd);
  }

  /**
   * @method _clearWal
   * @description Clears WAL after data is safely flushed.
   * @returns {void}
   */
  _clearWal() {
    this.walRecords = [];
    if (this.walFd !== null) {
      try { fs.closeSync(this.walFd); } catch (_err) {}
      this.walFd = null;
    }
    this.walPosition = 0;
    this.walActive = false;
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
   * @method _rememberPage
   * @private
   * @description Stores/touches a page as most-recently-used.
   * @param {number} index - Page index.
   * @param {object} page - Page record.
   * @returns {object} Page record.
   */
  _rememberPage(index, page) {
    if (this.pages.has(index)) this.pages.delete(index);
    this.pages.set(index, page);
    return page;
  }

  /**
   * @method _loadPage
   * @description Loads one page on demand.
   * @param {number} index - Page index.
   * @returns {{buf:Buffer,dirty:boolean}} Page record.
   */
  _loadPage(index) {
    let page = this.pages.get(index);
    if (page) return this._rememberPage(index, page);

    const buf = Buffer.allocUnsafe(this.pageSize).fill(0);
    const start = index * this.pageSize;

    if (start < this.currentFileSize) {
      const max = Math.min(this.pageSize, this.currentFileSize - start);
      fs.readSync(this.fd, buf, 0, max, start);
    }

    page = this._rememberPage(index, { buf, dirty: false });
    this._enforceCacheLimit();
    return page;
  }

  /**
   * @method _dirtyPageCount
   * @private
   * @returns {number} Dirty page count.
   */
  _dirtyPageCount() {
    let count = 0;
    for (const page of this.pages.values()) if (page.dirty) count++;
    return count;
  }

  /**
   * @method _writeDirtyPage
   * @private
   * @description Writes one dirty sparse page without fsync/truncate.
   * @param {number} index - Page index.
   * @param {object} page - Page record.
   * @param {number} exactSize - Logical byte boundary.
   * @returns {boolean} True when written or cleared.
   */
  _writeDirtyPage(index, page, exactSize) {
    if (!page || !page.dirty || this.fd === null) return false;

    const start = index * this.pageSize;
    if (start >= exactSize) {
      page.dirty = false;
      return true;
    }

    const len = Math.min(this.pageSize, exactSize - start);
    if (len > 0) fs.writeSync(this.fd, page.buf, 0, len, start);
    page.dirty = false;
    return true;
  }

  /**
   * @method _pressureFlushDirtyPages
   * @private
   * @description Writes oldest dirty pages until pressure is below threshold.
   * @returns {void}
   */
  _pressureFlushDirtyPages() {
    if (this.memory || this.fd === null) return;

    const threshold = this._dirtyFlushThreshold();
    let dirtyCount = this._dirtyPageCount();
    if (dirtyCount <= threshold) return;

    const exactSize = Math.max(0, this.logicalSize());
    if (this._useWal()) this._flushWal();

    for (const [index, page] of this.pages) {
      if (dirtyCount <= threshold) break;
      if (!page.dirty) continue;
      if (this._writeDirtyPage(index, page, exactSize)) dirtyCount--;
    }

    this.dirty = this._dirtyPageCount() > 0;
  }

  /**
   * @method _enforceCacheLimit
   * @private
   * @description Evicts clean LRU pages and pressure-flushes dirty pages if needed.
   * @returns {void}
   */
  _enforceCacheLimit() {
    if (this.memory) return;

    const maxPages = this._maxCachedPages();
    if (this.pages.size <= maxPages) return;

    for (const [index, page] of this.pages) {
      if (this.pages.size <= maxPages) return;
      if (page.dirty) continue;
      this.pages.delete(index);
    }

    if (this.pages.size <= maxPages) return;
    this._pressureFlushDirtyPages();

    for (const [index, page] of this.pages) {
      if (this.pages.size <= maxPages) return;
      if (page.dirty) continue;
      this.pages.delete(index);
    }
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
      const pageIndex = this._pageIndex(absolute);
      const page = this._loadPage(pageIndex);
      const pageOffset = absolute % this.pageSize;
      const take = Math.min(buf.length - copied, this.pageSize - pageOffset);

      buf.copy(page.buf, pageOffset, copied, copied + take);
      page.dirty = true;
      this._rememberPage(pageIndex, page);
      copied += take;
    }

    this.currentFileSize = Math.max(this.currentFileSize, offset + buf.length);
    this.dirty = true;
    this._pressureFlushDirtyPages();
    this._enforceCacheLimit();
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
        this._writeDirtyPage(index, page, exactSize);
      }
    }

    fs.ftruncateSync(this.fd, exactSize);
    fs.fsyncSync(this.fd);
    this.currentFileSize = exactSize;
    this.dirty = false;
    this._clearWal();
    this._enforceCacheLimit();
  }

  /**
   * @method close
   * @description Flushes and releases cached pages.
   * @returns {void}
   */
  close() {
    this.fsync(true);

    if (this.walFd !== null) {
      try { fs.closeSync(this.walFd); } catch (_err) {}
      this.walFd = null;
    }

    if (this.walFd !== null) {
      try { fs.closeSync(this.walFd); } catch (_err) {}
      this.walFd = null;
    }

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
