// B"H
const DB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON');
function open(file) {
  const db = new DB(file, { readOnly: true, wal: false, processLockMode: 'shared', lockMode: 'shared', maxCachedPages: 32 });
  db.open();
  db.fs.ready();
  return db;
}
function close(db) {
  try { db?.pager?.close?.(); db?.processLock?.release?.(); } catch {}
}
function files(db) {
  return Object.values(db.__fs3Manifest.inodes || {}).filter(x => x && x.type === 'file' && !x.deleted);
}
function decode(db, inode) {
  if (!inode || Number(inode.size) <= 1) return null;
  try { return awts.deserializeBinary(db.fs.readRange(inode.path, 0, inode.size)); } catch { return null; }
}
function objectKeys(value) {
  if (!value || typeof value !== 'object') return [];
  return Array.isArray(value) ? value.map(x => x?.id).filter(Boolean) : Object.keys(value).filter(x => x !== '$awtsmoosObjectShape');
}
module.exports = { open, close, files, decode, objectKeys };
