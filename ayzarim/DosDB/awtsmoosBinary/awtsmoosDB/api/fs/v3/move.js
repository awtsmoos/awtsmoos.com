// B"H
/**
 * @file move.js
 * @chapter The Path Moved While The Flame Remained
 * @description Move/copy support for VirtualFs v3.
 */

const paths = require("./path");
const store = require("./store");
const { assertParentDir } = require("./dir");
const { cat } = require("./read");
const { writeSync } = require("./write");
const { withFsTx } = require("./transactions");

function mv(fs, from, to) {
  const fromPath = paths.normalize(fs.cwd, from);
  const toPath = paths.normalize(fs.cwd, to);
  return withFsTx(fs.db, `mv:${fromPath}:${toPath}`, () => moveSync(fs, fromPath, toPath));
}

function moveSync(fs, fromPath, toPath) {
  const inode = store.pathToInode(fs.db, fromPath);
  if (!inode) return false;
  const oldParent = inode.parent;
  const oldName = inode.name;
  const newParent = assertParentDir(fs.db, toPath);
  const newName = paths.basename(toPath);
  store.removePathIndex(fs.db, fromPath);
  if (oldParent) store.removeChild(fs.db, oldParent, oldName);
  inode.parent = newParent.id;
  inode.name = newName;
  inode.path = toPath;
  inode.mtime = Date.now();
  store.setInode(fs.db, inode);
  store.setPathIndex(fs.db, toPath, inode.id);
  store.setChild(fs.db, newParent.id, newName, inode.id);
  if (inode.type === "dir") reindexDescendants(fs.db, inode.id, toPath);
  return true;
}

function reindexDescendants(db, dirInodeId, dirPath) {
  for (const [name, childId] of Object.entries(store.getChildren(db, dirInodeId))) {
    const child = store.getInode(db, childId);
    if (!child) continue;
    store.removePathIndex(db, child.path);
    child.path = paths.join(dirPath, name);
    store.setInode(db, child);
    store.setPathIndex(db, child.path, child.id);
    if (child.type === "dir") reindexDescendants(db, child.id, child.path);
  }
}

function cp(fs, from, to) {
  const fromPath = paths.normalize(fs.cwd, from);
  const toPath = paths.normalize(fs.cwd, to);
  return withFsTx(fs.db, `cp:${fromPath}:${toPath}`, () => writeSync(fs, toPath, cat(fs, fromPath)));
}

module.exports = { mv, cp, moveSync };
