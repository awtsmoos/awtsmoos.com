// B"H

/**
 * @file api/backup/index.js
 * @chapter The Snapshot That Carries A World
 * @description Whole-file and partial JSON backups without loading disk bytes.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class BackupManager {
  constructor(db) { this.db = db; }

  create(target, options = {}) {
    this.db.waitForIdle({ closing: false });
    if (options.paths && options.paths.length) return this.partial(target, options);
    return this.files(target);
  }

  restore(source, options = {}) {
    if (source.endsWith('.json')) return this.restorePartial(source, options);
    return this.restoreFiles(source);
  }

  files(target) {
    const base = this.db.pager.filePath;
    const dir = ensureDir(target);
    const copied = [];
    const manifest = { format: 'awtsmoos-backup-v1', at: Date.now(), source: base, files: [] };
    for (const suffix of ['', '.sparse.json', '.turbo.json', '.turbo.log', '.turbo.tree.json']) {
      const from = `${base}${suffix}`;
      if (!fs.existsSync(from)) continue;
      const to = path.join(dir, path.basename(from));
      copyAtomic(from, to);
      copied.push(to);
      manifest.files.push({ name: path.basename(from), bytes: fs.statSync(to).size, sha256: sha256(to) });
    }
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest));
    return { ok: true, kind: 'files', target: dir, files: copied.length };
  }

  partial(target, options) {
    const payload = { format: 'awtsmoos-partial-v1', at: Date.now(), entries: {} };
    for (const p of options.paths) payload.entries[clean(p)] = this.readPath(p);
    fs.writeFileSync(target, JSON.stringify(payload));
    return { ok: true, kind: 'partial', target, entries: Object.keys(payload.entries).length };
  }

  restorePartial(source, options = {}) {
    const payload = JSON.parse(fs.readFileSync(source, 'utf8'));
    const prefix = options.into ? clean(options.into) : '';
    for (const [p, value] of Object.entries(payload.entries || {})) {
      this.writePath(prefix ? `${prefix}.${stripRoot(p)}` : p, value);
    }
    return { ok: true, entries: Object.keys(payload.entries || {}).length };
  }

  restoreFiles(source) {
    const base = this.db.pager.filePath;
    this.verifyManifest(source);
    for (const file of fs.readdirSync(source)) {
      if (!file.startsWith(path.basename(base))) continue;
      copyAtomic(path.join(source, file), path.join(path.dirname(base), file));
    }
    return { ok: true, source };
  }

  verifyManifest(source) {
    const manifestPath = path.join(source, 'manifest.json');
    if (!fs.existsSync(manifestPath)) throw new Error(`B"H: backup manifest missing`);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const item of manifest.files || []) {
      const file = path.join(source, item.name);
      if (!fs.existsSync(file)) throw new Error(`B"H: backup file missing: ${item.name}`);
      if (fs.statSync(file).size !== item.bytes) throw new Error(`B"H: backup size mismatch: ${item.name}`);
      if (sha256(file) !== item.sha256) throw new Error(`B"H: backup checksum mismatch: ${item.name}`);
    }
    return { ok: true, files: (manifest.files || []).length };
  }

  readPath(p) {
    let cur = this.db.root;
    for (const part of parts(p)) cur = cur == null ? undefined : cur[part];
    return this.db._plain(cur);
  }

  writePath(p, value) {
    const ps = parts(p);
    let cur = this.db.root;
    for (let i = 0; i < ps.length - 1; i++) {
      if (cur[ps[i]] === undefined) cur[ps[i]] = {};
      cur = cur[ps[i]];
    }
    cur[ps[ps.length - 1]] = value;
  }
}

function ensureDir(target) {
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
  return target;
}

function clean(p) {
  const s = String(Array.isArray(p) ? p.join('.') : p || 'root');
  return s === 'root' || s.startsWith('root.') ? s : `root.${s}`;
}
function stripRoot(p) { return String(p).replace(/^root\.?/, ''); }
function parts(p) { return stripRoot(clean(p)).split('.').filter(Boolean); }
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function copyAtomic(from, to) {
  const tmp = `${to}.tmp`;
  fs.copyFileSync(from, tmp);
  fs.renameSync(tmp, to);
}

module.exports = BackupManager;
