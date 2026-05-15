// B"H
const fs = require('fs');
const p = 'core/pager/firmament.js';
let s = fs.readFileSync(p, 'utf8');

s = s.replace(
`    this.walRecords = [];
    this.recovering = false;`,
`    this.walRecords = [];
    this.walFd = null;
    this.walPosition = 0;
    this.walActive = false;
    this.recovering = false;`
);

s = s.replace(
`  /**
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
  }`,
`  /**
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
  }`
);

s = s.replace(
`    const exactSize = Math.max(0, this.logicalSize());

    for (const [index, page] of this.pages) {`,
`    const exactSize = Math.max(0, this.logicalSize());
    if (this._useWal()) this._flushWal();

    for (const [index, page] of this.pages) {`
);

s = s.replace(
`    if (this.fd !== null) {
      try { fs.closeSync(this.fd); } catch (_err) {}`, 
`    if (this.walFd !== null) {
      try { fs.closeSync(this.walFd); } catch (_err) {}
      this.walFd = null;
    }

    if (this.fd !== null) {
      try { fs.closeSync(this.fd); } catch (_err) {}`
);

fs.writeFileSync(p, s);
console.log('patched streaming WAL');
