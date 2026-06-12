// B"H
/**
 * @file VirtualFs.js
 * @chapter The One Filesystem Beneath The Many Garments
 * @description
 * Public VirtualFs v3 wrapper. It preserves the historical `db.fs.*` method
 * surface while using one exact-byte manifest. The constructor wraps `db.close()`
 * once, so dirty filesystem metadata is flushed exactly at the closing gate.
 */

const paths = require("./path");
const store = require("./store");
const { ensureDir } = require("./dir");
const read = require("./read");
const writeOps = require("./write");
const deleteOps = require("./delete");
const moveOps = require("./move");
const statOps = require("./stat");
const legacy = require("./legacy");

class VirtualFs {
  constructor(db) {
    this.db = db;
    this.cwd = "/";
    this.patchClose();
  }

  patchClose() {
    if (!this.db || this.db.__fs3ClosePatched || typeof this.db.close !== "function") return;
    const originalClose = this.db.close.bind(this.db);
    this.db.close = (...args) => {
      this.flush();
      return originalClose(...args);
    };
    this.db.__fs3ClosePatched = true;
  }

  ready() { store.root(this.db); return this; }
  flush() { return store.flush(this.db); }
  pwd() { return this.cwd; }

  cd(p = "/") {
    this.ready();
    const next = paths.normalize(this.cwd, p);
    ensureDir(this.db, next);
    this.cwd = next;
    return this.cwd;
  }

  mkdir(p) { this.ready(); ensureDir(this.db, paths.normalize(this.cwd, p)); return true; }
  ls(p = ".") { this.ready(); return read.list(this, p); }
  cat(p, options = {}) { this.ready(); return read.cat(this, p, options); }
  readRange(p, offset = 0, length) { this.ready(); return read.readRange(this, p, offset, length); }
  write(p, value) { this.ready(); return writeOps.write(this, p, value); }
  append(p, value) { this.ready(); return writeOps.append(this, p, value); }
  writeRange(p, offset, value) { this.ready(); return writeOps.writeRange(this, p, offset, value); }
  rm(p, options = {}) { this.ready(); return deleteOps.rm(this, p, options); }
  mv(from, to) { this.ready(); return moveOps.mv(this, from, to); }
  cp(from, to) { this.ready(); return moveOps.cp(this, from, to); }
  stat(p = ".") { this.ready(); return statOps.stat(this, p); }
  exists(p = ".") { this.ready(); return statOps.exists(this, p); }

  grep(pattern, p = ".") {
    this.ready();
    const matcher = pattern instanceof RegExp ? pattern : new RegExp(String(pattern));
    const found = [];
    const walk = (fullPath) => {
      const inode = store.pathToInode(this.db, fullPath);
      if (inode && inode.type === "dir") return this.ls(fullPath).forEach(name => walk(paths.join(fullPath, name)));
      const value = this.cat(fullPath);
      const text = Buffer.isBuffer(value) ? value.toString("utf8") : String(value ?? "");
      if (matcher.test(text)) found.push(fullPath);
    };
    walk(paths.normalize(this.cwd, p));
    return found;
  }

  migrateLegacyTree() {
    this.ready();
    const walk = (nodePath) => {
      const node = legacy.legacyNode(this.db, nodePath);
      if (node === undefined) return;
      if (node && typeof node === "object" && !Buffer.isBuffer(node) && !node.__awtsmoosBlob) {
        this.mkdir(nodePath);
        for (const child of Object.keys(node)) walk(paths.join(nodePath, child));
        return;
      }
      this.write(nodePath, legacy.legacyCat(this.db, nodePath));
    };
    walk("/");
    return true;
  }
}

module.exports = VirtualFs;
