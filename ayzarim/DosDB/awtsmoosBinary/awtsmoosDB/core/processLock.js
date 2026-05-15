// B"H

/**
 * @file core/processLock.js
 * @chapter One Writer At The Gate
 * @description Cross-process lock file for direct Node usage.
 */

const fs = require('fs');

class ProcessLock {
  constructor(filePath) {
    this.filePath = `${filePath}.lock`;
    this.fd = null;
    this.owner = false;
  }

  acquire(options = {}) {
    if (options.processLock === false) return true;
    try {
      this.fd = fs.openSync(this.filePath, 'wx');
      fs.writeSync(this.fd, JSON.stringify({ pid: process.pid, at: Date.now() }));
      fs.fsyncSync(this.fd);
      this.owner = true;
      return true;
    } catch (err) {
      if (err && err.code === 'EEXIST' && this._sameProcess()) return true;
      if (err && err.code === 'EEXIST' && this._stale()) {
        try { fs.rmSync(this.filePath, { force: true }); } catch (_err) {}
        return this.acquire(options);
      }
      throw new Error(`B"H: database is already open by another process: ${this.filePath}`);
    }
  }

  release() {
    if (this.fd !== null) {
      try { fs.closeSync(this.fd); } catch (_err) {}
      this.fd = null;
    }
    if (this.owner) {
      try { fs.rmSync(this.filePath, { force: true }); } catch (_err) {}
      this.owner = false;
    }
  }

  _sameProcess() {
    try {
      const meta = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      return Number(meta.pid || 0) === process.pid;
    } catch (_err) {
      return false;
    }
  }

  _stale() {
    try {
      const meta = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      const pid = Number(meta.pid || 0);
      if (!pid) return true;
      process.kill(pid, 0);
      return false;
    } catch (err) {
      return err && err.code === 'ESRCH';
    }
  }
}

module.exports = ProcessLock;
