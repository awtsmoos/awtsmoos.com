// B"H

/**
 * @file api/fs/index.js
 * @chapter The Files Became Names In A Firmament, Not Branches In A Crowd
 * @description
 * Filesystem-like commands over AwtsmoosDB entries.
 *
 * The older filesystem stored every path below one nested object at `__fs__`.
 * That is poetic, but a huge tree is a dangerous vessel: large migrations can
 * mutate many live nested handles and persist only part of the forest. This v2
 * filesystem stores paths in an indexed table instead:
 *
 * - `E:/a/b.txt` stores the file/dir entry for one exact path.
 * - `C:/a` stores that directory's child-name set only.
 *
 * Thus writing `/a/b/c.txt` touches only `/`, `/a`, `/a/b`, and the file entry.
 * Reads and writes stay localized, old `__fs__` trees remain readable as a
 * fallback, and blobs still support partial reads through `db.blob.read`.
 */

class VirtualFs {
  constructor(db) {
    this.db = db;
    this.cwd = '/';
    this.rootKey = '__fs__';
    this.indexKey = '__fs2__';
  }

  pwd() { return this.cwd; }

  cd(p = '/') {
    const next = normalize(this.cwd, p);
    if (!this.exists(next)) this.mkdir(next);
    this.cwd = next;
    return this.cwd;
  }

  mkdir(p) {
    this._ensureDir(normalize(this.cwd, p));
    return true;
  }

  ls(p = '.') {
    const target = normalize(this.cwd, p);
    const children = this._children(target, false);
    if (children) return this.db.keys(children, { order: 'asc', limit: Infinity });
    const oldNode = this._oldNode(target, false);
    return oldNode && typeof oldNode === 'object' ? this.db.keys(oldNode, { order: 'asc', limit: Infinity }) : [];
  }

  cat(p, options = {}) {
    const entry = this._entry(normalize(this.cwd, p));
    if (entry !== undefined) return this._entryValue(entry, options);
    const value = this._oldNode(p, false);
    if (value && value.__awtsmoosBlob === true) return this.db.blob.read(value, options.offset || 0, options.length);
    return this.db._plain(value);
  }

  write(p, value) {
    const fullPath = normalize(this.cwd, p);
    const parentPath = dirname(fullPath);
    const name = basename(fullPath);
    this._ensureDir(parentPath);
    this._setEntry(fullPath, Buffer.isBuffer(value) ? this.db.blob.create(value, { path: fullPath }) : value);
    this._addChild(parentPath, name);
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

  rm(p) {
    const fullPath = normalize(this.cwd, p);
    const entry = this._entry(fullPath);
    if (entry !== undefined) {
      this._removeIndexed(fullPath);
      return true;
    }
    const slot = this._oldSlot(fullPath, false);
    return slot.parent ? delete slot.parent[slot.key] : false;
  }

  mv(from, to) {
    const value = this.cat(from);
    this.write(to, value);
    this.rm(from);
    return true;
  }

  cp(from, to) {
    this.write(to, this.cat(from));
    return true;
  }

  stat(p) {
    const fullPath = normalize(this.cwd, p);
    const entry = this._entry(fullPath);
    if (entry !== undefined) {
      const plain = this._entryPlain(entry);
      return {
        exists: true,
        type: isDirEntry(plain) ? 'object' : Buffer.isBuffer(this._entryValue(entry)) ? 'buffer' : Array.isArray(plain) ? 'array' : typeof plain
      };
    }
    const value = this._oldNode(fullPath, false);
    const plain = this.db._plain(value);
    return { exists: value !== undefined, type: Buffer.isBuffer(plain) ? 'buffer' : Array.isArray(plain) ? 'array' : typeof plain };
  }

  exists(p) {
    const fullPath = normalize(this.cwd, p);
    return this._entry(fullPath) !== undefined || this._oldNode(fullPath, false) !== undefined;
  }

  grep(pattern, p = '.') {
    const needle = pattern instanceof RegExp ? pattern : new RegExp(String(pattern));
    const out = [];
    const walk = (currentPath) => {
      const entry = this._entry(currentPath);
      if (entry !== undefined && !isDirEntry(this._entryPlain(entry))) {
        const text = Buffer.isBuffer(this._entryValue(entry)) ? this._entryValue(entry).toString('utf8') : String(this._entryValue(entry) ?? '');
        if (needle.test(text)) out.push(currentPath);
        return;
      }
      for (const child of this.ls(currentPath)) walk(joinPath(currentPath, child));
    };
    walk(normalize(this.cwd, p));
    return out;
  }

  _index() {
    if (!this.db.root[this.indexKey]) this.db.root[this.indexKey] = {};
    return this.db.root[this.indexKey];
  }

  _entryKey(p) { return `E:${normalize('/', p)}`; }
  _childrenKey(p) { return `C:${normalize('/', p)}`; }

  _entry(p) {
    const index = this._index();
    return index[this._entryKey(p)];
  }

  _setEntry(p, value) {
    this._index()[this._entryKey(p)] = value;
  }

  _children(p, create) {
    const index = this._index();
    const key = this._childrenKey(p);
    if (!index[key] && create) index[key] = {};
    return index[key];
  }

  _ensureDir(p) {
    const clean = normalize('/', p);
    let cur = '/';
    this._setDirEntry('/');
    for (const part of clean.split('/').filter(Boolean)) {
      const next = joinPath(cur, part);
      this._setDirEntry(next);
      this._addChild(cur, part);
      cur = next;
    }
  }

  _setDirEntry(p) {
    if (this._entry(p) === undefined) this._setEntry(p, { __awtsmoosFsDir: true });
    this._children(p, true);
  }

  _addChild(parentPath, name) {
    if (!name) return;
    const children = this._children(parentPath, true);
    children[name] = true;
  }

  _removeIndexed(p) {
    const entry = this._entry(p);
    const index = this._index();
    if (isDirEntry(this._entryPlain(entry))) {
      for (const child of this.ls(p)) this._removeIndexed(joinPath(p, child));
      delete index[this._childrenKey(p)];
    }
    delete index[this._entryKey(p)];
    const children = this._children(dirname(p), false);
    if (children) delete children[basename(p)];
  }

  _entryPlain(entry) {
    return entry && entry.__resolve__ ? entry.__resolve__() : entry;
  }

  _entryValue(entry, options = {}) {
    const plain = this._entryPlain(entry);
    if (plain && plain.__awtsmoosBlob === true) return this.db.blob.read(plain, options.offset || 0, options.length);
    return this.db._plain(entry);
  }

  _oldRoot() {
    if (!this.db.root[this.rootKey]) this.db.root[this.rootKey] = {};
    return this.db.root[this.rootKey];
  }

  _oldNode(p, create) {
    const parts = normalize(this.cwd, p).split('/').filter(Boolean);
    let cur = this._oldRoot();
    for (const part of parts) {
      if (cur[part] === undefined) {
        if (!create) return undefined;
        cur[part] = {};
      }
      cur = cur[part];
    }
    return cur;
  }

  _oldSlot(p, create) {
    const parts = normalize(this.cwd, p).split('/').filter(Boolean);
    const key = parts.pop();
    let parent = this._oldRoot();
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

function isDirEntry(value) {
  return Boolean(value && typeof value === 'object' && value.__awtsmoosFsDir === true);
}

function normalize(cwd, p) {
  const base = String(p || '.').startsWith('/') ? [] : String(cwd || '/').split('/').filter(Boolean);
  for (const part of String(p || '.').split(/[\\/]+/)) {
    if (!part || part === '.') continue;
    if (part === '..') base.pop();
    else base.push(part);
  }
  return `/${base.join('/')}`;
}

function dirname(p) {
  const parts = normalize('/', p).split('/').filter(Boolean);
  parts.pop();
  return `/${parts.join('/')}`;
}

function basename(p) {
  const parts = normalize('/', p).split('/').filter(Boolean);
  return parts.pop() || '';
}

function joinPath(parent, child) {
  return normalize('/', `${normalize('/', parent)}/${child}`);
}

module.exports = VirtualFs;
