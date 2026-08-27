// B"H
/**
 * @file locks.js
 * @chapter The Synchronous Gate Did Not Lie To Old Callers
 * @description
 * VirtualFs mutations are synchronous today because AwtsmoosDB's low-level APIs
 * are synchronous. This guard prevents recursive interleaved filesystem writes
 * while preserving the historical `db.fs.write()` return shape.
 */

function enterWrite(db, label, fn) {
  if (db.__awtsmoosFs3Writing) throw new Error(`FS_WRITE_REENTRANT: ${label}`);
  db.__awtsmoosFs3Writing = true;
  try { return fn(); }
  finally { db.__awtsmoosFs3Writing = false; }
}

module.exports = { enterWrite };
