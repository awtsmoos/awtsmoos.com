// B"H
/**
 * @file stat.js
 * @chapter The Spark Declared Its True Garment
 * @description
 * Metadata-only inspection for VirtualFs v3. Stat never reads file bytes; it
 * asks the inode what vessel it wears. A directory says `dir`, a file says
 * `file`, and exact byte size remains sealed in the manifest.
 */

const paths = require("./path");
const store = require("./store");
const legacy = require("./legacy");

function stat(fs, p = ".") {
  const fullPath = paths.normalize(fs.cwd, p);
  const inode = store.pathToInode(fs.db, fullPath);
  if (inode) return {
    exists: true,
    type: inode.type,
    inodeId: inode.id,
    size: inode.size || 0,
    path: inode.path,
    mtime: inode.mtime,
    version: inode.version
  };
  const node = legacy.legacyNode(fs.db, fullPath);
  return { exists: node !== undefined, type: Buffer.isBuffer(node) ? "buffer" : Array.isArray(node) ? "array" : typeof node };
}

function exists(fs, p = ".") {
  const fullPath = paths.normalize(fs.cwd, p);
  return Boolean(store.pathToInode(fs.db, fullPath)) || legacy.legacyExists(fs.db, fullPath);
}

module.exports = { stat, exists };
