// B"H

/**
 * @file api/dosdb/legacy.js
 * @chapter The Old Door Opening Into The New House
 * @description Async DosDB-compatible class backed by one AwtsmoosDB file.
 */

const path = require('path');
const AwtsmoosDB = require('../../index.js');

class LegacyDosDB {
  constructor(filePath, options = {}) {
    this.directory = filePath;
    this.filePath = filePath.endsWith('.awtsdb') || filePath.endsWith('.db') ? filePath : `${filePath}.awtsdb`;
    this.rootKey = options.rootKey || '__dosdb__';
    this.db = new AwtsmoosDB(this.filePath, { compression: true, turboWrites: false, ...options });
    this.readAwtsmoosBinary = true;
  }

  async init() { this.db.open(); return this; }
  close() { this.db.close(); }
  async write(id, value) { this.db.DosDB.write(cleanId(id), value, { rootKey: this.rootKey }); return { success: true }; }
  async create(id, value) { return this.write(id, value); }
  async update(id, value) { return this.write(id, { ...(await this.get(id) || {}), ...value }); }
  async get(id = '/', options = {}) {
    const clean = cleanId(id);
    const value = clean ? this.db.DosDB.get(clean, { rootKey: this.rootKey }) : this.db.root[this.rootKey];
    if (value === undefined) return null;
    if (options.access || options.meta || options.lastModified) return statLike(value);
    if (value && value.__awtsmoosBlob === true) return this.db.blob.read(value, 0, value.length);
    if (value && (typeof value === 'object' || typeof value === 'function') && !Array.isArray(value)) {
      const keys = this.db.keys(value, {
        order: options.order || 'asc',
        limit: options.max === true ? Infinity : options.pageSize || Infinity,
        offset: ((options.page || 1) - 1) * (options.pageSize || 10)
      });
      if (!options.recursive && !options.propertyMap && Object.keys(this.db._plain(value) || {}).length) return keys;
    }
    return this.db._plain(value);
  }
  async read(...args) { return this.get(...args); }
  async delete(id) { return this.db.DosDB.delete(cleanId(id), { rootKey: this.rootKey }); }
  async rename(from, to) { return this.db.DosDB.rename(cleanId(from), cleanId(to), { rootKey: this.rootKey }); }
  async copy(from, to) { return this.db.DosDB.copy(cleanId(from), cleanId(to), { rootKey: this.rootKey }); }
  async exists(id) { return this.db.DosDB.exists(cleanId(id), { rootKey: this.rootKey }); }
  async count(id = '/') { return { success: this.db.DosDB.list(cleanId(id), { rootKey: this.rootKey }).length }; }
  async stat(id) { return statLike(this.db.DosDB.get(cleanId(id), { rootKey: this.rootKey })); }
  async access(id) { return this.exists(id) ? this.stat(id) : null; }
  async readFileWithOffset(id, offset = 0, length) {
    return this.db.DosDB.readFileWithOffset(cleanId(id), offset, length, { rootKey: this.rootKey });
  }
  async getArrayAtPath(id) {
    const value = await this.get(id);
    return Array.isArray(value) ? { success: value, myPath: cleanId(id) } : { success: [], myPath: cleanId(id) };
  }
  async arrayAppend(id, value) {
    const got = await this.getArrayAtPath(id);
    const arr = got.success || [];
    arr.push(value);
    await this.write(id, arr);
    return { success: { inputArray: arr } };
  }
  async syncKeyInArray(id, key) {
    const got = await this.getArrayAtPath(id);
    const arr = got.success || [];
    if (!arr.includes(key)) arr.push(key);
    await this.write(id, arr);
    return { success: { inputArray: arr } };
  }
  async appendToObj(id, { key, value } = {}) {
    const obj = await this.get(id) || {};
    obj[key] = value;
    await this.write(id, obj);
    return { success: { key, value } };
  }
  async updateEntry(id, pair) { return this.appendToObj(id, pair); }
  async setObjectKey(id, key, value) { return this.appendToObj(id, { key, value }); }
  async getObjectKey(id, key) { const obj = await this.get(id) || {}; return obj[key]; }
  async hasObjectKey(id, key) { const obj = await this.get(id) || {}; return Object.prototype.hasOwnProperty.call(obj, key); }
  async deleteObjectKey(id, key) { const obj = await this.get(id) || {}; delete obj[key]; await this.write(id, obj); return { success: true }; }
  async deleteEntry(id, key) { return this.deleteObjectKey(id, key); }
  async getObjectKeys(id) { return Object.keys(await this.get(id) || {}); }
  async traverse(id = '/', options = {}) {
    const root = cleanId(id);
    const value = root ? this.db.DosDB.get(root, { rootKey: this.rootKey }) : this.db.root[this.rootKey];
    const build = (node, name, at, depth) => {
      const plain = this.db._plain(node);
      const isDir = plain && typeof plain === 'object' && !Array.isArray(plain) && plain.__awtsmoosBlob !== true;
      const out = { name, path: at || '/', type: isDir ? 'directory' : 'file' };
      if (options.loadContent && !isDir) out.content = plain;
      if (isDir && depth < (options.maxDepth || Infinity)) {
        out.children = this.db.keys(node, { order: 'asc', limit: Infinity })
          .map((key) => build(node[key], key, path.posix.join(at || '/', key), depth + 1));
      }
      return out;
    };
    return build(value, path.posix.basename(root) || 'root', root, 0);
  }
  removeJSONExtension(filePath) { return String(filePath).replace(/\.(awtsmoosJSON|json)$/i, ''); }
  sanitizeAwtsmoosPath(rawPath) { return rawPath; }
  async getAwtsmoosFilePath(id) { return cleanId(id); }
}

function cleanId(id) { return String(id || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.(awtsmoosJSON|json)$/i, ''); }
function statLike(value) {
  const now = new Date();
  return { birthtime: now, mtime: now, isDirectory: () => value && typeof value === 'object' && !Array.isArray(value), isFile: () => !value || typeof value !== 'object' || Array.isArray(value) };
}

module.exports = LegacyDosDB;
