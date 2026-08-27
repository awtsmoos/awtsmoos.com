// B"H
/**
 * @file read.js
 * @chapter The Reader Touched Only The Needed Bytes
 * @description
 * Exact reads for VirtualFs v3. File content is read from inline buffers or
 * AwtsmoosDB blobs by offset and length. Directory reads list child names only.
 */

const paths = require("./path");
const store = require("./store");
const legacy = require("./legacy");
const { readDataRecord } = require("./blobValue");

function readRange(fs, p, offset = 0, length) {
  const fullPath = paths.normalize(fs.cwd, p);
  const inode = store.pathToInode(fs.db, fullPath);
  if (inode) {
    if (inode.type !== "file") return list(fs, fullPath);
    return readDataRecord(fs.db, inode, offset, length);
  }
  return legacy.legacyCat(fs.db, fullPath, { offset, length });
}

function cat(fs, p = ".", options = {}) {
  const fullPath = paths.normalize(fs.cwd, p);
  const inode = store.pathToInode(fs.db, fullPath);
  if (inode) {
    if (inode.type === "dir") return list(fs, fullPath);
    return readDataRecord(fs.db, inode, options.offset || 0, options.length);
  }
  return legacy.legacyCat(fs.db, fullPath, options);
}

function list(fs, p = ".") {
  const fullPath = paths.normalize(fs.cwd, p);
  const inode = store.pathToInode(fs.db, fullPath);
  if (inode && inode.type === "dir") return Object.keys(store.getChildren(fs.db, inode.id)).sort();
  return legacy.legacyLs(fs.db, fullPath);
}

module.exports = { cat, readRange, list };
