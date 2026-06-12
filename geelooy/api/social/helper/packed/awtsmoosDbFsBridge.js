//B"H
/**
 * @module AwtsmoosDbFsBridge
 * @description
 * Chapter 32: The blob became a doorway both ways.
 *
 * AwtsmoosDB stores each old filesystem file as a native blob token. This bridge
 * exposes that blob as a FileBuffer-like reader for AwtsmoosJSON and also writes
 * whole replacement file bytes back into the same virtual filesystem path. Thus
 * old social helpers may keep speaking paths while the new arks hold the bytes.
 */

const path = require('path');
const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

function toVirtualPath(input) {
  return '/' + String(input || '').replace(/^[A-Za-z]:/, '').replace(/\\/g, '/').split('/').filter(Boolean).join('/');
}

function joinVirtual(...parts) { return toVirtualPath(path.posix.join(...parts.map(toVirtualPath))); }

function openHeichelFsDb(dbFile) {
  const db = new AwtsmoosDB(dbFile, { compression: false, reuseFreedSpace: 'verified' });
  db.open();
  return db;
}

function ensurePlainObject(parent, key) {
  const current = parent[key];
  if (!current || typeof current !== 'object' || current.__awtsmoosBlob === true) parent[key] = {};
  return parent[key];
}

class BlobFileBuffer {
  constructor(db, blob, name = '') {
    this.db = db;
    this.blob = blob;
    this.name = name;
    this.path = name;
    this.isFileBuffer = true;
    this.stats = { size: blob.length };
    this._length = blob.length;
    return new Proxy(this, {
      get(target, property) {
        if (!Number.isNaN(Number(property))) return target.readUInt8(Number(property));
        return target[property];
      }
    });
  }

  get length() { return this.blob.length; }
  subarray(startIndex = 0, endIndex = this.length) { return this.readBuffer(startIndex, endIndex); }
  toString(mode = 'utf8', startIndex = 0, endIndex = this.length) { return this.subarray(startIndex, endIndex).toString(mode); }
  readBuffer(startIndex = 0, endIndex = this.length) { return this.db.blob.read(this.blob, startIndex, Math.max(0, endIndex - startIndex)); }
  readUInt8(offset) { return this.readBuffer(offset, offset + 1).readUInt8(0); }
  readUInt16BE(offset) { return this.readBuffer(offset, offset + 2).readUInt16BE(0); }
  readUInt32BE(offset) { return this.readBuffer(offset, offset + 4).readUInt32BE(0); }
  readUIntBE(offset, byteLength) { return this.readBuffer(offset, offset + byteLength).readUIntBE(0, byteLength); }
  readString(offset, length) { return this.readBuffer(offset, offset + length).toString('utf8').replace(/\0/g, ''); }
  read(buffer, offset = 0, length = buffer.length, position = 0) {
    const chunk = this.db.blob.read(this.blob, position || 0, length || buffer.length);
    chunk.copy(buffer, offset, 0, chunk.length);
    return chunk.length;
  }
  write() { throw new Error('B"H: use AwtsmoosDbFsBridge.writeBuffer for replacement writes'); }
  truncate() { throw new Error('B"H: use AwtsmoosDbFsBridge.writeBuffer for replacement writes'); }
  close() { this.isClosed = true; }
}

class AwtsmoosDbFsBridge {
  constructor({ dbFile, rootPrefix = '/' }) {
    this.dbFile = dbFile;
    this.rootPrefix = toVirtualPath(rootPrefix || '/');
    this.db = openHeichelFsDb(dbFile);
  }

  close() { if (this.db) this.db.close(); }
  fullPath(vpath) { return joinVirtual(this.rootPrefix, vpath); }
  exists(vpath) { return Boolean(this._node(this.fullPath(vpath))); }
  ls(vpath = '/') { return Object.keys(this._node(this.fullPath(vpath)) || {}); }
  stat(vpath) {
    const node = this._node(this.fullPath(vpath));
    if (!node) return null;
    return node.__awtsmoosBlob ? { type: 'file', size: node.length, blob: true } : { type: 'directory' };
  }
  read(vpath, options = {}) {
    const fb = this.createFileBuffer(vpath);
    if (typeof options.start === 'number' || typeof options.end === 'number') return fb.subarray(options.start || 0, options.end || fb.length);
    return fb.subarray(0, fb.length);
  }
  readUtf8(vpath, options = {}) { return this.read(vpath, options).toString('utf8'); }

  getBlobToken(vpath) {
    const token = this._node(this.fullPath(vpath));
    return token && token.__awtsmoosBlob ? token : null;
  }

  createFileBuffer(vpath) {
    const token = this.getBlobToken(vpath);
    if (!token) throw new Error(`B"H: blob not found for ${vpath}`);
    return new BlobFileBuffer(this.db, token, vpath);
  }

  createFileHandle(vpath) { return this.createFileBuffer(vpath); }

  writeBuffer(vpath, value, meta = {}) {
    const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value || '');
    let blob = this.db.blob.create(buffer.length, { name: path.posix.basename(vpath), vpath, bytes: buffer.length, updatedAt: Date.now(), ...meta });
    blob = this.db.blob.write(blob, 0, buffer);
    this._setNode(this.fullPath(vpath), blob);
    return { ok: true, path: this.fullPath(vpath), bytes: buffer.length };
  }

  delete(vpath) {
    const parts = this.fullPath(vpath).split('/').filter(Boolean);
    const fileName = parts.pop();
    let cur = this.db.root.__fs__;
    for (const part of parts) {
      if (!cur || typeof cur !== 'object') return false;
      cur = cur[part];
    }
    if (!cur || !(fileName in cur)) return false;
    delete cur[fileName];
    return true;
  }

  _setNode(vpath, value) {
    const parts = toVirtualPath(vpath).split('/').filter(Boolean);
    const fileName = parts.pop();
    if (!this.db.root.__fs__) this.db.root.__fs__ = {};
    let cur = this.db.root.__fs__;
    for (const part of parts) cur = ensurePlainObject(cur, part);
    cur[fileName] = value;
  }

  _node(vpath) {
    const parts = toVirtualPath(vpath).split('/').filter(Boolean);
    let cur = this.db.root.__fs__;
    for (const part of parts) {
      if (!cur || cur[part] === undefined) return undefined;
      cur = cur[part];
    }
    return cur;
  }
}

module.exports = { AwtsmoosDbFsBridge, BlobFileBuffer, openHeichelFsDb, toVirtualPath, joinVirtual };
