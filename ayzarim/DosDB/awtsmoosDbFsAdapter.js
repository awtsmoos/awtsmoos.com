// B"H
/**
 * @file awtsmoosDbFsAdapter.js
 * @chapter The Comment Shard Became A Tiny Ark Per Post
 * @description
 * DosDB-level adapter for real AwtsmoosDB filesystem vessels.
 *
 * Heichel series/posts route to family DB files. Comments prefer tiny per-post
 * DB shards named:
 * `social.heichel.<id>.comments.atSeries.<series>.atPost.<post>.fs.awtsdb`.
 * If absent, the adapter falls back to per-series comment shards and then the
 * old monolithic comments family DB.
 *
 * AwtsmoosJSON reads use blob-offset FileBuffer handles, not full `fs.cat()`
 * reads, so the old dynamic byte parser stays partial-fast inside AwtsmoosDB.
 */

const fs = require("fs");
const path = require("path");
const AwtsmoosDB = require("./awtsmoosBinary/awtsmoosDB/index.js");
const awtsmoosJSON = require("./awtsmoosBinary/awtsmoosBinaryJSON/index.js");

function sharedDbCache() {
  if (!globalThis.__awtsmoosDosDbFsSharedCache) globalThis.__awtsmoosDosDbFsSharedCache = new Map();
  return globalThis.__awtsmoosDosDbFsSharedCache;
}

function openSharedAwtsmoosDb(file) {
  const cache = sharedDbCache();
  if (cache.has(file)) return cache.get(file);
  const db = new AwtsmoosDB(file, { compression: false, reuseFreedSpace: "verified" });
  db.open();
  cache.set(file, db);
  return db;
}

function normalizePath(input) {
  return "/" + String(input || "").replace(/^[A-Za-z]:/, "").replace(/\\/g, "/").split("/").filter(Boolean).join("/");
}

function stripKnownExtension(name) { return String(name || "").replace(/\.(awtsmoosJSON|json)$/i, ""); }
function heichelFromPath(id) { const m = normalizePath(id).match(/^\/social\/heichelos\/([^/]+)(?:\/|$)/); return m ? m[1] : ""; }
function commentSeriesFromPath(id) { const m = normalizePath(id).match(/^\/social\/heichelos\/[^/]+\/comments\/atSeries\/([^/]+)(?:\/|$)/); return m ? m[1] : ""; }
function commentPostFromPath(id) { const m = normalizePath(id).match(/^\/social\/heichelos\/[^/]+\/comments\/atSeries\/[^/]+\/atPost\/([^/]+)(?:\/|$)/); return m ? m[1] : ""; }
function safeName(value) { return encodeURIComponent(String(value || "root")); }

function familyDbFiles({ rootDir, heichelId }) {
  const packed = path.join(rootDir, "socialPacked");
  return {
    comments: path.join(packed, `social.heichel.${heichelId}.comments.fs.awtsdb`),
    posts: path.join(packed, `social.heichel.${heichelId}.posts.fs.awtsdb`),
    series: path.join(packed, `social.heichel.${heichelId}.series.fs.awtsdb`)
  };
}

function commentsSeriesDbFile({ rootDir, heichelId, seriesId }) {
  return path.join(rootDir, "socialPacked", `social.heichel.${heichelId}.comments.atSeries.${safeName(seriesId)}.fs.awtsdb`);
}

function commentsPostDbFile({ rootDir, heichelId, seriesId, postId }) {
  return path.join(rootDir, "socialPacked", `social.heichel.${heichelId}.comments.atSeries.${safeName(seriesId)}.atPost.${safeName(postId)}.fs.awtsdb`);
}

function familyOrderFor(id) {
  const clean = normalizePath(id);
  if (/^\/social\/heichelos\/[^/]+\/comments(?:\/|$)/.test(clean)) return ["comments"];
  if (/^\/social\/heichelos\/[^/]+\/series\/[^/]+\/posts(?:\.awtsmoosJSON)?$/.test(clean)) return ["posts", "series"];
  if (/^\/social\/heichelos\/[^/]+\/series(?:\/|$)/.test(clean)) return ["series", "posts"];
  return [];
}

function fileCandidates(id) {
  const clean = normalizePath(id).replace(/\/$/, "");
  const ext = path.posix.extname(clean);
  return ext ? [clean] : [clean, `${clean}.awtsmoosJSON`, `${clean}.json`];
}

function writePath(id) {
  const clean = normalizePath(id).replace(/\/$/, "");
  return path.posix.extname(clean) ? clean : `${clean}.awtsmoosJSON`;
}

function serializeValue(value, vpath) {
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === "string") return Buffer.from(value, "utf8");
  if (path.posix.extname(vpath) === ".json") return Buffer.from(JSON.stringify(value ?? null, null, 2), "utf8");
  return Array.isArray(value) ? awtsmoosJSON.serializeArray(value) : awtsmoosJSON.serializeJSON(value ?? {});
}

class FileBuffer {
  constructor(db, blob, name = "") {
    this.db = db;
    this.blob = blob && blob.__resolve__ ? blob.__resolve__() : blob;
    this.name = name;
    this.path = name;
    this.isFileBuffer = true;
    this.stats = { size: this.blob?.length || 0 };
    return new Proxy(this, { get: (target, prop) => Number.isNaN(Number(prop)) ? target[prop] : target.readUInt8(Number(prop)) });
  }
  get length() { return this.blob.length; }
  subarray(start = 0, end = this.length) { return this.db.blob.read(this.blob, start, Math.max(0, end - start)); }
  toString(mode = "utf8", start = 0, end = this.length) { return this.subarray(start, end).toString(mode); }
  readUInt8(offset) { return this.subarray(offset, offset + 1).readUInt8(0); }
  readUInt16BE(offset) { return this.subarray(offset, offset + 2).readUInt16BE(0); }
  readUInt32BE(offset) { return this.subarray(offset, offset + 4).readUInt32BE(0); }
  readUIntBE(offset, byteLength) { return this.subarray(offset, offset + byteLength).readUIntBE(0, byteLength); }
  readString(offset, length) { return this.subarray(offset, offset + length).toString("utf8").replace(/\0/g, ""); }
  read(out, offset = 0, length = out.length, position = 0) {
    const chunk = this.subarray(position || 0, (position || 0) + (length || out.length));
    chunk.copy(out, offset, 0, chunk.length);
    return chunk.length;
  }
  close() { this.isClosed = true; }
}

class AwtsmoosDbFamilyFs {
  constructor({ rootDir, heichelId }) {
    this.rootDir = rootDir;
    this.heichelId = heichelId;
    this.files = familyDbFiles({ rootDir, heichelId });
    this.dbs = new Map();
  }

  packedDir() { return path.join(this.rootDir, "socialPacked"); }

  hasCommentShard() {
    try {
      const prefix = `social.heichel.${this.heichelId}.comments.atSeries.`;
      return fs.readdirSync(this.packedDir()).some(name => name.startsWith(prefix) && name.endsWith(".fs.awtsdb"));
    } catch { return false; }
  }

  hasAnyFile() { return Object.values(this.files).some(file => fs.existsSync(file)) || this.hasCommentShard(); }
  close() { this.dbs.clear(); }

  commentDbPathFor(id, create = false) {
    const seriesId = commentSeriesFromPath(id);
    const postId = commentPostFromPath(id);
    if (seriesId && postId) {
      const postFile = commentsPostDbFile({ rootDir: this.rootDir, heichelId: this.heichelId, seriesId, postId });
      if (create || fs.existsSync(postFile)) return postFile;
    }
    if (seriesId) {
      const seriesFile = commentsSeriesDbFile({ rootDir: this.rootDir, heichelId: this.heichelId, seriesId });
      if (fs.existsSync(seriesFile)) return seriesFile;
    }
    return this.files.comments;
  }

  dbPathForFamily(family, id = "", create = false) {
    if (family === "comments") return this.commentDbPathFor(id, create);
    return this.files[family];
  }

  dbForFamily(family, id = "", create = false) {
    const file = this.dbPathForFamily(family, id, create);
    if (!file || (!create && !fs.existsSync(file))) return null;
    if (create) fs.mkdirSync(path.dirname(file), { recursive: true });
    const key = `${family}:${file}`;
    if (!this.dbs.has(key)) {
      const db = openSharedAwtsmoosDb(file);
      this.dbs.set(key, db);
    }
    return this.dbs.get(key);
  }

  familiesFor(id) { return familyOrderFor(id).filter(family => this.dbForFamily(family, id)); }

  nodeAt(db, vpath) {
    const parts = normalizePath(vpath).split("/").filter(Boolean);
    let cur = db.root.__fs__;
    for (const part of parts) {
      if (!cur || cur[part] === undefined) return undefined;
      cur = cur[part];
    }
    return cur;
  }

  isBlob(node) {
    const plain = node && node.__resolve__ ? node.__resolve__() : node;
    return Boolean(plain && plain.__awtsmoosBlob === true);
  }

  blobFrom(node) { return node && node.__resolve__ ? node.__resolve__() : node; }

  find(id) {
    const clean = normalizePath(id);
    for (const family of this.familiesFor(clean)) {
      const db = this.dbForFamily(family, clean);
      for (const candidate of fileCandidates(clean)) {
        const node = this.nodeAt(db, candidate);
        if (this.isBlob(node)) return { family, db, path: candidate, node, file: true };
      }
      const dirNode = this.nodeAt(db, clean);
      if (dirNode && !this.isBlob(dirNode)) return { family, db, path: clean, node: dirNode, dir: true };
    }
    return null;
  }

  fileBuffer(found) { return new FileBuffer(found.db, this.blobFrom(found.node), found.path); }

  async getObjectKeys(id) {
    const found = this.find(id);
    if (!found) return null;
    if (found.dir) return Object.keys(found.node || {}).map(stripKnownExtension);
    const fb = this.fileBuffer(found);
    return await awtsmoosJSON.isAwtsmoosObject(fb) ? awtsmoosJSON.getKeys(fb) : [];
  }

  async get(id, options = {}) {
    const found = this.find(id);
    if (!found) return undefined;
    if (found.dir) return Object.keys(found.node || {}).map(stripKnownExtension);
    const blob = this.blobFrom(found.node);
    if (options?.access) return { isFile: true, size: blob.length, path: found.path, family: found.family };
    return this.readFile(found, options);
  }

  async readFile(found, options = {}) {
    const ext = path.posix.extname(found.path);
    const fb = this.fileBuffer(found);
    if (ext === ".json") return JSON.parse(fb.toString("utf8"));
    if (ext === ".awtsmoosJSON" || !ext) {
      if (!(await awtsmoosJSON.isAwtsmoosObject(fb))) return fb.subarray(0, fb.length);
      if (options?.propertyMap || options?.arrayFilter) return awtsmoosJSON.mapObject(fb, options.propertyMap || {}, null, options.arrayFilter);
      return awtsmoosJSON.deserializeBinary(fb);
    }
    return fb.subarray(0, fb.length);
  }

  async write(id, value) {
    const vpath = writePath(id);
    const family = familyOrderFor(vpath)[0];
    if (!family) return undefined;
    const db = this.dbForFamily(family, vpath, true);
    if (!db) return undefined;
    const buffer = serializeValue(value, vpath);
    db.fs.write(vpath, buffer);
    return { success: { family, path: vpath, bytes: buffer.length } };
  }

  async delete(id, recursive = false) {
    const found = this.find(id);
    if (!found) return undefined;
    if (found.dir && !recursive) return false;
    return found.db.fs.rm(found.path);
  }

  async rename(from, to) {
    const value = await this.get(from, { max: true });
    if (value === undefined || value === null) return undefined;
    const wrote = await this.write(to, value);
    if (!wrote) return undefined;
    await this.delete(from, true);
    return { success: { from, to } };
  }

  async syncKeyInObj(id, key, value = true) {
    const current = (await this.get(id, { max: true })) || {};
    current[key] = value;
    return this.write(id, current);
  }

  async syncKeyInArray(id, value) {
    const current = (await this.get(id, { max: true })) || [];
    const arr = Array.isArray(current) ? current : Object.keys(current || {});
    if (!arr.includes(value)) arr.push(value);
    return this.write(id, arr);
  }
}

class AwtsmoosDbFsRouter {
  constructor(owner) { this.owner = owner; this.heichelos = new Map(); }
  shouldRoute(id) { return familyOrderFor(id).length > 0; }
  familyFor(id) {
    const heichelId = heichelFromPath(id);
    if (!heichelId) return null;
    if (!this.heichelos.has(heichelId)) {
      const family = new AwtsmoosDbFamilyFs({ rootDir: this.owner.directory, heichelId });
      this.heichelos.set(heichelId, family.hasAnyFile() ? family : null);
    }
    return this.heichelos.get(heichelId);
  }
  async maybe(method, id, ...args) {
    if (!this.shouldRoute(id)) return undefined;
    const family = this.familyFor(id);
    if (!family || typeof family[method] !== "function") return undefined;
    return family[method](id, ...args);
  }
  close() { for (const family of this.heichelos.values()) family?.close?.(); this.heichelos.clear(); }
}

module.exports = { AwtsmoosDbFsRouter, BlobFileBuffer: FileBuffer, FileBuffer, familyDbFiles, commentsSeriesDbFile, commentsPostDbFile, familyOrderFor, heichelFromPath, normalizePath };
