// B"H
/**
 * @file awtsmoosDbFsAdapter.js
 * @chapter The Reader Gate Learns Lightning
 * @description
 * A DosDB bridge into AwtsmoosDB VirtualFs v3.
 *
 * The crisis revealed by stress traces was not disk I/O. The disk read itself
 * was a tiny spark. The delay was repeated ceremony: open the same DB, load the
 * same manifest, search the same route, decode the same posts object, then do
 * it again a thousand times as though the Awtsmoos had not already spoken the
 * world into being from absolute nothing the instant before.
 *
 * This bridge now keeps read-only vessels open, caches route findings, caches
 * stat answers, and caches decoded file values behind filesystem mtime/size
 * seals. Writers still use the shared writer cache and invalidate read caches
 * for the touched family. No DB architecture is replaced; the existing vessels
 * are simply no longer forced to reincarnate for every glance.
 */

const fs = require("fs");
const path = require("path");
const AwtsmoosDB = require("./awtsmoosBinary/awtsmoosDB/index.js");
const awtsmoosJSON = require("./awtsmoosBinary/awtsmoosBinaryJSON/index.js");

function globalMap(name) {
  if (!globalThis[name]) globalThis[name] = new Map();
  return globalThis[name];
}

function sharedDbCache() { return globalMap("__awtsmoosDosDbFsSharedCache"); }
function readDbCache() { return globalMap("__awtsmoosDosDbFsReadCache"); }
function readValueCache() { return globalMap("__awtsmoosDosDbFsReadValueCache"); }
function readFindCache() { return globalMap("__awtsmoosDosDbFsReadFindCache"); }
function readStatCache() { return globalMap("__awtsmoosDosDbFsReadStatCache"); }
function sharedFlushTimers() { return globalMap("__awtsmoosDosDbFsFlushTimers"); }

function fileSeal(file) {
  try {
    const stat = fs.statSync(file);
    return `${stat.size}:${stat.mtimeMs}`;
  } catch {
    return "missing";
  }
}

function cacheKey(parts) { return parts.map(x => String(x ?? "")).join("\u0001"); }

function clearReadCachesForFile(file) {
  const prefix = `${file}\u0001`;
  for (const cache of [readValueCache(), readFindCache(), readStatCache()]) {
    for (const key of cache.keys()) if (String(key).startsWith(prefix)) cache.delete(key);
  }
}

function openAwtsmoosDb(file, options = {}) {
  const db = new AwtsmoosDB(file, { compression: false, reuseFreedSpace: "verified", ...options });
  db.open();
  return db;
}

function openSharedAwtsmoosDb(file) {
  const cache = sharedDbCache();
  if (cache.has(file)) return cache.get(file);
  const db = openAwtsmoosDb(file);
  cache.set(file, db);
  return db;
}

function openReadOnlyAwtsmoosDb(file) {
  const cache = readDbCache();
  const seal = fileSeal(file);
  const cached = cache.get(file);
  if (cached && cached.seal === seal) return cached.db;
  if (cached?.db) {
    try { cached.db.pager?.close?.(); cached.db.processLock?.release?.(); } catch {}
  }
  const db = openAwtsmoosDb(file, { readOnly: true, processLockMode: "shared", lockMode: "shared" });
  cache.set(file, { db, seal });
  return db;
}

function closeReadOnlyHandlesForFile(file) {
  const cached = readDbCache().get(file);
  if (!cached) return;
  try { cached.db.pager?.close?.(); cached.db.processLock?.release?.(); } catch {}
  readDbCache().delete(file);
  clearReadCachesForFile(file);
}

function scheduleSharedFlush(db, file, delayMs = 300000) {
  const timers = sharedFlushTimers();
  if (timers.has(file)) return { scheduled: true, alreadyQueued: true, delayMs };
  const timer = setTimeout(() => {
    timers.delete(file);
    try { db.fs.flush?.(); } catch (error) { console.error("B\"H AwtsmoosDB delayed fs flush failed", file, error?.stack || error); }
    closeReadOnlyHandlesForFile(file);
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
  if (/^\/social\/heichelos\/[^/]+\/series\/[^/]+\/posts(?:\.awtsmoosJSON)?$/.test(clean)) return ["posts"];
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
  dbPathForFamily(family) { return this.files[family]; }
  dbForFamily(family, id = "", create = false, mode = "write") {
    const file = this.dbPathForFamily(family, id, create);
    if (!file || (!create && !fs.existsSync(file))) return null;
    if (create) fs.mkdirSync(path.dirname(file), { recursive: true });
    if (mode === "read") return openReadOnlyAwtsmoosDb(file);
    const key = `${family}:${file}`;
    if (!this.dbs.has(key)) this.dbs.set(key, openSharedAwtsmoosDb(file));
    return this.dbs.get(key);
  }
  withReadDb(family, id, fn) {
    const db = this.dbForFamily(family, id, false, "read");
    if (!db) return null;
    return fn(db);
  }
  familiesFor(id, mode = "write") {
    return familyOrderFor(id).filter(family => mode === "read" ? fs.existsSync(this.dbPathForFamily(family, id, false)) : this.dbForFamily(family, id));
  }
  cachedStat(file, db, candidate) {
    const key = cacheKey([file, candidate]);
    const seal = fileSeal(file);
    const cached = readStatCache().get(key);
    if (cached && cached.seal === seal) return cached.stat;
    const stat = db.fs.stat(candidate);
    readStatCache().set(key, { seal, stat });
    return stat;
  }
  find(id, mode = "write") {
    const clean = normalizePath(id);
    if (mode === "read") {
      const familyList = this.familiesFor(clean, mode);
      const findKey = cacheKey(["find", this.rootDir, this.heichelId, clean, familyList.join(",")]);
      const seals = familyList.map(family => fileSeal(this.dbPathForFamily(family))).join("|");
      const cached = readFindCache().get(findKey);
      if (cached && cached.seals === seals) {
        const db = this.dbForFamily(cached.family, clean, false, "read");
        return db ? { ...cached.found, db } : null;
      }
      const found = this.findUncached(clean, mode, familyList);
      if (found) {
        const { db, ...plain } = found;
        readFindCache().set(findKey, { seals, family: found.family, found: plain });
      }
      return found;
    }
    return this.findUncached(clean, mode, this.familiesFor(clean, mode));
  }
  findUncached(clean, mode, families) {
    for (const family of families) {
      const inspect = db => {
        const file = this.dbPathForFamily(family, clean, false);
        for (const candidate of fileCandidates(clean)) {
          const stat = mode === "read" ? this.cachedStat(file, db, candidate) : db.fs.stat(candidate);
          if (stat?.exists && stat.type === "file") return { family, db, path: candidate, stat, file: true, dbFile: file };
        }
        const dirStat = mode === "read" ? this.cachedStat(file, db, clean) : db.fs.stat(clean);
        if (dirStat?.exists && dirStat.type === "dir") return { family, db, path: clean, stat: dirStat, dir: true, dbFile: file };
        return null;
      };
      const db = this.dbForFamily(family, clean, false, mode);
      if (!db) continue;
      const found = inspect(db);
      if (found) return found;
    }
    return null;
  }
  fileBuffer(found) { return new FileBuffer(found.db, found.path, found.stat?.size || 0); }
  async getObjectKeys(id) {
    const found = this.find(id, "read");
    if (!found) return null;
    if (found.dir) return found.db.fs.ls(found.path).map(stripKnownExtension);
    const fb = this.fileBuffer(found);
    return await awtsmoosJSON.isAwtsmoosObject(fb) ? awtsmoosJSON.getKeys(fb) : [];
  }
  async get(id, options = {}) {
    const found = this.find(id, "read");
    if (!found) return undefined;
    if (found.dir) return found.db.fs.ls(found.path).map(stripKnownExtension);
    if (options?.access) return { isFile: true, size: found.stat?.size || 0, path: found.path, family: found.family };
    return this.readFile(found, options);
  }
  async readFile(found, options = {}) {
    const ext = path.posix.extname(found.path);
    const optionSeal = JSON.stringify({ propertyMap: options?.propertyMap || null, arrayFilter: options?.arrayFilter || null });
    const seal = fileSeal(found.dbFile || this.dbPathForFamily(found.family));
    const key = cacheKey([found.dbFile || "", found.path, found.stat?.size || 0, optionSeal]);
    const cached = readValueCache().get(key);
    if (cached && cached.seal === seal) return cached.value;
    const fb = this.fileBuffer(found);
    let value;
    if (ext === ".json") value = JSON.parse(fb.toString("utf8"));
    else if (ext === ".awtsmoosJSON" || !ext) {
      if (!(await awtsmoosJSON.isAwtsmoosObject(fb))) value = fb.subarray(0, fb.length);
      else if (options?.propertyMap || options?.arrayFilter) value = awtsmoosJSON.mapObject(fb, options.propertyMap || {}, null, options.arrayFilter);
      else value = awtsmoosJSON.deserializeBinary(fb);
    } else value = fb.subarray(0, fb.length);
    readValueCache().set(key, { seal, value });
    return value;
  }
  async write(id, value) {
    const vpath = writePath(id);
    const family = familyOrderFor(vpath)[0];
    if (!family) return undefined;
    const db = this.dbForFamily(family, vpath, true, "write");
    if (!db) return undefined;
    const file = this.dbPathForFamily(family, vpath, true);
    const buffer = serializeValue(value, vpath);
    db.fs.write(vpath, buffer);
    clearReadCachesForFile(file);
    closeReadOnlyHandlesForFile(file);
    const flush = scheduleSharedFlush(db, file);
    return { success: { family, path: vpath, bytes: buffer.length, flush } };
  }
  async mutateObject(id, mutator) {
    const current = await this.get(id, { max: true });
    const obj = current && typeof current === "object" && !Array.isArray(current) && !Buffer.isBuffer(current) ? current : {};
    const result = await mutator(obj);
    const wrote = await this.write(id, obj);
    return result === undefined ? wrote : { success: result, wrote };
  }
  async appendToObj(id, { key, value } = {}) { if (key === undefined) return undefined; return this.mutateObject(id, obj => { obj[key] = value; return { key, value }; }); }
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
  async deleteObjectKey(id, key) { if (key === undefined) return undefined; return this.mutateObject(id, obj => { const existed = key in obj; delete obj[key]; return { key, existed }; }); }
  async getObjectKey(id, key) { const value = await this.get(id, { propertyMap: { [key]: true } }); return value && typeof value === "object" ? value[key] : undefined; }
  async delete(id, recursive = false) {
    const found = this.find(id, "write");
    if (!found) return undefined;
    if (found.dir && !recursive) return false;
    const result = found.db.fs.rm(found.path, { recursive: Boolean(recursive) });
    const file = this.dbPathForFamily(found.family, found.path, false);
    clearReadCachesForFile(file);
    closeReadOnlyHandlesForFile(file);
    scheduleSharedFlush(found.db, file);
    return result;
  }
  async rename(from, to) {
    const found = this.find(from, "write");
    if (!found) return undefined;
    const result = found.db.fs.mv(found.path, writePath(to));
    const file = this.dbPathForFamily(found.family, found.path, false);
    clearReadCachesForFile(file);
    closeReadOnlyHandlesForFile(file);
    scheduleSharedFlush(found.db, file);
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

module.exports = { AwtsmoosDbFsRouter, BlobFileBuffer: FileBuffer, FileBuffer, familyDbFiles, commentsSeriesDbFile, commentsPostDbFile, familyOrderFor, heichelFromPath, normalizePath, clearReadCachesForFile };


