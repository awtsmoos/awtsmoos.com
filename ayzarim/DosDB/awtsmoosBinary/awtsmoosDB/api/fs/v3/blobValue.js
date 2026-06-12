// B"H
/**
 * @file blobValue.js
 * @chapter No Payload Hid Inside The Manifest
 * @description
 * Exact byte storage helpers. Every virtual file payload is stored as an
 * AwtsmoosDB blob with its exact length. This keeps the v3 filesystem manifest
 * pure metadata, so one comments DB can hold tens of thousands of small files
 * without flushing their bodies inside a giant JSON manifest. No block padding,
 * no rounded file payload, no phantom bytes.
 */

function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (value === undefined || value === null) return Buffer.alloc(0);
  if (typeof value === "string") return Buffer.from(value, "utf8");
  return Buffer.from(JSON.stringify(value), "utf8");
}

function plain(value) {
  return value && value.__resolve__ ? value.__resolve__() : value;
}

function makeDataRecord(db, value, meta = {}) {
  const buffer = toBuffer(value);
  return { kind: "blob", data: db.blob.create(buffer, meta), size: buffer.length };
}

function freeDataRecord(db, inode) {
  const data = plain(inode && inode.data);
  if (!inode || inode.dataKind !== "blob" || !data || data.__awtsmoosBlob !== true) return false;
  db.blob.delete(data);
  return true;
}

function readDataRecord(db, inode, offset = 0, length) {
  const start = Math.max(0, offset || 0);
  const wanted = length === undefined ? inode.size - start : Math.max(0, length);
  const blob = plain(inode.data);
  return db.blob.read(blob, start, wanted);
}

function replaceDataRecord(db, inode, value, meta = {}) {
  const previousKind = inode.dataKind;
  const previousData = inode.data;
  const record = makeDataRecord(db, value, meta);
  inode.dataKind = record.kind;
  inode.data = record.data;
  inode.size = record.size;
  inode.mtime = Date.now();
  inode.version = (inode.version || 0) + 1;
  if (previousKind === "blob") freeDataRecord(db, { dataKind: previousKind, data: previousData });
  return inode;
}

module.exports = { toBuffer, makeDataRecord, readDataRecord, replaceDataRecord, freeDataRecord };
