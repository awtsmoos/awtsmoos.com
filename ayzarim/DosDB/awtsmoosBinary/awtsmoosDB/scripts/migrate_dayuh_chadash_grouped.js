// B"H

/**
 * @file scripts/migrate_dayuh_chadash_grouped.js
 * @chapter The Bottom-Up Lightning Caravan With A Living Pulse
 * @description
 * Grouped DosDB migration. It avoids repeated parent rewrites by building every
 * directory dictionary once from its direct children, bottom-up. It does not use
 * turbo, does not mirror the whole DB, and streams manifest entries to JSONL.
 *
 * Progress policy:
 * - Prints before and after every file/dir by default.
 * - Prints phase, item, percent, rate, input bytes, DB size, RSS/heap, and step time.
 * - Can abort after any single synchronous step exceeds --maxStepMs.
 *
 * Note: Node cannot print during one long synchronous deserialize/build call.
 * This script prints immediately before and immediately after those calls, and
 * can fail after the step if it exceeded the configured max.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AwtsmoosDB = require('../index.js');
const DictionaryEngine = require('../structure/dictionary/index.js');
const constants = require('../constants.js');
const oldBinary = require('../../awtsmoosBinaryJSON/index.js');

const DEFAULT_SOURCE = 'C:\\Users\\Yackov Yitzchak\\Documents\\WoW\\dayuhChadash';
const DEFAULT_OUT = 'C:\\Users\\Yackov Yitzchak\\Documents\\WoW\\dayuhChadash.awtsdb';
const ROOT_KEY = '__dosdb__';
const FAMILY_SUFFIXES = ['', '.wal', '.sparse.json', '.turbo.json', '.turbo.log', '.turbo.tree.json', '.lock', '.txn.json', '.manifest.jsonl'];

function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = path.resolve(String(args.source || DEFAULT_SOURCE));
  const out = path.resolve(String(args.out || DEFAULT_OUT));
  const progress = boolArg(args.progress, true);
  const verifySamples = Math.max(0, Number(args.verifySamples || 0));
  const manifestJsonl = boolArg(args.manifestJsonl, true);
  const heartbeatMs = Math.max(250, Number(args.heartbeatMs || 1000));
  const maxStepMs = Math.max(0, Number(args.maxStepMs || 0));
  const logEvery = Math.max(1, Number(args.logEvery || 1));
  const manifestFile = `${out}.manifest.jsonl`;
  const dbOptions = {
    compression: boolArg(args.compression, false),
    turboWrites: false,
    wal: boolArg(args.wal, false),
    maxCachedPages: Math.max(32, Number(args.maxCachedPages || 512)),
    dirtyPageFlushThreshold: Math.max(16, Number(args.dirtyPageFlushThreshold || 384))
  };

  log(`BEGIN grouped source=${source}`);
  log(`OUT ${out}`);
  log(`rootKey=${ROOT_KEY} verifySamples=${verifySamples} manifestJsonl=${manifestJsonl} heartbeatMs=${heartbeatMs} maxStepMs=${maxStepMs || 'disabled'} logEvery=${logEvery}`);
  log(`dbOptions=${JSON.stringify(dbOptions)} oldDeserializer=${typeof oldBinary.deserializeBinary}`);

  assertReadableSource(source);
  assertSafeOutput(out, source);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  backupExisting(out);
  removeFamily(out);
  if (manifestJsonl) fs.rmSync(manifestFile, { force: true });

  const clock = new Clock();
  const heartbeat = new Heartbeat({ enabled: progress, intervalMs: heartbeatMs, maxStepMs, logEvery, out });
  clock.lap('collect start');
  const { files, dirs } = collect(source, progress, heartbeat);
  const dirSet = new Set(dirs);
  const totalInputBytes = files.reduce((sum, item) => sum + item.size, 0);
  clock.lap(`collect done files=${files.length} dirs=${dirs.length} inputBytes=${formatBytes(totalInputBytes)}`);

  const childEntries = new Map();
  const manifestSamples = [];
  const errors = [];
  const stats = { files: 0, dirs: 0, bytes: 0, decoded: 0, json: 0, text: 0, blobs: 0 };

  const db = new AwtsmoosDB(out, dbOptions);
  db.open();

  try {
    db.root.__dosdb_migration_progress__ = {
      status: 'grouped-starting',
      source,
      out,
      rootKey: ROOT_KEY,
      files: files.length,
      dirs: dirs.length,
      inputBytes: totalInputBytes,
      dbOptions,
      updatedAt: new Date().toISOString()
    };
    db.waitForIdle({ closing: false });

    clock.lap('file value build start');
    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      const step = heartbeat.startStep('file', i + 1, files.length, item.rel, stats, { size: item.size });
      try {
        heartbeat.tick('file:read', i + 1, files.length, item.rel, stats, { size: item.size });
        const raw = fs.readFileSync(item.abs);
        const hash = sha256(raw);
        const storeId = dirSet.has(item.id) ? `${item.id}/__value` : item.id;

        heartbeat.tick('file:decode', i + 1, files.length, item.rel, stats, { size: raw.length });
        const imported = importValue(db, item, raw);

        heartbeat.tick('file:build', i + 1, files.length, item.rel, stats, { kind: imported.kind, size: raw.length });
        const valueSeal = db.builder.build(imported.value);

        heartbeat.tick('file:index', i + 1, files.length, item.rel, stats, { kind: imported.kind, size: raw.length });
        addPathEntry(childEntries, storeId, valueSeal);

        const entry = {
          rel: item.rel,
          id: item.id,
          storeId,
          kind: imported.kind,
          bytes: raw.length,
          sha256: hash,
          error: imported.error || null
        };

        if (manifestJsonl) fs.appendFileSync(manifestFile, JSON.stringify(entry) + '\n');
        if (verifySamples > 0 && shouldKeepSample(manifestSamples.length, i, files.length, verifySamples)) manifestSamples.push(entry);

        stats.files++;
        stats.bytes += raw.length;
        countKind(stats, imported.kind);
        heartbeat.endStep(step, 'file:done', i + 1, files.length, item.rel, stats, {
          kind: imported.kind,
          size: raw.length,
          dbSize: safeFileSize(out)
        });
      } catch (err) {
        heartbeat.failStep(step, 'file:error', i + 1, files.length, item.rel, stats, err);
        errors.push({ rel: item.rel, abs: item.abs, error: err && err.stack ? err.stack : String(err) });
      }
    }
    newlineAfterProgress(progress);
    clock.lap(`file value build done files=${stats.files} errors=${errors.length}`);

    clock.lap('directory bottom-up build start');
    const orderedDirs = dirs.slice().sort((a, b) => b.split('/').length - a.split('/').length || b.localeCompare(a));
    for (let i = 0; i < orderedDirs.length; i++) {
      const dir = orderedDirs[i];
      const entries = childEntries.get(dir) || [];
      const step = heartbeat.startStep('dir', i + 1, orderedDirs.length, dir, stats, { children: entries.length });
      const dictSeal = buildDictionary(db, entries);
      heartbeat.tick('dir:built', i + 1, orderedDirs.length, dir, stats, { children: entries.length });
      const parent = parentPath(dir);
      const name = baseName(dir);
      addDirectEntry(childEntries, parent, name, dictSeal);
      stats.dirs++;
      heartbeat.endStep(step, 'dir:done', i + 1, orderedDirs.length, dir, stats, {
        children: entries.length,
        dbSize: safeFileSize(out)
      });
    }
    newlineAfterProgress(progress);

    const rootEntries = childEntries.get('') || [];
    const rootStep = heartbeat.startStep('root', 1, 1, ROOT_KEY, stats, { children: rootEntries.length });
    const rootSeal = buildDictionary(db, rootEntries);
    db.root[constants.SYMBOLS.INTERNALS].writer.set(ROOT_KEY, rootSeal, {
      isPtr: true,
      skipFree: true,
      assumeNew: true,
      skipIndexes: true,
      skipOldState: true
    });
    heartbeat.endStep(rootStep, 'root:done', 1, 1, ROOT_KEY, stats, { children: rootEntries.length, dbSize: safeFileSize(out) });

    db.root.__dosdb_migration__ = {
      status: errors.length ? 'done-with-errors' : 'done',
      mode: 'grouped-bottom-up',
      source,
      out,
      rootKey: ROOT_KEY,
      files: stats.files,
      dirs: stats.dirs,
      bytes: stats.bytes,
      decoded: stats.decoded,
      json: stats.json,
      text: stats.text,
      blobs: stats.blobs,
      errors,
      manifestFile: manifestJsonl ? manifestFile : null,
      dbOptions,
      createdAt: new Date().toISOString()
    };
    db.root.__dosdb_migration_progress__ = {
      status: errors.length ? 'done-with-errors' : 'done',
      source,
      out,
      rootKey: ROOT_KEY,
      current: stats.files,
      total: files.length,
      bytes: stats.bytes,
      errors: errors.length,
      updatedAt: new Date().toISOString()
    };

    heartbeat.tick('db:flush', stats.files, files.length, 'waitForIdle', stats, { dbSize: safeFileSize(out) }, true);
    db.waitForIdle({ closing: false });
    clock.lap(`directory bottom-up build done dirs=${stats.dirs} rootChildren=${rootEntries.length}`);
  } finally {
    heartbeat.tick('db:close', stats.files, files.length, out, stats, { dbSize: safeFileSize(out) }, true);
    db.close();
  }

  if (verifySamples > 0 && manifestSamples.length > 0) verify(out, source, manifestSamples, dbOptions, heartbeat);
  log(`DONE grouped file=${out}`);
  log(`summary files=${stats.files}/${files.length} dirs=${stats.dirs}/${dirs.length} bytes=${formatBytes(stats.bytes)} decoded=${stats.decoded} json=${stats.json} text=${stats.text} blobs=${stats.blobs} errors=${errors.length}`);
  if (errors.length) process.exitCode = 2;
}

function buildDictionary(db, entries) {
  const engine = new DictionaryEngine(db.allocator);
  return engine.bulkLoadEntries(entries || []);
}

function addPathEntry(childEntries, storeId, valueSeal) {
  const parts = splitPath(storeId);
  const key = parts.pop() || '';
  const dir = parts.join('/');
  addDirectEntry(childEntries, dir, key, valueSeal);
}

function addDirectEntry(childEntries, dir, key, valueSeal) {
  const normalized = normalizePath(dir);
  const list = childEntries.get(normalized) || [];
  list.push({ key, value: valueSeal });
  childEntries.set(normalized, list);
}

function importValue(db, item, raw) {
  if (/\.awtsmoosJSON$/i.test(item.rel) && typeof oldBinary.deserializeBinary === 'function') {
    try {
      return { kind: 'awtsmoosJSON', value: oldBinary.deserializeBinary(raw) };
    } catch (err) {
      return { kind: 'awtsmoosJSON-decode-error-text', value: raw.toString('utf8'), error: err.message || String(err) };
    }
  }

  if (/\.json$/i.test(item.rel)) {
    try { return { kind: 'json', value: JSON.parse(raw.toString('utf8')) }; }
    catch (err) { return { kind: 'json-parse-error-text', value: raw.toString('utf8'), error: err.message || String(err) }; }
  }

  if (looksText(raw)) return { kind: 'text', value: raw.toString('utf8') };
  return { kind: 'blob', value: db.blob.create(raw, { rel: item.rel, sha256: sha256(raw), bytes: raw.length }) };
}

function verify(dbPath, source, samples, dbOptions, heartbeat) {
  log(`verify start samples=${samples.length}`);
  const db = new AwtsmoosDB(dbPath, { ...dbOptions, turboWrites: false });
  db.open();
  try {
    for (let i = 0; i < samples.length; i++) {
      const item = samples[i];
      heartbeat.tick('verify', i + 1, samples.length, item.storeId || item.id, { files: i + 1, dirs: 0, bytes: item.bytes || 0 }, {}, true);
      const value = db.DosDB.get(item.storeId || item.id, { rootKey: ROOT_KEY });
      if (value === undefined) throw new Error(`B"H verify missing: ${item.storeId || item.id}`);
      if (sha256(fs.readFileSync(path.join(source, item.rel))) !== item.sha256) throw new Error(`B"H source changed during migration: ${item.rel}`);
    }
  } finally {
    db.close();
  }
  newlineAfterProgress(heartbeat.enabled);
  log('verify done');
}

function collect(source, progress, heartbeat) {
  const files = [];
  const dirs = [];
  const stack = [source];
  let seenDirs = 0;

  while (stack.length) {
    const abs = stack.pop();
    seenDirs++;
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
        files.push({ abs: full, rel, id: stripDataExt(rel), size: st.size });
      }
    }
    if (heartbeat) heartbeat.tick('collect', seenDirs, 0, relPath(source, abs) || '.', { files: files.length, dirs: seenDirs, bytes: 0 });
    else if (progress && seenDirs % 500 === 0) writeSameLine(`B"H grouped collecting dirs=${seenDirs} files=${files.length}`);
  }

  newlineAfterProgress(progress);
  dirs.sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));
  files.sort((a, b) => a.rel.localeCompare(b.rel));
  return { files, dirs };
}

function shouldKeepSample(currentSamples, index, total, limit) {
  if (currentSamples >= limit) return false;
  if (limit >= total) return true;
  const step = Math.max(1, Math.floor(total / limit));
  return index % step === 0;
}

function countKind(stats, kind) {
  if (kind === 'blob') stats.blobs++;
  else {
    stats.decoded++;
    if (kind === 'json' || kind === 'awtsmoosJSON') stats.json++;
    else stats.text++;
  }
}

class Clock {
  constructor() { this.start = Date.now(); }
  elapsed() { return Date.now() - this.start; }
  lap(msg) { log(`${msg} (${this.elapsed()}ms)`); }
}

class Heartbeat {
  constructor({ enabled = true, intervalMs = 1000, maxStepMs = 0, logEvery = 1, out = '' } = {}) {
    this.enabled = enabled;
    this.intervalMs = intervalMs;
    this.maxStepMs = maxStepMs;
    this.logEvery = logEvery;
    this.out = out;
    this.last = 0;
    this.startedAt = Date.now();
  }

  startStep(phase, index, total, name, stats = {}, extra = {}) {
    const step = { phase, index, total, name, startedAt: Date.now() };
    this.tick(`${phase}:start`, index, total, name, stats, extra, true);
    return step;
  }

  endStep(step, phase, index, total, name, stats = {}, extra = {}) {
    const elapsed = Date.now() - step.startedAt;
    this.tick(phase, index, total, name, stats, { ...extra, stepMs: elapsed }, elapsed >= this.intervalMs || index % this.logEvery === 0 || index === total);
    if (this.maxStepMs > 0 && elapsed > this.maxStepMs) {
      throw new Error(`B"H: ${step.phase} step exceeded maxStepMs=${this.maxStepMs}; elapsed=${elapsed}ms; item=${name}`);
    }
  }

  failStep(step, phase, index, total, name, stats = {}, err) {
    const elapsed = Date.now() - step.startedAt;
    this.tick(phase, index, total, name, stats, { stepMs: elapsed, error: err && err.message ? err.message : String(err) }, true);
  }

  tick(phase, index, total, name, stats = {}, extra = {}, force = false) {
    if (!this.enabled) return;
    const now = Date.now();
    if (!force && now - this.last < this.intervalMs && index % this.logEvery !== 0) return;
    this.last = now;
    const pct = total ? `${((index / total) * 100).toFixed(1)}%` : '...';
    const elapsedSec = Math.max(0.001, (now - this.startedAt) / 1000);
    const rate = total ? `${(index / elapsedSec).toFixed(1)}/s` : '';
    const mem = process.memoryUsage();
    const parts = [
      `B"H ${phase}`,
      total ? `${index}/${total}` : `${index}`,
      pct,
      rate,
      `in=${formatBytes(stats.bytes || 0)}`,
      `files=${stats.files || 0}`,
      `dirs=${stats.dirs || 0}`,
      `rss=${formatBytes(mem.rss)}`,
      `heap=${formatBytes(mem.heapUsed)}`
    ];
    if (extra.kind) parts.push(`kind=${extra.kind}`);
    if (extra.size !== undefined) parts.push(`item=${formatBytes(extra.size)}`);
    if (extra.children !== undefined) parts.push(`children=${extra.children}`);
    if (extra.dbSize !== undefined) parts.push(`db=${formatBytes(extra.dbSize)}`);
    if (this.out && extra.dbSize === undefined) parts.push(`db=${formatBytes(safeFileSize(this.out))}`);
    if (extra.stepMs !== undefined) parts.push(`step=${extra.stepMs}ms`);
    if (extra.error) parts.push(`err=${safeOneLine(extra.error)}`);
    parts.push(trimMiddle(name, 72));
    writeSameLine(parts.filter(Boolean).join(' '));
  }
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    out[key] = next && !next.startsWith('--') ? argv[++i] : true;
  }
  return out;
}
function boolArg(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  return /^(1|true|yes|y)$/i.test(String(value));
}
function assertReadableSource(source) {
  if (!fs.existsSync(source)) throw new Error(`B"H: source missing: ${source}`);
  if (!fs.statSync(source).isDirectory()) throw new Error(`B"H: source must be a folder: ${source}`);
}
function assertSafeOutput(out, source) {
  const sourceLower = path.resolve(source).toLowerCase();
  const outLower = path.resolve(out).toLowerCase();
  if (outLower === sourceLower || outLower.startsWith(sourceLower + path.sep.toLowerCase())) throw new Error(`B"H: output must not be inside the source folder: ${out}`);
}
function backupExisting(file) {
  if (!FAMILY_SUFFIXES.some(suffix => fs.existsSync(`${file}${suffix}`))) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  for (const suffix of FAMILY_SUFFIXES) {
    const p = `${file}${suffix}`;
    if (fs.existsSync(p)) fs.renameSync(p, `${p}.bak-${stamp}`);
  }
}
function removeFamily(file) { for (const suffix of FAMILY_SUFFIXES) fs.rmSync(`${file}${suffix}`, { force: true, recursive: true }); }
function relPath(source, abs) { return path.relative(source, abs).split(path.sep).join('/'); }
function stripDataExt(rel) { return rel.replace(/\.(awtsmoosJSON|json)$/i, ''); }
function splitPath(filePath) { return normalizePath(filePath).split('/').filter(Boolean); }
function normalizePath(filePath) { return String(filePath || '').replace(/\\/g, '/').split('/').filter(Boolean).join('/'); }
function parentPath(filePath) { const parts = splitPath(filePath); parts.pop(); return parts.join('/'); }
function baseName(filePath) { const parts = splitPath(filePath); return parts.pop() || ''; }
function sha256(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
function looksText(raw) { return raw.length < 1024 * 1024 && !raw.includes(0); }
function safeFileSize(file) { try { return file && fs.existsSync(file) ? fs.statSync(file).size : 0; } catch (_err) { return 0; } }
function safeOneLine(value) { return String(value || '').replace(/\s+/g, ' ').slice(0, 180); }
function writeSameLine(text) { process.stdout.write(`\r${text}`); }
function newlineAfterProgress(enabled) { if (enabled) process.stdout.write('\n'); }
function trimMiddle(value, max) { const s = String(value || ''); if (s.length <= max) return s; const l = Math.floor((max - 3) / 2); return `${s.slice(0, l)}...${s.slice(-(max - l - 3))}`; }
function formatBytes(bytes) { const n = Number(bytes || 0); if (n < 1024) return `${n}B`; if (n < 1048576) return `${(n / 1024).toFixed(1)}KB`; if (n < 1073741824) return `${(n / 1048576).toFixed(1)}MB`; return `${(n / 1073741824).toFixed(2)}GB`; }
function log(msg) { console.log(`B"H [grouped-migrate ${new Date().toISOString()}] ${msg}`); }

main();
