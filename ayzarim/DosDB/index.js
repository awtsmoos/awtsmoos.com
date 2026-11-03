// B"H
/**
 * @file DosDB/index.js
 * @chapter The Final Reader Cache: The Same Word Need Not Be Recreated Twice
 * @description
 * DosDB remains the old filesystem-backed key/value tree, while narrow heichel
 * social paths can also route into real AwtsmoosDB VirtualFs vessels.
 *
 * Emergency read-speed tikkun:
 * stress traces showed identical logical reads repeatedly falling through to
 * the legacy binary reader and spending ~20ms+ in awtsmoosJSON.deserializeBinary.
 * A thousand "concurrent" promises therefore became a thousand serialized CPU
 * reincarnations of the same object. This file now keeps a process-level final
 * logical read cache. Any mutation through this wrapper clears the cache, so a
 * reader who asks the same question twice receives the same already-revealed
 * light instantly, instead of forcing the database to perform Maaseh Bereishis
 * all over again. Entries expire after a bounded TTL and the cache is
 * size-capped (see finalReadCacheConfig), so reads changed outside this
 * wrapper cannot stay stale forever and the cache cannot grow unbounded.
 */

const fsRegular = require("fs");
const fs = fsRegular.promises;
const path = require("path");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const stat = fs.stat;
const awtsmoosBinary = require("./awtsmoosBinary/awtsmoosBinaryJSON/index.js");
const writeMethods = require("./methods/write.js");
const readMethods = require("./methods/read.js");
const arrayMethods = require("./methods/array.js");
const objMethods = require("./methods/obj.js");
const pathMethods = require("./methods/path.js");
const directoryMethods = require("./methods/directory.js");
const firebaseMethods = require("./methods/firebaseMethods.js");
const awtsmoosMerge = require("./utils/awtsmoosMerge.js");
const { AwtsmoosDB, createAwtsmoosDb } = require("./awtsmoosDbBridge.js");
const { AwtsmoosDbFsRouter } = require("./awtsmoosDbFsAdapter.js");

function bindMethodBag(instance, methods) { awtsmoosMerge(instance, methods); }
function maybeResult(value) { return value !== undefined && value !== null; }
function finalReadCache() {
  if (!globalThis.__awtsmoosDosDbFinalReadCache) globalThis.__awtsmoosDosDbFinalReadCache = new Map();
  return globalThis.__awtsmoosDosDbFinalReadCache;
}
// Read-cache safety bounds (write-path patch P1): entries used to live
// forever and the map grew without bound, so a value changed outside this
// wrapper (another process, a manual edit, a restore) was served stale
// indefinitely and long-lived processes accumulated one promise per
// distinct read forever. Each entry now carries its insertion time and is
// dropped once it is older than the TTL; the map is capped with
// oldest-first eviction. Both knobs are read from the environment on every
// access so operators (and tests) can retune without a restart:
//   AWTSMOOS_DOSDB_CACHE_TTL_MS      default 30000. 0 disables reuse
//                                    (every read re-runs its producer);
//                                    invalid/negative falls back to 30000.
//   AWTSMOOS_DOSDB_CACHE_MAX_ENTRIES default 1000. 0 means unbounded
//                                    (the pre-patch behaviour, opt-out
//                                    only); invalid/negative -> 1000.
const FINAL_READ_CACHE_DEFAULT_TTL_MS = 30000;
const FINAL_READ_CACHE_DEFAULT_MAX_ENTRIES = 1000;
function finalReadCacheConfig() {
  const ttlRaw = Number.parseInt(process.env.AWTSMOOS_DOSDB_CACHE_TTL_MS, 10);
  const maxRaw = Number.parseInt(process.env.AWTSMOOS_DOSDB_CACHE_MAX_ENTRIES, 10);
  return {
    ttlMs: Number.isFinite(ttlRaw) && ttlRaw >= 0 ? ttlRaw : FINAL_READ_CACHE_DEFAULT_TTL_MS,
    maxEntries: Number.isFinite(maxRaw) && maxRaw >= 0 ? maxRaw : FINAL_READ_CACHE_DEFAULT_MAX_ENTRIES
  };
}
// Entries are stored as { promise, at }. A bare promise found in the map
// (seeded by older code before this shape existed) is still honoured for
// that access and simply never expires/evicts by age.
function cacheEntryPromise(entry) {
  if (entry && typeof entry === "object" && "promise" in entry) return entry.promise;
  return entry;
}
function cacheEntryExpired(entry, now, ttlMs) {
  return !!(entry && typeof entry === "object" && "at" in entry && now - entry.at >= ttlMs);
}
function stableOptions(options) {
  try { return JSON.stringify(options || {}); } catch { return "{}"; }
}
function finalReadKey(directory, method, id, options) {
  return [directory, method, String(id || ""), stableOptions(options)].join("\u0001");
}
function cachedPromise(key, producer) {
  const cache = finalReadCache();
  const { ttlMs, maxEntries } = finalReadCacheConfig();
  const now = Date.now();
  const existing = cache.get(key);
  if (existing !== undefined) {
    if (!cacheEntryExpired(existing, now, ttlMs)) return cacheEntryPromise(existing);
    cache.delete(key);
  }
  // Drop expired entries on insert so dead weight cannot crowd out the
  // size bound below; live entries keep their insertion order.
  for (const [otherKey, otherEntry] of cache) {
    if (cacheEntryExpired(otherEntry, now, ttlMs)) cache.delete(otherKey);
  }
  const promise = Promise.resolve().then(producer).catch(error => {
    // Preserve the historical "a failed read removes its own key" rule,
    // but only evict if the map still holds THIS promise (a newer entry
    // for the same key may have replaced it after expiry/eviction).
    const current = cache.get(key);
    if (current !== undefined && cacheEntryPromise(current) === promise) cache.delete(key);
    throw error;
  });
  cache.set(key, { promise, at: now });
  if (maxEntries > 0) {
    // Map iteration order is insertion order: evict oldest first.
    while (cache.size > maxEntries) {
      const oldest = cache.keys().next();
      if (oldest.done) break;
      cache.delete(oldest.value);
    }
  }
  return promise;
}
function clearFinalReadCache() { finalReadCache().clear(); }
// Per-key invalidation (write-path patch P4): a mutation used to clear
// the ENTIRE cache, so one write evicted every unrelated hot read in the
// process. Every cached read in this wrapper is addressed by a single id
// path, and a mutation of id X can only change reads whose id is X
// itself, an ancestor of X (listings/values that include X), or a
// descendant of X (recursive delete/rename of a subtree) — so evicting
// exactly the segment-wise prefix-overlapping keys for the same
// directory preserves read semantics while keeping unrelated entries.
// Segment-aware comparison matters: "fam2/x" must survive a write to
// "fam/a" even though the strings share a prefix. Escape hatch: set
// AWTSMOOS_DOSDB_CACHE_INVALIDATION=full to restore whole-cache clears.
function normalizeCacheId(id) {
  return String(id || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
}
function cacheIdsOverlap(a, b) {
  if (!a || !b) return true;
  return a === b || a.startsWith(b + "/") || b.startsWith(a + "/");
}
function invalidateFinalReadCacheFor(directory, ...ids) {
  if (process.env.AWTSMOOS_DOSDB_CACHE_INVALIDATION === "full") { clearFinalReadCache(); return; }
  const targets = ids.map(normalizeCacheId);
  if (!targets.length || targets.some(target => !target)) { clearFinalReadCache(); return; }
  const cache = finalReadCache();
  for (const key of [...cache.keys()]) {
    const parts = key.split("\u0001");
    if (parts.length < 3 || parts[0] !== directory) continue;
    if (targets.some(target => cacheIdsOverlap(target, normalizeCacheId(parts[2])))) cache.delete(key);
  }
}

function isSocialCommentPath(id) {
  return /^\/?social\/heichelos\/[^/]+\/comments(?:\/|$)/.test(String(id || "").replace(/\\/g, "/").replace(/^\/+/, ""));
}

function awtsmoosSidecarPathFor(directory, id) {
  const cleanParts = String(id || "").replace(/^[A-Za-z]:/, "").replace(/\\/g, "/").split("/").filter(Boolean);
  return path.join(directory, ...cleanParts) + ".awtsmoosJSON";
}

async function readAwtsmoosArraySidecar(directory, id) {
  const sidecar = awtsmoosSidecarPathFor(directory, id);
  if (isSocialCommentPath(id)) return { exists: false, value: null, path: sidecar, skippedSocialCommentPath: true };
  try {
    const data = await fs.readFile(sidecar);
    if (!awtsmoosBinary.isAwtsmoosObject(data)) return { exists: true, value: null, path: sidecar };
    const value = awtsmoosBinary.deserializeBinary(data);
    return { exists: true, value, path: sidecar };
  } catch (error) {
    if (error && error.code === "ENOENT") return { exists: false, value: null, path: sidecar };
    throw error;
  }
}

class DosDB {
  readAwtsmoosBinary = true;

  constructor(directory) {
    bindMethodBag(this, writeMethods);
    bindMethodBag(this, readMethods);
    bindMethodBag(this, pathMethods);
    bindMethodBag(this, arrayMethods);
    bindMethodBag(this, directoryMethods);
    bindMethodBag(this, objMethods);
    bindMethodBag(this, firebaseMethods);
    this.awtsmoosBinary = awtsmoosBinary;
    this.directory = this.sanitizeAwtsmoosPath(directory || "../");
    this.installAwtsmoosDbFsRouter();
  }

  installAwtsmoosDbFsRouter() {
    if (this.__awtsmoosDbFsRouterInstalled) return;
    this.__awtsmoosDbFsRouterInstalled = true;
    this.__awtsmoosDbFsRouter = new AwtsmoosDbFsRouter(this);
    const legacy = {
      get: this.get?.bind(this),
      read: this.read?.bind(this),
      write: this.write?.bind(this),
      delete: this.delete?.bind(this),
      rename: this.rename?.bind(this),
      getObjectKeys: this.getObjectKeys?.bind(this),
      getValue: this.getValue?.bind(this),
      syncKeyInObj: this.syncKeyInObj?.bind(this),
      syncKeyInArray: this.syncKeyInArray?.bind(this),
      appendToObj: this.appendToObj?.bind(this),
      updateEntry: this.updateEntry?.bind(this),
      appendToArrayAtKey: this.appendToArrayAtKey?.bind(this),
      setObjectKey: this.setObjectKey?.bind(this),
      getObjectKey: this.getObjectKey?.bind(this),
      deleteObjectKey: this.deleteObjectKey?.bind(this),
      deleteEntry: this.deleteEntry?.bind(this)
    };
    this.__legacyDosDbMethods = legacy;

    const routedLooksLikeBrokenCollection = async id => {
      const routedKeys = await this.__awtsmoosDbFsRouter.maybe("getObjectKeys", id);
      if (isSocialCommentPath(id)) return { broken: false, routedKeys, legacyKeys: null, skippedSocialCommentPath: true };
      let legacyKeys = null;
      try { legacyKeys = await legacy.getObjectKeys(id); } catch (_error) { legacyKeys = null; }
      const routedList = Array.isArray(routedKeys) ? routedKeys : null;
      const legacyList = Array.isArray(legacyKeys) ? legacyKeys : null;
      if (!routedList || !legacyList || !legacyList.length) return { broken: false, routedKeys, legacyKeys };
      const hasProbe = routedList.includes("__awtsmoos_agent_legacy_raw_write_probe_do_not_keep__");
      const shorterThanLegacy = routedList.length < legacyList.length;
      return { broken: hasProbe || shorterThanLegacy, routedKeys, legacyKeys };
    };

    this.get = async (id, options = {}) => cachedPromise(finalReadKey(this.directory, "get", id, options), async () => {
      if (!options || Object.keys(options).length === 0) {
        const sidecar = await readAwtsmoosArraySidecar(this.directory, id);
        if (sidecar.exists && Array.isArray(sidecar.value)) return sidecar.value;
      }
      const routed = await this.__awtsmoosDbFsRouter.maybe("get", id, options);
      if (maybeResult(routed)) {
        const comparison = await routedLooksLikeBrokenCollection(id);
        return comparison.broken ? legacy.get(id, options) : routed;
      }
      return legacy.get(id, options);
    });

    this.read = async (id, options = {}) => cachedPromise(finalReadKey(this.directory, "read", id, options), async () => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("get", id, options);
      if (maybeResult(routed)) {
        const comparison = await routedLooksLikeBrokenCollection(id);
        return comparison.broken ? legacy.read(id, options) : routed;
      }
      return legacy.read(id, options);
    });

    this.write = async (id, record, opts = {}) => {
      invalidateFinalReadCacheFor(this.directory, id);
      const routed = await this.__awtsmoosDbFsRouter.maybe("write", id, record, opts);
      return maybeResult(routed) ? routed : legacy.write(id, record, opts);
    };

    this.delete = async (id, recursive = false) => {
      invalidateFinalReadCacheFor(this.directory, id);
      const routed = await this.__awtsmoosDbFsRouter.maybe("delete", id, recursive);
      return maybeResult(routed) ? routed : legacy.delete(id, recursive);
    };

    this.rename = async (oldId, newId) => {
      invalidateFinalReadCacheFor(this.directory, oldId, newId);
      const routed = await this.__awtsmoosDbFsRouter.maybe("rename", oldId, newId);
      return maybeResult(routed) ? routed : legacy.rename(oldId, newId);
    };

    this.getObjectKeys = async id => cachedPromise(finalReadKey(this.directory, "getObjectKeys", id, {}), async () => {
      const sidecar = await readAwtsmoosArraySidecar(this.directory, id);
      if (sidecar.exists && Array.isArray(sidecar.value)) return sidecar.value;
      const comparison = await routedLooksLikeBrokenCollection(id);
      if (comparison.broken) return comparison.legacyKeys;
      let directKeys = maybeResult(comparison.routedKeys) ? comparison.routedKeys : undefined;
      if (isSocialCommentPath(id)) return directKeys || [];
      if (directKeys === undefined && Array.isArray(comparison.legacyKeys)) {
        // B"H QA db-phase2 (2026-11-03): routedLooksLikeBrokenCollection
        // already enumerated the legacy keys for this exact id; asking
        // legacy.getObjectKeys again below would repeat the full
        // directory enumeration for an identical result.
        directKeys = comparison.legacyKeys;
      }
      let directValue;
      try {
        // B"H QA db-phase2 (2026-11-03): bounded probe. When the key
        // list is longer than one directory page (10), the only facts
        // taken from legacy.get below are "is it an array" and its
        // length (the P4 page-vs-collection decision) — a stored-array
        // or dynamic-record value is unaffected by sort order, and a
        // directory page is 10 long under either sort, so probing with
        // the alphabetical page (which stats only the page entries
        // instead of the whole directory) cannot change the outcome.
        directValue = (Array.isArray(directKeys) && directKeys.length > 10)
          ? await legacy.get(id, { sortBy: "alphabetical", pageSize: 10, propertyMap: null, arrayFilter: null })
          : await legacy.get(id);
      } catch (_error) { directValue = undefined; }
      if (directKeys === undefined) {
        try { directKeys = await legacy.getObjectKeys(id); }
        catch (_error) { directKeys = undefined; }
      }
      if (Array.isArray(directValue)) {
        // B"H QA fix P4 (2026-11-03): legacy.get() on a directory-backed
        // collection returns only the first page (pageSize 10), so an
        // array value SHORTER than the enumerated key list is a page,
        // not the collection itself - the keys win. A complete stored
        // array (length >= key count) keeps the historical
        // values-as-keys behavior for array-valued records.
        if (Array.isArray(directKeys) && directKeys.length > directValue.length) return directKeys;
        return directValue;
      }
      if (Array.isArray(directKeys) && directKeys.length) return directKeys;
      if (directValue && typeof directValue === "object" && !Buffer.isBuffer(directValue)) return Object.keys(directValue);
      return directKeys || [];
    });

    this.exists = async id => cachedPromise(finalReadKey(this.directory, "exists", id, {}), async () => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("get", id, { access: true });
      if (maybeResult(routed)) return { success: true };
      try {
        const got = await legacy.get(id, { access: true });
        return { success: got !== undefined && got !== null };
      } catch (_err) {
        return { success: false };
      }
    });

    this.syncKeyInObj = async (id, key, value = true) => {
      invalidateFinalReadCacheFor(this.directory, id);
      const comparison = await routedLooksLikeBrokenCollection(id);
      if (comparison.broken) return legacy.syncKeyInObj(id, key, value);
      const routed = await this.__awtsmoosDbFsRouter.maybe("syncKeyInObj", id, key, value);
      return maybeResult(routed) ? routed : legacy.syncKeyInObj(id, key, value);
    };

    this.syncKeyInArray = async (id, value) => {
      invalidateFinalReadCacheFor(this.directory, id);
      if (isSocialCommentPath(id)) {
        const routed = await this.__awtsmoosDbFsRouter.maybe("syncKeyInArray", id, value);
        return maybeResult(routed) ? routed : { success: { skippedSocialCommentPath: true, id, value } };
      }
      const sidecar = await readAwtsmoosArraySidecar(this.directory, id);
      let arr = Array.isArray(sidecar.value) ? sidecar.value : [];
      if (!arr.includes(value)) {
        arr = [...arr, value];
        const serialized = awtsmoosBinary.serializeJSON(arr);
        await fs.mkdir(path.dirname(sidecar.path), { recursive: true });
        await fs.writeFile(sidecar.path, serialized);
        invalidateFinalReadCacheFor(this.directory, id);
        return { success: { written: sidecar.path, serialized: serialized.length, inputArray: arr, appended: value } };
      }
      return { success: { written: sidecar.path, inputArray: arr, alreadyPresent: value } };
    };

    this.appendToObj = async (id, payload = {}) => {
      invalidateFinalReadCacheFor(this.directory, id);
      const comparison = await routedLooksLikeBrokenCollection(id);
      if (comparison.broken) return legacy.appendToObj(id, payload);
      const routed = await this.__awtsmoosDbFsRouter.maybe("appendToObj", id, payload);
      return maybeResult(routed) ? routed : legacy.appendToObj(id, payload);
    };

    this.updateEntry = async (id, payload = {}) => {
      invalidateFinalReadCacheFor(this.directory, id);
      const comparison = await routedLooksLikeBrokenCollection(id);
      if (comparison.broken) return legacy.updateEntry(id, payload);
      const routed = await this.__awtsmoosDbFsRouter.maybe("updateEntry", id, payload);
      return maybeResult(routed) ? routed : legacy.updateEntry(id, payload);
    };

    this.appendToArrayAtKey = async (id, payload = {}) => {
      invalidateFinalReadCacheFor(this.directory, id);
      const comparison = await routedLooksLikeBrokenCollection(id);
      if (comparison.broken) return legacy.appendToArrayAtKey(id, payload);
      const routed = await this.__awtsmoosDbFsRouter.maybe("appendToArrayAtKey", id, payload);
      return maybeResult(routed) ? routed : legacy.appendToArrayAtKey(id, payload);
    };

    this.setObjectKey = async (id, key, value) => {
      invalidateFinalReadCacheFor(this.directory, id);
      const comparison = await routedLooksLikeBrokenCollection(id);
      if (comparison.broken) return legacy.setObjectKey(id, key, value);
      const routed = await this.__awtsmoosDbFsRouter.maybe("setObjectKey", id, key, value);
      return maybeResult(routed) ? routed : legacy.setObjectKey(id, key, value);
    };

    this.getObjectKey = async (id, key) => cachedPromise(finalReadKey(this.directory, "getObjectKey", id, { key }), async () => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("getObjectKey", id, key);
      if (maybeResult(routed)) return routed;
      const value = await this.get(id, { propertyMap: { [key]: true } });
      if (value && typeof value === "object" && key in value) return value[key];
      return legacy.getObjectKey(id, key);
    });

    this.getValue = async (id, key, map) => cachedPromise(finalReadKey(this.directory, "getValue", id, { key, map }), async () => {
      const routed = await this.__awtsmoosDbFsRouter.maybe("getObjectKey", id, key);
      if (maybeResult(routed)) return routed;
      const propertyMap = { [key]: map && typeof map === "object" ? map : true };
      const value = await this.get(id, { propertyMap });
      if (value && typeof value === "object" && !Buffer.isBuffer(value) && key in value) return value[key];
      return legacy.getValue ? legacy.getValue(id, key, map) : legacy.getObjectKey(id, key);
    });

    this.deleteObjectKey = async (id, key) => {
      invalidateFinalReadCacheFor(this.directory, id);
      const arrayInfo = await (legacy.getArrayAtPath ? legacy.getArrayAtPath(id) : this.getArrayAtPath(id)).catch(() => null);
      const directArray = await legacy.get(id).catch(() => null);
      const candidateArray = Array.isArray(arrayInfo?.success) && arrayInfo.success.length
        ? arrayInfo.success
        : (Array.isArray(directArray) ? directArray : null);
      if (candidateArray) {
        const filtered = candidateArray.filter(item => item !== key);
        if (filtered.length !== candidateArray.length) {
          if (isSocialCommentPath(id)) {
            const routed = await this.__awtsmoosDbFsRouter.maybe("deleteObjectKey", id, key);
            return maybeResult(routed) ? routed : { success: { skippedSocialCommentPath: true, id, removed: key } };
          }
          const serialized = awtsmoosBinary.serializeJSON(filtered);
          const cleanParts = String(id || "").replace(/^[A-Za-z]:/, "").replace(/\\/g, "/").split("/").filter(Boolean);
          const sidecarPath = arrayInfo?.myPath && String(arrayInfo.myPath).endsWith(".awtsmoosJSON")
            ? arrayInfo.myPath
            : path.join(this.directory, ...cleanParts) + ".awtsmoosJSON";
          await fs.writeFile(sidecarPath, serialized);
          invalidateFinalReadCacheFor(this.directory, id);
          return { success: { written: sidecarPath, serialized: serialized.length, inputArray: filtered, removed: key } };
        }
      }
      const comparison = await routedLooksLikeBrokenCollection(id);
      if (comparison.broken) return legacy.deleteObjectKey(id, key);
      const routed = await this.__awtsmoosDbFsRouter.maybe("deleteObjectKey", id, key);
      return maybeResult(routed) ? routed : legacy.deleteObjectKey(id, key);
    };

    this.deleteEntry = async (id, key) => {
      invalidateFinalReadCacheFor(this.directory, id);
      const comparison = await routedLooksLikeBrokenCollection(id);
      if (comparison.broken) return legacy.deleteEntry(id, key);
      const routed = await this.__awtsmoosDbFsRouter.maybe("deleteObjectKey", id, key);
      return maybeResult(routed) ? routed : legacy.deleteEntry(id, key);
    };
  }

  async init() { await fs.mkdir(this.directory, { recursive: true }); }

  awtsmoosDb(filePath, options = {}) { return createAwtsmoosDb(filePath, options, this); }

  closeAwtsmoosDbFsRouter() { this.__awtsmoosDbFsRouter?.close?.(); }

  async info(pathToInspect, order = "asc") {
    const stats = await stat(pathToInspect);
    if (stats.isDirectory()) {
      let files = await readdir(pathToInspect);
      files.sort();
      if (order === "desc") files.reverse();
      return files.slice(0, 10);
    }
    if (stats.isFile()) {
      const parts = pathToInspect.split("/");
      parts.pop();
      if (order === "desc") parts.reverse();
      return parts;
    }
    return [];
  }

  async readAllFiles(dir) {
    let results = [];
    const list = await fs.readdir(dir);
    for (const file of list) {
      const filePath = path.resolve(dir, file);
      const fileStat = await fs.stat(filePath);
      if (fileStat && fileStat.isDirectory()) results = results.concat(await this.readAllFiles(filePath));
      else results.push({ path: filePath, data: await fs.readFile(filePath) });
    }
    return results;
  }

  async exportDatabase() {
    const allFiles = await this.readAllFiles(this.directory);
    const fileData = Buffer.from(JSON.stringify(allFiles));
    await fs.writeFile(path.join(this.directory, "db_export.bin"), fileData);
  }

  async importDatabase() {
    const fileData = await fs.readFile(path.join(this.directory, "db_export.bin"));
    const allFiles = JSON.parse(fileData.toString());
    for (const file of allFiles) {
      await this.ensureDir(file.path);
      await fs.writeFile(file.path, file.data);
    }
  }
}

DosDB.AwtsmoosDB = AwtsmoosDB;
DosDB.awtsmoosDb = function awtsmoosDb(filePath, options = {}) { return createAwtsmoosDb(filePath, options, null); };
DosDB.createAwtsmoosDb = DosDB.awtsmoosDb;
DosDB.clearFinalReadCache = clearFinalReadCache;
DosDB.invalidateFinalReadCacheFor = invalidateFinalReadCacheFor;

module.exports = DosDB;
