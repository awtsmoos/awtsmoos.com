// B"H

/**
 * @file scripts/migrate_dayuh_chadash_full.js
 * @chapter The Faster Caravan Into One File
 * @description
 * Migrates the old filesystem DosDB/dayuhChadash tree into one AwtsmoosDB file.
 * Fast mode is now the default: fewer fsyncs, turbo write-behind disabled,
 * valueHash disabled unless requested, and DosDB parent handle caching enabled.
 *
 * Usage:
 *   node scripts/migrate_dayuh_chadash_full.js
 *   node scripts/migrate_dayuh_chadash_full.js --flushEvery 1000 --verifySamples 0
 *   node scripts/migrate_dayuh_chadash_full.js --fast false
 *   node scripts/migrate_dayuh_chadash_full.js --compression true --wal true --turboWrites true
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AwtsmoosDB = require('../index.js');
const oldBinary = require('../../awtsmoosBinaryJSON/index.js');

const DEFAULT_SOURCE = 'C:\\Users\\Yackov Yitzchak\\Documents\\WoW\\dayuhChadash';
const DEFAULT_OUT = 'C:\\Users\\Yackov Yitzchak\\Documents\\WoW\\dayuhChadash.awtsdb';
const ROOT_KEY = '__dosdb__';
const FAMILY_SUFFIXES = ['', '.wal', '.sparse.json', '.turbo.json', '.turbo.log', '.turbo.tree.json', '.lock', '.txn.json', '.manifest.jsonl'];
const FAST_DEFAULTS = {
  flushEvery: 1000,
  progressEvery: 250,
  verifySamples: 0,
  valueHash: false,
  compression: false,
  turboWrites: false,
  turboFlushMs: 1000,
  turboCompactMs: 10000,
  wal: false,
  precreateDirs: false,
  cacheParents: true,
  manifestInDb: false,
  manifestJsonl: true
};
const SAFE_DEFAULTS = {
  flushEvery: 1,
  progressEvery: 1,
  verifySamples: 25,
  valueHash: true,
  compression: true,
  turboWrites: false,
  turboFlushMs: 10,
  turboCompactMs: 100,
  wal: true,
  precreateDirs: false,
  cacheParents: true,
  manifestInDb: true,
  manifestJsonl: true
};

function main() {
  const args = parseArgs(process.argv.slice(2));
  const fast = boolArg(args.fast, true);
  const defaults = fast ? FAST_DEFAULTS : SAFE_DEFAULTS;
  const source = path.resolve(String(args.source || DEFAULT_SOURCE));
  const out = path.resolve(String(args.out || DEFAULT_OUT));
  const deadlineMs = Number(args.deadlineMs === undefined ? 0 : args.deadlineMs);
  const clock = new Clock(deadlineMs);
  const verifySamples = Math.max(0, Number(args.verifySamples === undefined ? defaults.verifySamples : args.verifySamples));
  const flushEvery = Math.max(1, Number(args.flushEvery === undefined ? defaults.flushEvery : args.flushEvery));
  const progressEvery = Math.max(1, Number(args.progressEvery === undefined ? defaults.progressEvery : args.progressEvery));
  const dryRun = boolArg(args.dryRun, false);
  const failFast = boolArg(args.failFast, false);
  const verbose = boolArg(args.verbose, false);
  const progress = boolArg(args.progress, true);
  const hashValues = boolArg(args.valueHash, defaults.valueHash);
  const precreateDirs = boolArg(args.precreateDirs, defaults.precreateDirs);
  const cacheParents = boolArg(args.cacheParents, defaults.cacheParents);
  const manifestInDb = boolArg(args.manifestInDb, defaults.manifestInDb);
  const manifestJsonl = boolArg(args.manifestJsonl, defaults.manifestJsonl);
  const manifestFile = `${out}.manifest.jsonl`;
  const dbOptions = {
    compression: boolArg(args.compression, defaults.compression),
    turboWrites: boolArg(args.turboWrites, defaults.turboWrites),
    turboFlushMs: Math.max(0, Number(args.turboFlushMs === undefined ? defaults.turboFlushMs : args.turboFlushMs)),
    turboCompactMs: Math.max(0, Number(args.turboCompactMs === undefined ? defaults.turboCompactMs : args.turboCompactMs)),
    wal: boolArg(args.wal, defaults.wal)
  };

  log(`BEGIN source=${source}`);
  log(`OUT ${out}`);
  log(`rootKey=${ROOT_KEY} fast=${fast} flushEvery=${flushEvery} progressEvery=${progressEvery} deadlineMs=${deadlineMs || 'disabled'} verifySamples=${verifySamples}`);
  log(`dryRun=${dryRun} verbose=${verbose} progress=${progress} valueHash=${hashValues} precreateDirs=${precreateDirs} cacheParents=${cacheParents} manifestInDb=${manifestInDb} manifestJsonl=${manifestJsonl}`);
  log(`dbOptions=${JSON.stringify(dbOptions)} oldDeserializer=${typeof oldBinary.deserializeBinary}`);

  assertReadableSource(source);
  assertSafeOutput(out, source);

  if (!dryRun) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    backupExisting(out);
    removeFamily(out);
    if (manifestJsonl) fs.rmSync(manifestFile, { force: true });
  }

  clock.lap('collect start');
  const { files, dirs } = collect(source, clock, verbose);
  const dirSet = new Set(dirs);
  const totalInputBytes = files.reduce((sum, item) => sum + item.size, 0);
  clock.lap(`collect done files=${files.length} dirs=${dirs.length} inputBytes=${formatBytes(totalInputBytes)}`);

  if (dryRun) {
    log('DRY RUN complete. No database was written.');
    return;
  }

  const manifest = [];
  const errors = [];
  const stats = { totalBytes: 0, decoded: 0, json: 0, text: 0, blobs: 0, migrated: 0, lastFlushAt: 0 };

  log('DB open start');
  const db = new AwtsmoosDB(out, dbOptions);
  db.open();
  log('DB open done');

  try {
    initializeMigrationMeta(db, source, out, files.length, dirs.length, totalInputBytes, flushEvery, progressEvery, dbOptions);
    flushDb(db, stats, 'initial migration metadata');

    if (precreateDirs && dirs.length) {
      log(`precreating directory markers dirs=${dirs.length}`);
      writeDirectoryMarkers(db, dirs, clock, verbose, cacheParents);
      flushDb(db, stats, 'directory precreate');
      log('directory marker precreate done');
    } else {
      log('starting file writes immediately; directory paths will be created lazily by db.DosDB.write');
    }

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      clock.check(`file ${i + 1}/${files.length} ${item.rel}`);

      try {
        const raw = fs.readFileSync(item.abs);
        const hash = sha256(raw);
        const storeId = dirSet.has(item.id) ? `${item.id}/__value` : item.id;
        const imported = importValue(db, item, raw, { hashValues });

        db.DosDB.write(storeId, imported.value, {
          rootKey: ROOT_KEY,
          cacheParents,
          assumeNew: true,
          skipFree: true,
          skipIndexes: true,
          skipOldState: true
        });

        stats.totalBytes += raw.length;
        countKind(stats, imported.kind);

        const manifestEntry = {
          rel: item.rel,
          id: item.id,
          storeId,
          kind: imported.kind,
          bytes: raw.length,
          sha256: hash,
          valueHash: imported.valueHash || null,
          error: imported.error || null
        };
        stats.migrated++;
        if (manifestJsonl) fs.appendFileSync(manifestFile, JSON.stringify(manifestEntry) + '\n');
        if (manifestInDb || verifySamples > 0) manifest.push(manifestEntry);

        if (shouldPersistProgress(i + 1, files.length, progressEvery, flushEvery)) {
          db.root.__dosdb_migration_progress__ = makeProgressSnapshot({
            status: 'running',
            source,
            out,
            total: files.length,
            current: i + 1,
            currentRel: item.rel,
            stats,
            errors
          });
        }

        if ((i + 1) % flushEvery === 0) flushDb(db, stats, `file ${i + 1}`);
        renderProgress({ i, files, item, imported, stats, errors, startedAt: clock.start, out, progress });
        if (verbose) log(`DONE ${i + 1}/${files.length} ${item.rel} kind=${imported.kind}`);
      } catch (err) {
        const entry = {
          rel: item.rel,
          abs: item.abs,
          bytes: item.size,
          error: err && err.stack ? err.stack : String(err)
        };
        errors.push(entry);
        db.root.__dosdb_migration_progress__ = {
          status: 'running-with-errors',
          source,
          out,
          rootKey: ROOT_KEY,
          current: i + 1,
          total: files.length,
          currentRel: item.rel,
          errors: errors.length,
          lastError: safeOneLine(entry.error),
          updatedAt: new Date().toISOString()
        };
        flushDb(db, stats, `error ${i + 1}`);
        newlineAfterProgress(progress);
        log(`ERROR ${i + 1}/${files.length} ${item.rel}: ${safeOneLine(entry.error)}`);
        if (failFast) throw err;
      }
    }

    newlineAfterProgress(progress);
    log('manifest write start');
    db.root.__dosdb_migration__ = {
      status: errors.length ? 'done-with-errors' : 'done',
      source,
      rootKey: ROOT_KEY,
      files: stats.migrated,
      dirs: dirs.length,
      bytes: stats.totalBytes,
      decoded: stats.decoded,
      json: stats.json,
      text: stats.text,
      blobs: stats.blobs,
      errors,
      dbOptions,
      manifestFile: manifestJsonl ? manifestFile : null,
      manifestInDb,
      createdAt: new Date().toISOString(),
      manifest: manifestInDb ? manifest : []
    };
    db.root.__dosdb_migration_progress__ = {
      status: errors.length ? 'done-with-errors' : 'done',
      source,
      out,
      rootKey: ROOT_KEY,
      current: stats.migrated,
      total: files.length,
      bytes: stats.totalBytes,
      errors: errors.length,
      updatedAt: new Date().toISOString()
    };
    flushDb(db, stats, 'final manifest');
    log('manifest write done');
  } finally {
    newlineAfterProgress(progress);
    log('DB close start');
    db.close();
    log('DB close done');
  }

  if (verifySamples > 0 && manifest.length > 0) verify(out, source, manifest, verifySamples, clock, progress, dbOptions);

  log(`DONE file=${out}`);
  log(`summary files=${stats.migrated}/${files.length} dirs=${dirs.length} bytes=${formatBytes(stats.totalBytes)} decoded=${stats.decoded} json=${stats.json} text=${stats.text} blobs=${stats.blobs} errors=${errors.length}`);
  if (errors.length) process.exitCode = 2;
}

function initializeMigrationMeta(db, source, out, fileCount, dirCount, inputBytes, flushEvery, progressEvery, dbOptions) {
  db.root.__dosdb_migration_progress__ = {
    status: 'starting',
    source,
    out,
    rootKey: ROOT_KEY,
    total: fileCount,
    dirs: dirCount,
    inputBytes,
    flushEvery,
    progressEvery,
    dbOptions,
    updatedAt: new Date().toISOString()
  };
}

function writeDirectoryMarkers(db, dirs, clock, verbose, cacheParents) {
  for (let i = 0; i < dirs.length; i++) {
    clock.check(`dir ${i + 1}/${dirs.length}`);
    db.DosDB.write(dirs[i], {}, {
      rootKey: ROOT_KEY,
      cacheParents,
      assumeNew: true,
      skipFree: true,
      skipIndexes: true,
      skipOldState: true
    });
    if (verbose) log(`DIR ${i + 1}/${dirs.length} ${dirs[i]}`);
    else if ((i + 1) % 500 === 0) writeSameLine(`B"H precreating dirs ${i + 1}/${dirs.length}`);
  }
  newlineAfterProgress(!verbose);
}

function importValue(db, item, raw, options = {}) {
  const hashValues = options.hashValues !== false;
  const maybeValueHash = (value) => hashValues ? valueHash(value) : null;

  if (/\.awtsmoosJSON$/i.test(item.rel) && typeof oldBinary.deserializeBinary === 'function') {
    try {
      const value = oldBinary.deserializeBinary(raw);
      return { kind: 'awtsmoosJSON', value, valueHash: maybeValueHash(value) };
    } catch (err) {
      const fallback = raw.toString('utf8');
      return {
        kind: 'awtsmoosJSON-decode-error-text',
        value: fallback,
        valueHash: maybeValueHash(fallback),
        error: err && err.message ? err.message : String(err)
      };
    }
  }

  if (/\.json$/i.test(item.rel)) {
    try {
      const value = JSON.parse(raw.toString('utf8'));
      return { kind: 'json', value, valueHash: maybeValueHash(value) };
    } catch (err) {
      const value = raw.toString('utf8');
      return { kind: 'json-parse-error-text', value, valueHash: maybeValueHash(value), error: err.message };
    }
  }

  if (looksText(raw)) {
    const value = raw.toString('utf8');
    return { kind: 'text', value, valueHash: maybeValueHash(value) };
  }

  return { kind: 'blob', value: db.blob.create(raw, { rel: item.rel, sha256: sha256(raw), bytes: raw.length }) };
}

function verify(dbPath, source, manifest, limit, clock, progress, dbOptions) {
  newlineAfterProgress(progress);
  clock.lap(`verify start requestedSamples=${limit}`);
  const db = new AwtsmoosDB(dbPath, { ...dbOptions, turboWrites: false });
  db.open();
  try {
    const step = Math.max(1, Math.floor(manifest.length / limit));
    let checked = 0;
    for (let i = 0; i < manifest.length && checked < limit; i += step) {
      clock.check(`verify ${checked + 1}/${limit}`);
      const item = manifest[i];
      const value = db.DosDB.get(item.storeId || item.id, { rootKey: ROOT_KEY });
      if (item.kind === 'blob') {
        const bytes = db.blob.read(value, 0, item.bytes);
        if (sha256(bytes) !== item.sha256) throw new Error(`B"H blob verify failed: ${item.rel}`);
      } else if (item.valueHash && valueHash(plain(value)) !== item.valueHash) {
        throw new Error(`B"H value verify failed: ${item.rel}`);
      }
      if (sha256(fs.readFileSync(path.join(source, item.rel))) !== item.sha256) throw new Error(`B"H source changed during migration: ${item.rel}`);
      checked++;
      writeSameLine(`B"H verify ${checked}/${Math.min(limit, manifest.length)} ${trimMiddle(item.rel, 70)}`);
    }
    newlineAfterProgress(true);
    clock.lap(`verify done checked=${checked}`);
  } finally {
    db.close();
  }
}

function collect(source, clock, verbose) {
  const files = [];
  const dirs = [];
  const stack = [source];
  let seenDirs = 0;

  while (stack.length) {
    clock.check('collect');
    const abs = stack.pop();
    const relDir = relPath(source, abs) || '.';
    seenDirs++;
    if (verbose) log(`COLLECT-DIR ${seenDirs} ${relDir}`);

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

    if (!verbose && seenDirs % 100 === 0) writeSameLine(`B"H collecting dirs=${seenDirs} files=${files.length}`);
  }

  newlineAfterProgress(!verbose);
  dirs.sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));
  files.sort((a, b) => a.rel.localeCompare(b.rel));
  return { files, dirs };
}

function shouldPersistProgress(current, total, progressEvery, flushEvery) {
  return current === 1 || current === total || current % progressEvery === 0 || current % flushEvery === 0;
}

function makeProgressSnapshot({ status, source, out, total, current, currentRel, stats, errors }) {
  return {
    status,
    source,
    out,
    rootKey: ROOT_KEY,
    current,
    total,
    percent: total ? Number(((current / total) * 100).toFixed(2)) : 100,
    currentRel,
    bytes: stats.totalBytes,
    decoded: stats.decoded,
    json: stats.json,
    text: stats.text,
    blobs: stats.blobs,
    errors: errors.length,
    updatedAt: new Date().toISOString()
  };
}

function renderProgress({ i, files, item, imported, stats, errors, startedAt, out, progress }) {
  if (!progress) return;
  const done = i + 1;
  const total = files.length;
  const percent = total ? (done / total) * 100 : 100;
  const elapsed = Math.max(1, Date.now() - startedAt);
  const rate = done / (elapsed / 1000);
  const etaSec = rate > 0 ? Math.max(0, Math.round((total - done) / rate)) : 0;
  const line = `B"H ${progressBar(percent, 26)} ${done}/${total} ${percent.toFixed(1)}% kind=${imported.kind} db=${formatBytes(safeFileSize(out))} in=${formatBytes(stats.totalBytes)} err=${errors.length} eta=${formatDuration(etaSec)} ${trimMiddle(item.rel, 58)}`;
  writeSameLine(line);
}

function flushDb(db, stats, reason) {
  db.waitForIdle({ closing: false });
  stats.lastFlushAt = Date.now();
  const size = safeFileSize(db.pager && db.pager.filePath ? db.pager.filePath : '');
  if (reason === 'final manifest' || /error|directory/i.test(reason)) log(`FLUSH ${reason} dbSize=${formatBytes(size)}`);
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
  constructor(deadlineMs) {
    this.start = Date.now();
    this.deadlineMs = Number(deadlineMs || 0);
  }
  elapsed() { return Date.now() - this.start; }
  check(phase) {
    if (this.deadlineMs > 0 && this.elapsed() > this.deadlineMs) throw new Error(`B"H: migration deadline exceeded after ${this.elapsed()}ms at ${phase}`);
  }
  lap(msg) { log(`${msg} (${this.elapsed()}ms)`); }
}

function assertReadableSource(source) {
  if (!fs.existsSync(source)) throw new Error(`B"H: source missing: ${source}`);
  const st = fs.statSync(source);
  if (!st.isDirectory()) throw new Error(`B"H: source must be a folder: ${source}`);
}
function assertSafeOutput(out, source) {
  const sourceLower = path.resolve(source).toLowerCase();
  const outLower = path.resolve(out).toLowerCase();
  if (outLower === sourceLower || outLower.startsWith(sourceLower + path.sep.toLowerCase())) throw new Error(`B"H: output must not be inside the source folder: ${out}`);
}
function relPath(source, abs) { return path.relative(source, abs).split(path.sep).join('/'); }
function stripDataExt(rel) { return rel.replace(/\.(awtsmoosJSON|json)$/i, ''); }
function sha256(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
function valueHash(value) { return sha256(Buffer.from(stable(value), 'utf8')); }
function stable(value) {
  value = plain(value);
  if (value === undefined) return '"__undefined__"';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Buffer.isBuffer(value)) return JSON.stringify({ __buffer: value.toString('base64') });
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
}
function plain(value) { return value && typeof value.__resolve__ === 'function' ? value.__resolve__() : value; }
function looksText(raw) { return raw.length < 1024 * 1024 && !raw.includes(0); }
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
function backupExisting(file) {
  if (!FAMILY_SUFFIXES.some(suffix => fs.existsSync(`${file}${suffix}`))) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  for (const suffix of FAMILY_SUFFIXES) {
    const p = `${file}${suffix}`;
    if (fs.existsSync(p)) {
      const backup = `${p}.bak-${stamp}`;
      log(`BACKUP ${p} -> ${backup}`);
      fs.renameSync(p, backup);
    }
  }
}
function removeFamily(file) {
  for (const suffix of FAMILY_SUFFIXES) {
    const p = `${file}${suffix}`;
    if (fs.existsSync(p)) log(`REMOVE ${p}`);
    fs.rmSync(p, { force: true, recursive: true });
  }
}
function progressBar(percent, width) {
  const filled = Math.max(0, Math.min(width, Math.round((percent / 100) * width)));
  return `[${'#'.repeat(filled)}${'-'.repeat(width - filled)}]`;
}
function writeSameLine(text) {
  if (process.stdout && process.stdout.isTTY) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(text);
  } else process.stdout.write(`\r${text}`);
}
function newlineAfterProgress(enabled) { if (enabled) process.stdout.write('\n'); }
function safeFileSize(file) { try { return file && fs.existsSync(file) ? fs.statSync(file).size : 0; } catch (_err) { return 0; } }
function safeOneLine(value) { return String(value).replace(/\s+/g, ' ').slice(0, 800); }
function trimMiddle(value, max) {
  const s = String(value || '');
  if (s.length <= max) return s;
  const left = Math.max(8, Math.floor((max - 3) / 2));
  const right = Math.max(8, max - left - 3);
  return `${s.slice(0, left)}...${s.slice(-right)}`;
}
function formatBytes(bytes) {
  const n = Number(bytes || 0);
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)}MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)}GB`;
}
function formatDuration(sec) {
  if (!Number.isFinite(sec) || sec <= 0) return '0s';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return `${h}h${String(m).padStart(2, '0')}m`;
  if (m) return `${m}m${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}
function log(msg) { console.log(`B"H [migrate ${new Date().toISOString()}] ${msg}`); }

main();
