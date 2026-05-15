// B"H

/**
 * @file scripts/migrate_dayuh_chadash_full.js
 * @chapter The Fast Caravan Into One File
 * @description Decodes the old filesystem DosDB into one AwtsmoosDB file.
 *
 * Usage:
 *   node scripts/migrate_dayuh_chadash_full.js --deadlineMs 20000
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AwtsmoosDB = require('../index.js');
const oldBinary = require('../../awtsmoosBinaryJSON/index.js');

const DEFAULT_SOURCE = 'C:\\Users\\Yackov Yitzchak\\Documents\\WoW\\dayuhChadash';
const DEFAULT_OUT = 'C:\\Users\\Yackov Yitzchak\\Documents\\WoW\\dayuhChadash.awtsdb';
const ROOT_KEY = '__dosdb__';

function main() {
  const args = parseArgs(process.argv.slice(2));
  const deadlineMs = Math.max(1000, Number(args.deadlineMs || 20000));
  const clock = new Clock(deadlineMs);
  const source = path.resolve(args.source || DEFAULT_SOURCE);
  const out = path.resolve(args.out || DEFAULT_OUT);
  const verifySamples = Math.max(0, Number(args.verifySamples || 25));

  log(`source: ${source}`);
  log(`output: ${out}`);
  log(`deadline: ${deadlineMs}ms`);
  if (!fs.existsSync(source)) throw new Error(`B"H: source missing: ${source}`);

  clock.check('prepare');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  backupExisting(out);
  removeFamily(out);

  clock.lap('collect start');
  const { files, dirs } = collect(source, clock);
  const dirSet = new Set(dirs);
  clock.lap(`collected ${files.length} files, ${dirs.length} dirs`);

  const tree = {};
  for (const dir of dirs) {
    clock.check('dirs');
    setPlain(tree, dir, {});
  }

  const manifest = [];
  let totalBytes = 0;
  let decoded = 0;
  let blobs = 0;
  const db = new AwtsmoosDB(out, { compression: true, turboWrites: false, wal: true });
  db.open();

  try {
    for (let i = 0; i < files.length; i++) {
      clock.check(`decode ${i}/${files.length}`);
      const item = files[i];
      const raw = fs.readFileSync(item.abs);
      totalBytes += raw.length;
      const storeId = dirSet.has(item.id) ? `${item.id}/__value` : item.id;
      const imported = importValue(db, item, raw);
      if (imported.kind === 'blob') blobs++; else decoded++;
      setPlain(tree, storeId, imported.value);
      manifest.push({
        rel: item.rel,
        id: item.id,
        storeId,
        kind: imported.kind,
        bytes: raw.length,
        sha256: sha256(raw),
        valueHash: imported.valueHash || null
      });
      if ((i + 1) % 500 === 0 || i === files.length - 1) {
        clock.lap(`decoded ${i + 1}/${files.length}, bytes=${totalBytes}, decoded=${decoded}, blobs=${blobs}`);
      }
    }

    clock.check('write root');
    db.root[ROOT_KEY] = tree;
    db.root.__dosdb_migration__ = {
      source,
      rootKey: ROOT_KEY,
      files: manifest.length,
      dirs: dirs.length,
      bytes: totalBytes,
      decoded,
      blobs,
      createdAt: new Date().toISOString(),
      manifest
    };
    clock.lap('assigned root tree');

    db.waitForIdle({ closing: false });
    clock.lap('flushed DB');
  } finally {
    db.close();
  }

  if (verifySamples > 0) {
    verify(out, source, manifest, verifySamples, clock);
  }

  log(`DONE file=${out}`);
  log(`summary files=${manifest.length} dirs=${dirs.length} bytes=${totalBytes} decoded=${decoded} blobs=${blobs}`);
}

function importValue(db, item, raw) {
  if (/\.awtsmoosJSON$/i.test(item.rel) && oldBinary.deserializeBinary) {
    try {
      const value = oldBinary.deserializeBinary(raw);
      return { kind: 'awtsmoosJSON', value, valueHash: valueHash(value) };
    } catch (err) {
      return { kind: 'decode-error-text', value: raw.toString('utf8'), valueHash: valueHash(raw.toString('utf8')), error: err.message };
    }
  }
  if (/\.json$/i.test(item.rel)) {
    try {
      const value = JSON.parse(raw.toString('utf8'));
      return { kind: 'json', value, valueHash: valueHash(value) };
    } catch (_err) {}
  }
  if (looksText(raw)) return { kind: 'text', value: raw.toString('utf8'), valueHash: valueHash(raw.toString('utf8')) };
  return { kind: 'blob', value: db.blob.create(raw, { rel: item.rel, sha256: sha256(raw), bytes: raw.length }) };
}

function verify(dbPath, source, manifest, limit, clock) {
  clock.lap(`verify ${limit} samples start`);
  const db = new AwtsmoosDB(dbPath, { compression: true, turboWrites: false });
  db.open();
  try {
    const step = Math.max(1, Math.floor(manifest.length / limit));
    let checked = 0;
    for (let i = 0; i < manifest.length && checked < limit; i += step) {
      clock.check('verify');
      const item = manifest[i];
      const value = db.DosDB.get(item.storeId || item.id, { rootKey: ROOT_KEY });
      if (item.kind === 'blob') {
        const bytes = db.blob.read(value, 0, item.bytes);
        if (sha256(bytes) !== item.sha256) throw new Error(`B"H blob verify failed: ${item.rel}`);
      } else if (valueHash(db._plain(value)) !== item.valueHash) {
        throw new Error(`B"H value verify failed: ${item.rel}`);
      }
      if (sha256(fs.readFileSync(path.join(source, item.rel))) !== item.sha256) {
        throw new Error(`B"H source changed during migration: ${item.rel}`);
      }
      checked++;
    }
    clock.lap(`verified ${checked} samples`);
  } finally {
    db.close();
  }
}

function collect(source, clock) {
  const files = [];
  const dirs = [];
  const stack = [source];
  while (stack.length) {
    clock.check('collect');
    const abs = stack.pop();
    const children = fs.readdirSync(abs).sort();
    for (let i = children.length - 1; i >= 0; i--) {
      const full = path.join(abs, children[i]);
      const st = fs.statSync(full);
      if (st.isDirectory()) {
        const rel = relPath(source, full);
        dirs.push(rel);
        stack.push(full);
      } else if (st.isFile()) {
        const rel = relPath(source, full);
        files.push({ abs: full, rel, id: stripDataExt(rel) });
      }
    }
  }
  dirs.sort((a, b) => a.split('/').length - b.split('/').length);
  return { files, dirs };
}

class Clock {
  constructor(deadlineMs) {
    this.start = Date.now();
    this.deadlineMs = deadlineMs;
  }
  elapsed() { return Date.now() - this.start; }
  check(phase) {
    if (this.elapsed() > this.deadlineMs) {
      throw new Error(`B"H: migration deadline exceeded after ${this.elapsed()}ms at ${phase}`);
    }
  }
  lap(msg) { log(`${msg} (${this.elapsed()}ms)`); }
}

function relPath(source, abs) { return path.relative(source, abs).split(path.sep).join('/'); }
function stripDataExt(rel) { return rel.replace(/\.(awtsmoosJSON|json)$/i, ''); }
function sha256(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
function valueHash(value) { return sha256(Buffer.from(stable(value), 'utf8')); }
function stable(value) {
  if (value === undefined) return '"__undefined__"';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
}
function looksText(raw) { return raw.length < 1024 * 1024 && !raw.includes(0); }
function setPlain(root, id, value) {
  const parts = String(id || '').split('/').filter(Boolean);
  const key = parts.pop();
  let cur = root;
  for (const part of parts) {
    if (!cur[part] || typeof cur[part] !== 'object') cur[part] = {};
    cur = cur[part];
  }
  if (key) cur[key] = value;
}
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    out[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return out;
}
function backupExisting(file) {
  if (!fs.existsSync(file)) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  for (const suffix of ['', '.wal', '.sparse.json', '.turbo.json', '.turbo.log', '.turbo.tree.json']) {
    const p = `${file}${suffix}`;
    if (fs.existsSync(p)) fs.renameSync(p, `${p}.bak-${stamp}`);
  }
}
function removeFamily(file) {
  for (const suffix of ['', '.wal', '.sparse.json', '.turbo.json', '.turbo.log', '.turbo.tree.json', '.lock', '.txn.json']) {
    fs.rmSync(`${file}${suffix}`, { force: true, recursive: true });
  }
}
function log(msg) { console.log(`B"H [migrate] ${msg}`); }

main();
