// B"H

/**
 * @file scripts/probe_migrate_folder.js
 * @chapter The First Caravan Before The Great Crossing
 * @description
 * Capped migration probe for moving an existing folder tree into one new
 * AwtsmoosDB file. It is intentionally limited by file count and byte count,
 * writes console progress, reopens the DB, and verifies sampled files by
 * SHA-256 before any full migration is attempted.
 *
 * Usage:
 *   node scripts/probe_migrate_folder.js --source "..\\..\\.." --out ".\\tmp\\probe.db" --limit 100 --maxBytes 52428800
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AwtsmoosDB = require('../index.js');

const DEFAULT_SOURCE = path.resolve(__dirname, '..', '..', '..');
const DEFAULT_OUT = path.resolve(__dirname, '..', 'tmp', 'migration_probe.db');
const COPY_CHUNK = 64 * 1024;

function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = path.resolve(args.source || DEFAULT_SOURCE);
  const out = path.resolve(args.out || DEFAULT_OUT);
  const limit = Math.max(1, Number(args.limit || 100));
  const maxBytes = Math.max(1, Number(args.maxBytes || 64 * 1024 * 1024));
  const sample = Math.max(1, Number(args.sample || 10));

  console.log(`B"H probe source: ${source}`);
  console.log(`B"H probe output: ${out}`);
  console.log(`B"H hard limits: files=${limit}, bytes=${maxBytes}`);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  removeDbFamily(out);

  const files = collectFiles(source, { limit, maxBytes, out });
  console.log(`B"H collected ${files.length} files, ${sum(files, 'size')} bytes`);

  const db = new AwtsmoosDB(out, {
    compression: true,
    turboWrites: true,
    reuseFreedSpace: true
  });
  db.open();

  const manifest = [];
  for (let i = 0; i < files.length; i++) {
    const item = files[i];
    const raw = fs.readFileSync(item.abs);
    const blob = db.blob.create(raw, {
      rel: item.rel,
      source: item.abs,
      size: raw.length,
      sha256: sha256(raw)
    });
    const row = {
      rel: item.rel,
      size: raw.length,
      sha256: blob.meta.sha256,
      blob
    };
    manifest.push(row);
    if ((i + 1) % 25 === 0 || i === files.length - 1) {
      console.log(`B"H wrote ${i + 1}/${files.length}: ${item.rel} (${raw.length} bytes)`);
    }
  }

  db.root.__migration_probe_manifest = manifest;
  db.root.__migration_probe_source = source;
  db.root.__migration_probe_createdAt = new Date().toISOString();
  db.waitForIdle();
  const beforeClose = db.info();
  db.close();

  const verified = verify(out, manifest, source, sample);
  const stat = fs.statSync(out);

  console.log(`B"H probe db bytes: ${stat.size}`);
  console.log(`B"H logical bytes: ${beforeClose.logicalBytes}, free bytes: ${beforeClose.freeBytes}`);
  console.log(`B"H verified ${verified}/${Math.min(sample, manifest.length)} samples after reopen`);
  console.log('B"H migration probe PASS');
}

function collectFiles(source, options) {
  const out = [];
  const stack = [source];
  let bytes = 0;

  while (stack.length && out.length < options.limit && bytes < options.maxBytes) {
    const current = stack.pop();
    if (shouldSkip(current, options.out)) continue;
    const st = fs.statSync(current);

    if (st.isDirectory()) {
      const children = fs.readdirSync(current)
        .map((name) => path.join(current, name))
        .sort()
        .reverse();
      for (const child of children) stack.push(child);
      continue;
    }

    if (!st.isFile()) continue;
    if (bytes + st.size > options.maxBytes) break;

    out.push({
      abs: current,
      rel: path.relative(source, current).split(path.sep).join('/'),
      size: st.size
    });
    bytes += st.size;
  }

  return out;
}

function verify(dbPath, manifest, source, sample) {
  const db = new AwtsmoosDB(dbPath, { compression: true, turboWrites: true });
  db.open();
  const stored = plain(db.root.__migration_probe_manifest) || [];
  let ok = 0;

  for (let i = 0; i < Math.min(sample, stored.length); i++) {
    const row = stored[i];
    const original = fs.readFileSync(path.join(source, row.rel));
    const bytes = db.blob.read(row.blob, 0, row.size);
    const same = bytes.length === original.length
      && sha256(bytes) === row.sha256
      && row.sha256 === sha256(original);
    if (!same) throw new Error(`B"H verify failed for ${row.rel}`);
    ok++;
    console.log(`B"H verified sample ${i + 1}: ${row.rel}`);
  }

  db.close();
  return ok;
}

function shouldSkip(abs, outPath) {
  const lower = abs.toLowerCase();
  const outLower = outPath.toLowerCase();
  return lower === outLower
    || lower.startsWith(`${outLower}.`)
    || lower.includes(`${path.sep}node_modules${path.sep}`)
    || lower.includes(`${path.sep}.git${path.sep}`)
    || lower.includes(`${path.sep}tmp${path.sep}migration_probe`);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    out[arg.slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return out;
}

function plain(value) {
  return value && value.__resolve__ ? value.__resolve__() : value;
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function removeDbFamily(file) {
  for (const suffix of ['', '.turbo.json', '.turbo.log', '.turbo.tree.json', '.turbo.tree.json.tmp', '.wal']) {
    fs.rmSync(`${file}${suffix}`, { force: true, recursive: true });
  }
}

main();
