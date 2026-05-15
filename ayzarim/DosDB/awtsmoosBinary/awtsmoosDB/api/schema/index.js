// B"H

/**
 * @file api/schema/index.js
 * @chapter The Gate That Knows The Shape
 * @description Tiny path validation and permission rules for writes.
 */

class SchemaManager {
  constructor(db) {
    this.db = db;
    this.rules = new Map();
    this.access = new Map();
  }

  define(path, spec) {
    const key = clean(path);
    this.rules.set(key, spec || {});
    this.persist();
    return { ok: true, path: key };
  }

  allow(path, fn) {
    if (typeof fn !== 'function') throw new Error('B"H: allow() needs a function');
    this.access.set(clean(path), fn);
    return { ok: true, path: clean(path) };
  }

  check(path, value, op) {
    const full = clean(path);
    for (const [base, fn] of this.access) {
      if (covers(base, full) && fn({ path: full, value, op, db: this.db }) === false) {
        throw new Error(`B"H: write denied at ${full}`);
      }
    }

    if (op === 'delete') return;

    for (const [base, spec] of this.rules) {
      if (!covers(base, full)) continue;
      this.validate(value, spec, full);
    }
  }

  validate(value, spec, path) {
    if (!spec || spec.any === true) return true;
    const plain = this.db._plain(value);
    if (spec.required && (plain === undefined || plain === null)) throw new Error(`B"H: required ${path}`);
    if (spec.type && typeOf(plain) !== spec.type) throw new Error(`B"H: ${path} must be ${spec.type}`);
    if (spec.props && plain && typeof plain === 'object') {
      for (const key of Object.keys(spec.props)) this.validate(plain[key], spec.props[key], `${path}.${key}`);
    }
    return true;
  }

  load() {
    const stored = this.db.root && this.db.root.__schema__;
    const rules = stored && stored.rules ? this.db._plain(stored.rules) : {};
    for (const [path, spec] of Object.entries(rules || {})) this.rules.set(path, spec);
  }

  persist() {
    if (!this.db.root) return;
    if (!this.db.root.__schema__) this.db.root.__schema__ = { rules: {} };
    this.db.root.__schema__.rules = Object.fromEntries(this.rules);
  }
}

function clean(path) {
  const s = Array.isArray(path) ? path.join('.') : String(path || 'root');
  return s.startsWith('root') ? s : `root.${s}`;
}

function covers(base, path) {
  return path === base || path.startsWith(`${base}.`);
}

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (Buffer.isBuffer(value)) return 'buffer';
  return value === null ? 'null' : typeof value;
}

module.exports = SchemaManager;
