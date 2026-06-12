//B"H
/**
 * @module AwtsmoosDbDosBridge
 * @description
 * Chapter 33: Many arks, one old doorway, and the doorway can write.
 *
 * This facade gives the social API a DosDB-shaped object whose reads and writes
 * prefer family-separated real AwtsmoosDB filesystem files. Missing paths fall
 * back to legacy DosDB. Replacement writes serialize JS objects back into real
 * AwtsmoosJSON bytes and store them as native blobs at the same virtual path.
 */

const fs = require('fs');
const path = require('path');
const awtsmoosBinary = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { AwtsmoosDbFsBridge, toVirtualPath } = require('./awtsmoosDbFsBridge.js');

function removeJsonExtension(name) { return String(name || '').replace(/\.(awtsmoosJSON|json)$/i, ''); }
function normalizeSocialPath(id) { return toVirtualPath(id).replace(/\/$/, ''); }
function pathWithDefaultExtension(id) {
  const clean = normalizeSocialPath(id);
  return path.posix.extname(clean) ? clean : `${clean}.awtsmoosJSON`;
}
function possibleFilePaths(id) {
  const clean = normalizeSocialPath(id);
  const ext = path.posix.extname(clean);
  return ext ? [clean] : [clean, `${clean}.awtsmoosJSON`, `${clean}.json`];
}
function familyForPath(id) {
  const clean = normalizeSocialPath(id);
  if (clean.includes('/comments/')) return ['comments', 'series', 'posts'];
  if (/\/series\/[^/]+\/posts(\.awtsmoosJSON)?$/i.test(clean)) return ['posts', 'series'];
  if (clean.includes('/series/')) return ['series', 'posts'];
  return ['series', 'comments', 'posts'];
}
function familyDbFiles({ packedDir, heichelId }) {
  return {
    comments: path.join(packedDir, `social.heichel.${heichelId}.comments.fs.awtsdb`),
    posts: path.join(packedDir, `social.heichel.${heichelId}.posts.fs.awtsdb`),
    series: path.join(packedDir, `social.heichel.${heichelId}.series.fs.awtsdb`)
  };
}
function serializeValue(value, vpath) {
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === 'string') return Buffer.from(value, 'utf8');
  if (path.posix.extname(vpath) === '.json') return Buffer.from(JSON.stringify(value ?? null, null, 2), 'utf8');
  return Array.isArray(value) ? awtsmoosBinary.serializeArray(value) : awtsmoosBinary.serializeJSON(value ?? {});
}

class AwtsmoosDbDosBridge {
  constructor({ dbFile = '', dbFiles = null, packedDir = '', heichelId = 'ikar', legacyDb = null }) {
    this.legacyDb = legacyDb;
    this.directory = legacyDb?.directory || '';
    this.heichelId = heichelId;
    const files = dbFiles || (packedDir ? familyDbFiles({ packedDir, heichelId }) : { series: dbFile });
    this.bridges = {};
    for (const [family, file] of Object.entries(files)) if (file && fs.existsSync(file)) this.bridges[family] = new AwtsmoosDbFsBridge({ dbFile: file });
  }

  close() { for (const bridge of Object.values(this.bridges)) bridge.close(); }

  async getObjectKeys(id) {
    const found = this._findExisting(id);
    if (found?.dir) return found.bridge.ls(found.path).map(removeJsonExtension);
    if (found?.file) {
      const fb = found.bridge.createFileBuffer(found.path);
      if (await awtsmoosBinary.isAwtsmoosObject(fb)) return awtsmoosBinary.getKeys(fb) || [];
    }
    return this.legacyDb?.getObjectKeys ? this.legacyDb.getObjectKeys(id) : [];
  }

  async get(id, options = {}) {
    const found = this._findExisting(id);
    if (found?.dir) return this._readDirectory(found.bridge, found.path, options);
    if (found?.file) return this._readFile(found.bridge, found.path, options);
    return this.legacyDb?.get ? this.legacyDb.get(id, options) : undefined;
  }

  async read(id, options = {}) { return this.get(id, options); }

  async write(id, value) {
    const vpath = pathWithDefaultExtension(id);
    const bridge = this._bridgeForWrite(vpath);
    if (bridge) return bridge.writeBuffer(vpath, serializeValue(value, vpath), { logicalPath: vpath });
    return this.legacyDb?.write ? this.legacyDb.write(id, value) : false;
  }

  async delete(id, recursive = false) {
    const found = this._findExisting(id);
    if (found?.file) return found.bridge.delete(found.path);
    if (found?.dir && recursive) return found.bridge.delete(found.path);
    return this.legacyDb?.delete ? this.legacyDb.delete(id, recursive) : false;
  }

  async rename(from, to) {
    const value = await this.get(from, { max: true });
    if (value === undefined || value === null) return false;
    await this.write(to, value);
    await this.delete(from, true);
    return true;
  }

  async syncKeyInObj(id, key, value) {
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

  _candidateFamilies(id) { return familyForPath(id).filter(family => this.bridges[family]); }
  _bridgeForWrite(id) {
    const family = familyForPath(id).find(name => this.bridges[name]);
    return family ? this.bridges[family] : null;
  }

  _findExisting(id) {
    const clean = normalizeSocialPath(id);
    for (const family of this._candidateFamilies(id)) {
      const bridge = this.bridges[family];
      const file = possibleFilePaths(clean).find(candidate => bridge.getBlobToken(candidate));
      if (file) return { bridge, family, path: file, file: true };
      if (bridge.exists(clean)) return { bridge, family, path: clean, dir: true };
    }
    return null;
  }

  _readDirectory(bridge, dir) { return bridge.ls(dir).map(removeJsonExtension); }

  async _readFile(bridge, file, options) {
    const ext = path.posix.extname(file);
    const fb = bridge.createFileBuffer(file);
    if (ext === '.json') return JSON.parse(fb.toString('utf8'));
    if (ext === '.awtsmoosJSON' || !ext) {
      if (!(await awtsmoosBinary.isAwtsmoosObject(fb))) return fb.subarray(0, fb.length);
      if (options?.propertyMap || options?.arrayFilter) return awtsmoosBinary.mapObject(fb, options.propertyMap || {}, null, options.arrayFilter);
      return awtsmoosBinary.deserializeBinary(fb);
    }
    return fb.subarray(0, fb.length);
  }
}

module.exports = { AwtsmoosDbDosBridge, familyDbFiles, familyForPath };
