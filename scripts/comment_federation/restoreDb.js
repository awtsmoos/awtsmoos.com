// B"H
const DB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON');
function open(file, readOnly = true) {
  const db = new DB(file, {
    readOnly,
    readonly: readOnly,
    wal: !readOnly,
    processLockMode: readOnly ? 'shared' : 'exclusive',
    lockMode: readOnly ? 'shared' : 'exclusive',
    maxCachedPages: 64
  });
  db.open();
  db.fs.ready();
  return db;
}
function close(db) {
  try { db?.fs?.flush?.(); db?.close?.(); } catch {
    try { db?.pager?.close?.(); db?.processLock?.release?.(); } catch {}
  }
}
function files(db) {
  return Object.values(db.__fs3Manifest.inodes || {}).filter(x => x && x.type === 'file' && !x.deleted);
}
function readRaw(db, virtualPath) {
  const stat = db.fs.stat(virtualPath);
  if (!stat?.exists || stat.type !== 'file' || Number(stat.size) <= 1) return null;
  return db.fs.readRange(virtualPath, 0, stat.size);
}
function decodeRaw(raw) {
  return raw ? awts.deserializeBinary(raw) : null;
}
function encode(value) {
  return awts.serializeJSON(value);
}
module.exports = { open, close, files, readRaw, decodeRaw, encode };
