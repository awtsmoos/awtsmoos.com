// B"H
/** Read-only pooled AwtsmoosDB handles for imported corpora. */
const fs = require('fs');
const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON');
const pool = new Map();
function fingerprint(file) {
  const stat = fs.statSync(file);
  return `${stat.size}:${Math.floor(stat.mtimeMs)}`;
}
function closeOne(entry) {
  try { entry?.db?.pager?.close?.(); entry?.db?.processLock?.release?.(); } catch {}
}
function getDb(file) {
  if (!file || !fs.existsSync(file)) return null;
  const mark = fingerprint(file);
  const current = pool.get(file);
  if (current?.mark === mark) return current.db;
  closeOne(current);
  const db = new AwtsmoosDB(file, {
    readOnly: true,
    readonly: true,
    wal: false,
    processLockMode: 'shared',
    lockMode: 'shared',
    maxCachedPages: 64
  });
  db.open();
  db.fs.ready();
  pool.set(file, { db, mark });
  return db;
}
function read(file, virtualPath) {
  try {
    const db = getDb(file);
    if (!db) return null;
    const stat = db.fs.stat(virtualPath);
    if (!stat?.exists || stat.type !== 'file' || Number(stat.size) <= 1) return null;
    return awts.deserializeBinary(db.fs.readRange(virtualPath, 0, stat.size));
  } catch { return null; }
}
function list(file, virtualPath) {
  try {
    const db = getDb(file);
    return db ? db.fs.ls(virtualPath) : [];
  } catch { return []; }
}
function sourceMark(file) {
  try { return fingerprint(file); } catch { return 'missing'; }
}
function closeAll() {
  for (const entry of pool.values()) closeOne(entry);
  pool.clear();
}
process.once('exit', closeAll);
module.exports = { read, list, sourceMark, closeAll };
