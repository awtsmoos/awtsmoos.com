// B"H
/**
 * @file delete.js
 * @chapter The Removed Spark Returned Its Body To The Storehouse
 * @description
 * File and directory deletion for VirtualFs v3. Recursive deletion walks every
 * child, frees blob-backed payload bodies, and removes manifest links so deleted
 * files do not keep one extra payload byte alive.
 */

const paths = require("./path");
const store = require("./store");
const { freeDataRecord } = require("./blobValue");
const { withFsTx } = require("./transactions");

function rm(fs, p, options = {}) {
  const fullPath = paths.normalize(fs.cwd, p);
  return withFsTx(fs.db, `rm:${fullPath}`, () => rmSync(fs, fullPath, options));
}

function rmSync(fs, fullPath, options = {}) {
  const inode = store.pathToInode(fs.db, fullPath);
  if (!inode) return false;
  if (inode.type === "dir") {
    const names = Object.keys(store.getChildren(fs.db, inode.id));
    if (names.length && !options.recursive) throw new Error(`DIR_NOT_EMPTY: ${fullPath}`);
    for (const name of names) rmSync(fs, paths.join(fullPath, name), { recursive: true });
    store.deleteChildrenMap(fs.db, inode.id);
  } else {
    freeDataRecord(fs.db, inode);
  }
  store.removePathIndex(fs.db, fullPath);
  if (inode.parent) store.removeChild(fs.db, inode.parent, inode.name);
  inode.deleted = true;
  inode.mtime = Date.now();
  store.setInode(fs.db, inode);
  store.removeInode(fs.db, inode.id);
  return true;
}

module.exports = { rm, rmSync };
