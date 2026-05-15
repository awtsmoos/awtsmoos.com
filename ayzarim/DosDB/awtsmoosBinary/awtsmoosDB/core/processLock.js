// B"H

/**
 * @file core/processLock.js
 * @chapter One Writer At The Gate
 * @description
 * Cross-process lock files for direct Node usage.
 *
 * Default mode is exclusive, preserving the existing one-writer safety.
 * Shared/read mode is available through options:
 *
 *   new AwtsmoosDB(path, { processLockMode: 'shared' })
 *   new AwtsmoosDB(path, { lockMode: 'shared' })
 *   new AwtsmoosDB(path, { readOnly: true })
 *
 * Safety notes:
 * - Exclusive opens block other exclusive opens and active shared readers.
 * - Shared opens can coexist with other shared opens.
 * - Shared opens block while an exclusive writer is alive.
 * - Stale lock files are swept when their owning PID no longer exists.
 */

const fs = require('fs');
const path = require('path');

class ProcessLock {
  constructor(filePath) {
    this.dbPath = filePath;
    this.filePath = `${filePath}.lock`;
    this.readerDir = `${filePath}.readers`;
    this.fd = null;
    this.owner = false;
    this.mode = null;
    this.readerPath = null;
  }

  /**
   * @method acquire
   * @description Acquires an exclusive or shared process lock.
   * @param {object} [options={}] - Lock options.
   * @returns {boolean} True when acquired.
   */
  acquire(options = {}) {
    if (options.processLock === false) return true;

    const mode = this._modeFromOptions(options);
    const waitMs = Math.max(0, Number(options.lockWaitMs || 0));
    const started = Date.now();

    while (true) {
      try {
        return mode === 'shared'
          ? this._acquireShared(options)
          : this._acquireExclusive(options);
      } catch (err) {
        if (!this._isBusy(err) || Date.now() - started >= waitMs) throw err;
        this._sleep(Math.min(25, waitMs - (Date.now() - started)));
      }
    }
  }

  /**
   * @method release
   * @description Releases this process lock.
   * @returns {void}
   */
  release() {
    if (this.fd !== null) {
      try { fs.closeSync(this.fd); } catch (_err) {}
      this.fd = null;
    }

    if (this.owner && this.mode === 'exclusive') {
      try { fs.rmSync(this.filePath, { force: true }); } catch (_err) {}
    }

    if (this.owner && this.mode === 'shared' && this.readerPath) {
      try { fs.rmSync(this.readerPath, { force: true }); } catch (_err) {}
      this._tryRemoveReaderDir();
    }

    this.owner = false;
    this.mode = null;
    this.readerPath = null;
  }

  _acquireExclusive(options) {
    this._cleanStaleExclusive();
    this._cleanStaleReaders();

    const activeReaders = this._activeReaders();
    if (activeReaders.length) {
      throw this._busy(`B"H: database has active shared readers: ${this.dbPath}`);
    }

    try {
      this.fd = fs.openSync(this.filePath, 'wx');
      fs.writeSync(this.fd, JSON.stringify(this._meta('exclusive')));
      fs.fsyncSync(this.fd);
      this.owner = true;
      this.mode = 'exclusive';
      return true;
    } catch (err) {
      if (err && err.code === 'EEXIST' && this._sameProcess(this.filePath)) {
        this.mode = 'exclusive';
        return true;
      }

      if (err && err.code === 'EEXIST') {
        this._cleanStaleExclusive();
        if (!fs.existsSync(this.filePath)) return this._acquireExclusive(options);
      }

      throw this._busy(`B"H: database is already open by another process: ${this.filePath}`);
    }
  }

  _acquireShared(options) {
    this._cleanStaleExclusive();
    this._cleanStaleReaders();

    if (fs.existsSync(this.filePath) && !this._sameProcess(this.filePath)) {
      throw this._busy(`B"H: database has an active exclusive writer: ${this.filePath}`);
    }

    fs.mkdirSync(this.readerDir, { recursive: true });

    const safePid = String(process.pid).replace(/[^0-9]/g, '');
    const token = `${safePid}-${Date.now()}-${Math.random().toString(36).slice(2)}.lock`;
    this.readerPath = path.join(this.readerDir, token);

    this.fd = fs.openSync(this.readerPath, 'wx');
    fs.writeSync(this.fd, JSON.stringify(this._meta('shared')));
    fs.fsyncSync(this.fd);

    this.owner = true;
    this.mode = 'shared';
    return true;
  }

  _modeFromOptions(options) {
    const raw = options.processLockMode || options.lockMode || (options.readOnly ? 'shared' : 'exclusive');
    const mode = String(raw || 'exclusive').toLowerCase();
    return mode === 'shared' || mode === 'read' || mode === 'reader'
      ? 'shared'
      : 'exclusive';
  }

  _meta(mode) {
    return {
      pid: process.pid,
      mode,
      at: Date.now(),
      dbPath: this.dbPath
    };
  }

  _sameProcess(lockPath) {
    const meta = this._readMeta(lockPath);
    return Number(meta.pid || 0) === process.pid;
  }

  _cleanStaleExclusive() {
    if (!fs.existsSync(this.filePath)) return;
    const meta = this._readMeta(this.filePath);
    if (this._isAlive(Number(meta.pid || 0))) return;
    try { fs.rmSync(this.filePath, { force: true }); } catch (_err) {}
  }

  _cleanStaleReaders() {
    let items;
    try {
      items = fs.readdirSync(this.readerDir, { withFileTypes: true });
    } catch (_err) {
      return;
    }

    for (const item of items) {
      if (!item.isFile()) continue;
      const fullPath = path.join(this.readerDir, item.name);
      const meta = this._readMeta(fullPath);
      if (this._isAlive(Number(meta.pid || 0))) continue;
      try { fs.rmSync(fullPath, { force: true }); } catch (_err) {}
    }

    this._tryRemoveReaderDir();
  }

  _activeReaders() {
    let items;
    try {
      items = fs.readdirSync(this.readerDir, { withFileTypes: true });
    } catch (_err) {
      return [];
    }

    const active = [];
    for (const item of items) {
      if (!item.isFile()) continue;
      const fullPath = path.join(this.readerDir, item.name);
      const meta = this._readMeta(fullPath);
      if (this._isAlive(Number(meta.pid || 0))) active.push({ path: fullPath, meta });
    }
    return active;
  }

  _readMeta(lockPath) {
    try {
      return JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    } catch (_err) {
      return {};
    }
  }

  _isAlive(pid) {
    if (!pid) return false;

    try {
      process.kill(pid, 0);
      return true;
    } catch (err) {
      if (!err) return false;
      if (err.code === 'ESRCH') return false;
      if (err.code === 'EPERM') return true;
      return false;
    }
  }

  _tryRemoveReaderDir() {
    try { fs.rmdirSync(this.readerDir); } catch (_err) {}
  }

  _busy(message) {
    const err = new Error(message);
    err.code = 'AWTSMOOS_DB_LOCK_BUSY';
    return err;
  }

  _isBusy(err) {
    return err && err.code === 'AWTSMOOS_DB_LOCK_BUSY';
  }

  _sleep(ms) {
    if (ms <= 0) return;
    const end = Date.now() + ms;
    while (Date.now() < end) {}
  }
}

module.exports = ProcessLock;
