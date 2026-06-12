// B"H
/**
 * @file awtsmoosDbFsAdapter.js
 * @chapter The Bridge Learned The Mutation Songs
 * @description
 * DosDB-level bridge into AwtsmoosDB VirtualFs v3. Reads and writes use the
 * public `db.fs` API. Object mutation methods used by comments also route here,
 * so comment creation appends into the v3 comments DB instead of the restored
 * legacy folder.
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

function sharedFlushTimers() {
  if (!globalThis.__awtsmoosDosDbFsFlushTimers) globalThis.__awtsmoosDosDbFsFlushTimers = new Map();
  return globalThis.__awtsmoosDosDbFsFlushTimers;
}

function scheduleSharedFlush(db, file, delayMs = 1500) {
  const timers = sharedFlushTimers();
  if (timers.has(file)) return { scheduled: true, alreadyQueued: true, delayMs };
  const timer = setTimeout(() => {
    timers.delete(file);
    try { db.fs.flush?.(); } catch (error) { console.error("B\"H AwtsmoosDB delayed fs flush failed", file, error?.stack || error); }
  }, delayMs);
  if (typeof timer.unref === "function") timer.unref();
  timers.set(file, timer);
  return { scheduled: true, delayMs };
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
  constructor(db, filePath, size = 0) {
    this.db = db;
    this.filePath = filePath;
    this.name = filePath;
    this.path = filePath;
    this.isFileBuffer = true;
    this.stats = { size };
    return new Proxy(this, { get: (target, prop) => Number.isNaN(Number(prop)) ? target[prop] : target.readUInt8(Number(prop)) });
  }
  get length() { return this.stats.size || 0; }
  subarray(start = 0, end = this.length) { return this.db.fs.readRange(this.filePath, start, Math.max(0, end - start)); }
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
    if (!this.dbs.has(key)) this.dbs.set(key, openSharedAwtsmoosDb(file));
    return this.dbs.get(key);
  }
  familiesFor(id) { return familyOrderFor(id).filter(family => this.dbForFamily(family, id)); }
  find(id) {
    const clean = normalizePath(id);
    for (const family of this.familiesFor(clean)) {
      const db = this.dbForFamily(family, clean);
      for (const candidate of fileCandidates(clean)) {
        const stat = db.fs.stat(candidate);
        if (stat?.exists && stat.type === "file") return { family, db, path: candidate, stat, file: true };
      }
      const dirStat = db.fs.stat(clean);
      if (dirStat?.exists && dirStat.type === "dir") return { family, db, path: clean, stat: dirStat, dir: true };
    }
    return null;
  }
  fileBuffer(found) { return new FileBuffer(found.db, found.path, found.stat?.size || 0); }
  async getObjectKeys(id) {
    const found = this.find(id);
    if (!found) return null;
    if (found.dir) return found.db.fs.ls(found.path).map(stripKnownExtension);
    const fb = this.fileBuffer(found);
    return await awtsmoosJSON.isAwtsmoosObject(fb) ? awtsmoosJSON.getKeys(fb) : [];
  }
  async get(id, options = {}) {
    const found = this.find(id);
    if (!found) return undefined;
    if (found.dir) return found.db.fs.ls(found.path).map(stripKnownExtension);
    if (options?.access) return { isFile: true, size: found.stat?.size || 0, path: found.path, family: found.family };
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
    const flush = scheduleSharedFlush(db, this.dbPathForFamily(family, vpath, true));
    return { success: { family, path: vpath, bytes: buffer.length, flush } };
  }
  async mutateObject(id, mutator) {
    const current = await this.get(id, { max: true });
    const obj = current && typeof current === "object" && !Array.isArray(current) && !Buffer.isBuffer(current) ? current : {};
    const result = await mutator(obj);
    const wrote = await this.write(id, obj);
    return result === undefined ? wrote : { success: result, wrote };
  }
  async appendToObj(id, { key, value } = {}) {
    if (key === undefined) return undefined;
    return this.mutateObject(id, obj => { obj[key] = value; return { key, value }; });
  }
  async updateEntry(id, payload = {}) { return this.appendToObj(id, payload); }
  async setObjectKey(id, key, value) { return this.appendToObj(id, { key, value }); }
  async appendToArrayAtKey(id, { key, shtar } = {}) {
    if (key === undefined) return undefined;
    return this.mutateObject(id, obj => {
      const arr = Array.isArray(obj[key]) ? obj[key] : [];
      arr.push(shtar);
      obj[key] = arr;
      return { key, count: arr.length, appended: true };
    });
  }
  async deleteObjectKey(id, key) {
    if (key === undefined) return undefined;
    return this.mutateObject(id, obj => { const existed = key in obj; delete obj[key]; return { key, existed }; });
  }
  async getObjectKey(id, key) {
    const value = await this.get(id, { propertyMap: { [key]: true } });
    return value && typeof value === "object" ? value[key] : undefined;
  }
  async delete(id, recursive = false) {
    const found = this.find(id);
    if (!found) return undefined;
    if (found.dir && !recursive) return false;
    const result = found.db.fs.rm(found.path, { recursive: Boolean(recursive) });
    scheduleSharedFlush(found.db, this.dbPathForFamily(found.family, found.path, false));
    return result;
  }
  async rename(from, to) {
    const found = this.find(from);
    if (!found) return undefined;
    const result = found.db.fs.mv(found.path, writePath(to));
    scheduleSharedFlush(found.db, this.dbPathForFamily(found.family, found.path, false));
    return result ? { success: { from, to } } : undefined;
  }
  async syncKeyInObj(id, key, value = true) { return this.appendToObj(id, { key, value }); }
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
