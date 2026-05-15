// B"H

/**
 * @file api/fs/index.js
 * @chapter The Shell Inside The Single File
 * @description Filesystem-like commands over ordinary AwtsmoosDB entries.
 */

class VirtualFs {
  constructor(db) {
    this.db = db;
    this.cwd = '/';
    this.rootKey = '__fs__';
  }

  pwd() { return this.cwd; }
  cd(p = '/') { this._node(p, true); this.cwd = normalize(this.cwd, p); return this.cwd; }
  mkdir(p) { this._slot(p, true).parent[this._slot(p, true).key] = {}; return true; }
  ls(p = '.') {
    const node = this._node(p, false);
    return node && typeof node === 'object' ? this.db.keys(node, { order: 'asc', limit: Infinity }) : [];
  }
  cat(p, options = {}) {
    const value = this._node(p, false);
    if (value && value.__awtsmoosBlob === true) return this.db.blob.read(value, options.offset || 0, options.length);
    return this.db._plain(value);
  }
  write(p, value) {
    const slot = this._slot(p, true);
    slot.parent[slot.key] = Buffer.isBuffer(value) ? this.db.blob.create(value, { path: normalize(this.cwd, p) }) : value;
    return true;
  }
  append(p, value) {
    const current = this.cat(p);
    if (Buffer.isBuffer(current) || Buffer.isBuffer(value)) {
      const a = Buffer.isBuffer(current) ? current : Buffer.from(String(current || ''));
      const b = Buffer.isBuffer(value) ? value : Buffer.from(String(value));
      return this.write(p, Buffer.concat([a, b]));
    }
    return this.write(p, String(current || '') + String(value));
  }
  rm(p) { const slot = this._slot(p, false); return slot.parent ? delete slot.parent[slot.key] : false; }
  mv(from, to) { const value = this._node(from, false); this.write(to, this.db._plain(value)); this.rm(from); return true; }
  cp(from, to) { this.write(to, this.db._plain(this._node(from, false))); return true; }
  stat(p) {
    const value = this._node(p, false);
    const plain = this.db._plain(value);
    return { exists: value !== undefined, type: Buffer.isBuffer(plain) ? 'buffer' : Array.isArray(plain) ? 'array' : typeof plain };
  }
  exists(p) { return this._node(p, false) !== undefined; }
  grep(pattern, p = '.') {
    const needle = pattern instanceof RegExp ? pattern : new RegExp(String(pattern));
    const out = [];
    const walk = (node, parts) => {
      if (!node || typeof node !== 'object' || node.__awtsmoosBlob === true) {
        const text = Buffer.isBuffer(node) ? node.toString('utf8') : String(this.db._plain(node) ?? '');
        if (needle.test(text)) out.push(`/${parts.join('/')}`);
        return;
      }
      for (const key of this.db.keys(node, { limit: Infinity })) walk(node[key], parts.concat(key));
    };
    walk(this._node(p, false), normalize(this.cwd, p).split('/').filter(Boolean));
    return out;
  }

  _root() {
    if (!this.db.root[this.rootKey]) this.db.root[this.rootKey] = {};
    return this.db.root[this.rootKey];
  }
  _node(p, create) {
    const parts = normalize(this.cwd, p).split('/').filter(Boolean);
    let cur = this._root();
    for (const part of parts) {
      if (cur[part] === undefined) {
        if (!create) return undefined;
        cur[part] = {};
      }
      cur = cur[part];
    }
    return cur;
  }
  _slot(p, create) {
    const parts = normalize(this.cwd, p).split('/').filter(Boolean);
    const key = parts.pop();
    let parent = this._root();
    for (const part of parts) {
      if (parent[part] === undefined) {
        if (!create) return { parent: null, key };
        parent[part] = {};
      }
      parent = parent[part];
    }
    return { parent, key };
  }
}

function normalize(cwd, p) {
  const base = String(p || '.') .startsWith('/') ? [] : String(cwd || '/').split('/').filter(Boolean);
  for (const part of String(p || '.').split(/[\\/]+/)) {
    if (!part || part === '.') continue;
    if (part === '..') base.pop();
    else base.push(part);
  }
  return `/${base.join('/')}`;
}

module.exports = VirtualFs;
