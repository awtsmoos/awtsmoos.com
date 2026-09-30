// B"H

/**
 * @file api/transaction/journal.js
 * @chapter The Ledger That Remembers Before
 * @description Durable transaction journal and crash recovery.
 */

const fs = require('fs');
const binaryJson = require('../../utils/binaryJson.js');

class TransactionJournal {
  constructor(db) {
    this.db = db;
    this.filePath = `${db.pager.filePath}.txn.json`;
  }

  begin(snapshot) {
    const tmp = `${this.filePath}.tmp`;
    fs.writeFileSync(tmp, binaryJson.encode({ state: 'active', at: Date.now(), snapshot }));
    fs.renameSync(tmp, this.filePath);
    syncFile(this.filePath);
  }

  commit() {
    if (!fs.existsSync(this.filePath)) return;
    fs.writeFileSync(this.filePath, binaryJson.encode({ state: 'committed', at: Date.now() }));
    syncFile(this.filePath);
    fs.rmSync(this.filePath, { force: true });
  }

  abort() {
    fs.rmSync(this.filePath, { force: true });
  }

  recover() {
    if (!fs.existsSync(this.filePath)) return { recovered: false };
    let payload = null;
    try { payload = decodeJournalPayload(fs.readFileSync(this.filePath)); } catch (_err) {}
    if (!payload || payload.state === 'committed') {
      this.abort();
      return { recovered: false };
    }
    this.restoreRoot(payload.snapshot || {});
    this.db.waitForIdle({ closing: false });
    this.abort();
    return { recovered: true };
  }

  restoreRoot(snapshot) {
    for (const key of this.db.keys(this.db.root, { limit: Infinity })) delete this.db.root[key];
    for (const key of Object.keys(snapshot || {})) this.db.root[key] = snapshot[key];
  }
}

/**
 * Decodes a journal payload. Current files are AwtsmoosBinaryJSON;
 * legacy JSON-text journals fall back to JSON.parse.
 */
function decodeJournalPayload(buffer) {
  // binaryJson.decode warns and returns null (not throw) on non-binary input.
  try {
    const decoded = binaryJson.decode(buffer);
    if (decoded !== null && decoded !== undefined) return decoded;
  } catch (_err) {}
  return JSON.parse(buffer.toString('utf8'));
}

function syncFile(filePath) {
  const fd = fs.openSync(filePath, 'r+');
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}

module.exports = TransactionJournal;
