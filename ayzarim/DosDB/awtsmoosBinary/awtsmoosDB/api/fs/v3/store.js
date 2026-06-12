// B"H
/**
 * @file store.js
 * @chapter The Manifest Became A Covenant No Truncation Could Devour
 * @description
 * VirtualFs v3 manifest store. The Awtsmoos gives every byte a place and then
 * commands the boundary itself to remember that place. Large manifests are
 * stored as exact blobs; flush() is a real durability gate, persisting the blob,
 * the root token, the allocator cursor, and the superblock before fsync.
 */

const { ROOT_INODE, ROOT_PATH } = require("./schema");
const MANIFEST_KEY = "__fs3_manifest__";

function now() { return Date.now(); }
function plain(db, value) { return value && value.__resolve__ ? value.__resolve__() : value; }
function cloneObject(value) { return value && typeof value === "object" ? value : {}; }

function blankManifest() {
  return { version: 3, nextInode: 1, tx: { active: null, lastCommitted: 0 }, inodes: {}, paths: {}, children: {} };
}

function rootInodeRecord() {
  return { id: ROOT_INODE, type: "dir", name: "", parent: null, path: ROOT_PATH, size: 0, ctime: now(), mtime: now(), version: 1, deleted: false };
}

function tokenBlob(token) {
  const value = plain(null, token);
  if (!value || value.__fs3ManifestBlob !== true) return null;
  const blob = plain(null, value.blob);
  return blob && blob.__awtsmoosBlob === true ? blob : null;
}

function parseManifestBytes(bytes, tokenInfo = {}) {
  const text = bytes.toString("utf8");
  const trimmed = text.trimStart();
  if (!trimmed.startsWith("{")) {
    const head = bytes.subarray(0, Math.min(24, bytes.length)).toString("hex");
    throw new SyntaxError(`FS3_MANIFEST_NOT_JSON bytes=${bytes.length} tokenBytes=${tokenInfo.bytes || 0} headHex=${head}`);
  }
  return JSON.parse(text);
}

function decodeManifest(db, token) {
  const value = plain(db, token);
  const blob = tokenBlob(value);
  if (blob) {
    const length = Number(value.bytes || blob.length || 0);
    const bytes = db.blob.read(blob, 0, length);
    return parseManifestBytes(bytes || Buffer.alloc(0), value);
  }
  if (value && typeof value === "object" && value.version === 3 && value.inodes) return value;
  return blankManifest();
}

function encodeManifest(db, manifest) {
  const previous = plain(db, db.root && db.root[MANIFEST_KEY]);
  const previousBlob = tokenBlob(previous);
  const bytes = Buffer.from(JSON.stringify(manifest), "utf8");
  const blob = db.blob.create(bytes, { kind: "fs3-manifest", bytes: bytes.length });
  if (previousBlob) db.blob.delete(previousBlob);
  return { __fs3ManifestBlob: true, version: 3, bytes: bytes.length, blob };
}

function normalizeManifest(m) {
  m.version = 3;
  m.nextInode ||= 1;
  m.tx ||= { active: null, lastCommitted: 0 };
  m.inodes = cloneObject(m.inodes);
  m.paths = cloneObject(m.paths);
  m.children = cloneObject(m.children);
  if (!m.inodes[ROOT_INODE] || m.inodes[ROOT_INODE].type !== "dir") m.inodes[ROOT_INODE] = rootInodeRecord();
  m.paths[ROOT_PATH] = ROOT_INODE;
  m.children[ROOT_INODE] ||= {};
  let max = 0;
  for (const id of Object.keys(m.inodes)) if (/^i\d+$/.test(id)) max = Math.max(max, Number(id.slice(1)));
  m.nextInode = Math.max(m.nextInode, max + 1);
  return m;
}

function forceDurableBoundary(db) {
  if (db.allocator && typeof db.allocator.flushCursor === "function") db.allocator.flushCursor();
  if (typeof db._flushSuperblock === "function") db._flushSuperblock();
  if (db.pager && typeof db.pager.fsync === "function") db.pager.fsync(true);
}

function flush(db) {
  if (!db.__fs3Manifest || !db.root || !db.__fs3ManifestDirty) return false;
  db.root[MANIFEST_KEY] = encodeManifest(db, db.__fs3Manifest);
  db.__fs3ManifestDirty = false;
  forceDurableBoundary(db);
  return true;
}

function save(db, manifest) {
  db.__fs3Manifest = manifest;
  db.__fs3ManifestDirty = true;
  return manifest;
}

function manifest(db) {
  if (!db.root) db.root = {};
  if (db.__fs3Manifest) return db.__fs3Manifest;
  return save(db, normalizeManifest(decodeManifest(db, db.root[MANIFEST_KEY])));
}

function root(db) { const m = manifest(db); return { version: m.version, nextInode: m.nextInode, tx: m.tx }; }
function markTx(db, tx) { const m = manifest(db); m.tx = tx; save(db, m); return m.tx; }
function allocateInode(db) { const m = manifest(db); const id = `i${m.nextInode++}`; save(db, m); return id; }
function getInode(db, id) { if (!id) return null; const inode = manifest(db).inodes[id]; return inode && !inode.deleted ? inode : null; }

function setInode(db, inode) {
  const m = manifest(db);
  m.inodes[inode.id] = inode;
  if (inode.path) m.paths[inode.path] = inode.id;
  if (inode.type === "dir") m.children[inode.id] ||= {};
  save(db, m);
  return inode;
}

function removeInode(db, id) {
  const m = manifest(db);
  const inode = m.inodes[id];
  if (inode && inode.path) delete m.paths[inode.path];
  delete m.inodes[id];
  delete m.children[id];
  save(db, m);
}

function pathToInodeId(db, normalizedPath) {
  const m = manifest(db);
  const id = m.paths[normalizedPath];
  return id && m.inodes[id] && !m.inodes[id].deleted ? id : null;
}

function pathToInode(db, normalizedPath) { return getInode(db, pathToInodeId(db, normalizedPath)); }
function setPathIndex(db, normalizedPath, inodeId) { const m = manifest(db); m.paths[normalizedPath] = inodeId; save(db, m); return inodeId; }
function removePathIndex(db, normalizedPath) { const m = manifest(db); delete m.paths[normalizedPath]; save(db, m); return true; }

function getChildren(db, dirInodeId) {
  const m = manifest(db);
  const children = Object.assign({}, m.children[dirInodeId] || {});
  for (const inode of Object.values(m.inodes)) if (inode && !inode.deleted && inode.parent === dirInodeId && inode.name) children[inode.name] = inode.id;
  for (const [name, id] of Object.entries(children)) if (!m.inodes[id] || m.inodes[id].deleted) delete children[name];
  m.children[dirInodeId] = children;
  save(db, m);
  return children;
}

function setChild(db, dirInodeId, name, childInodeId) { const m = manifest(db); m.children[dirInodeId] ||= {}; m.children[dirInodeId][name] = childInodeId; save(db, m); return childInodeId; }
function removeChild(db, dirInodeId, name) { const m = manifest(db); m.children[dirInodeId] ||= {}; delete m.children[dirInodeId][name]; save(db, m); return true; }
function deleteChildrenMap(db, dirInodeId) { const m = manifest(db); delete m.children[dirInodeId]; save(db, m); }
function createDirInode({ db, id, name, parent, path }) { return setInode(db, { id, type: "dir", name, parent, path, size: 0, ctime: now(), mtime: now(), version: 1, deleted: false }); }
function createFileInode({ db, id, name, parent, path, record }) { return setInode(db, { id, type: "file", name, parent, path, size: record.size, dataKind: record.kind, data: record.data, ctime: now(), mtime: now(), version: 1, deleted: false }); }

module.exports = { root, meta: root, flush, markTx, allocateInode, getInode, setInode, removeInode, pathToInodeId, pathToInode, setPathIndex, removePathIndex, getChildren, setChild, removeChild, deleteChildrenMap, createDirInode, createFileInode };
