// B"H
/**
 * @file write.js
 * @chapter The Writer Refused To Birth A Phantom Byte
 * @description
 * Creation, replacement, append, and range writes for VirtualFs v3. The old
 * path made a data record before checking whether the file already existed,
 * which could create a wasted blob during overwrites. This gate now creates
 * exactly one payload vessel per resulting file version.
 */

const paths = require("./path");
const store = require("./store");
const { assertParentDir } = require("./dir");
const { toBuffer, makeDataRecord, readDataRecord, replaceDataRecord } = require("./blobValue");
const { withFsTx } = require("./transactions");

function write(fs, p, value) {
  const fullPath = paths.normalize(fs.cwd, p);
  return withFsTx(fs.db, `write:${fullPath}`, () => writeSync(fs, fullPath, value));
}

function writeSync(fs, fullPath, value) {
  const parent = assertParentDir(fs.db, fullPath);
  const name = paths.basename(fullPath);
  const nextBytes = toBuffer(value);
  let inode = store.pathToInode(fs.db, fullPath);
  if (inode && inode.type === "dir") throw new Error(`IS_DIRECTORY: ${fullPath}`);
  if (inode) {
    replaceDataRecord(fs.db, inode, nextBytes, { path: fullPath });
    store.setInode(fs.db, inode);
    return true;
  }
  const record = makeDataRecord(fs.db, nextBytes, { path: fullPath });
  inode = store.createFileInode({ db: fs.db, id: store.allocateInode(fs.db), name, parent: parent.id, path: fullPath, record });
  store.setPathIndex(fs.db, fullPath, inode.id);
  store.setChild(fs.db, parent.id, name, inode.id);
  return true;
}

function append(fs, p, value) {
  const fullPath = paths.normalize(fs.cwd, p);
  return withFsTx(fs.db, `append:${fullPath}`, () => {
    const inode = store.pathToInode(fs.db, fullPath);
    const current = inode && inode.type === "file" ? readDataRecord(fs.db, inode) : Buffer.alloc(0);
    return writeSync(fs, fullPath, Buffer.concat([current, toBuffer(value)]));
  });
}

function writeRange(fs, p, offset, value) {
  const fullPath = paths.normalize(fs.cwd, p);
  return withFsTx(fs.db, `writeRange:${fullPath}`, () => {
    const inode = store.pathToInode(fs.db, fullPath);
    const patch = toBuffer(value);
    const current = inode && inode.type === "file" ? readDataRecord(fs.db, inode) : Buffer.alloc(0);
    const start = Math.max(0, offset || 0);
    const size = Math.max(current.length, start + patch.length);
    const next = Buffer.alloc(size);
    current.copy(next, 0, 0, current.length);
    patch.copy(next, start, 0, patch.length);
    return writeSync(fs, fullPath, next);
  });
}

module.exports = { write, append, writeRange, writeSync };
