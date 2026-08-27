// B"H
/**
 * @file dir.js
 * @chapter The Parent Was Rebuilt Before The Child Was Born
 * @description
 * Directory creation for VirtualFs v3. The walker repairs missing parent links
 * from older failed experiments and from partially-written temp DBs, so a stale
 * path index cannot crash creation of a deeper path.
 */

const paths = require("./path");
const store = require("./store");
const { ROOT_INODE } = require("./schema");

function rootDir(db) {
  store.root(db);
  let parent = store.getInode(db, ROOT_INODE);
  if (!parent || parent.type !== "dir") {
    parent = store.createDirInode({ db, id: ROOT_INODE, name: "", parent: null, path: "/" });
    store.setPathIndex(db, "/", ROOT_INODE);
  }
  return parent;
}

function makeDir(db, parent, currentPath, name) {
  if (!parent || parent.type !== "dir") parent = rootDir(db);
  const inode = store.createDirInode({ db, id: store.allocateInode(db), name, parent: parent.id, path: currentPath });
  store.setPathIndex(db, currentPath, inode.id);
  store.setChild(db, parent.id, name, inode.id);
  return inode;
}

function ensureDir(db, fullPath) {
  const clean = paths.normalize("/", fullPath);
  if (clean === "/") return rootDir(db);
  let parent = rootDir(db);
  let currentPath = "/";
  for (const part of paths.split(clean)) {
    currentPath = paths.join(currentPath, part);
    let inode = store.pathToInode(db, currentPath);
    if (inode && inode.type !== "dir") throw new Error(`NOT_A_DIRECTORY: ${currentPath}`);
    if (!inode) inode = makeDir(db, parent, currentPath, part);
    parent = inode || store.pathToInode(db, currentPath) || makeDir(db, parent, currentPath, part);
  }
  return parent;
}

function assertParentDir(db, fullPath) {
  const parent = ensureDir(db, paths.dirname(fullPath));
  if (!parent || parent.type !== "dir") throw new Error(`NO_PARENT_DIRECTORY: ${fullPath}`);
  return parent;
}

module.exports = { ensureDir, assertParentDir };
