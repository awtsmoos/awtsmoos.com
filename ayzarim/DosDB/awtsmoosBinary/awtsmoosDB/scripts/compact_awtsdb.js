#!/usr/bin/env node
// B"H
/**
 * @file compact_awtsdb.js
 * @chapter The Careful Reclaimer Walks With Backups
 * @description
 * Safe AwtsmoosDB compaction runner. It never mutates a database before copying
 * a timestamped backup beside it. Each vessel is opened, verified when possible,
 * reclaimed through the existing gc() compaction engine, closed, reopened, and
 * verified again. The file format remains unchanged; only unreachable chambers
 * are returned to the free-list and tail silence.
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function usage() {
  return [
    'B"H AwtsmoosDB compaction runner',
    'Usage:',
    '  node scripts/compact_awtsdb.js <db-file> [more-db-files...]',
    '  AWTSMOOS_DB_PATHS="a.awtsdb:b.awtsdb" node scripts/compact_awtsdb.js',
    '',
    'Every database is copied to <db>.before-gc-<timestamp>.bak before mutation.'
  ].join('\n');
}

function args() {
  const fromArgv = process.argv.slice(2);
  const fromEnv = (process.env.AWTSMOOS_DB_PATHS || '')
    .split(path.delimiter)
    .map(x => x.trim())
    .filter(Boolean);
  return [...fromArgv, ...fromEnv];
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function statSize(file) {
  return fs.existsSync(file) ? fs.statSync(file).size : 0;
}

function openDb(file) {
  const db = new AwtsmoosDB(file, {
    compression: false,
    reuseFreedSpace: 'verified',
    wal: true,
    maxCachedPages: 256
  });
  db.open();
  return db;
}

function safeVerify(db) {
  if (typeof db.verify !== 'function') return { available: false };
  try {
    return { available: true, ok: true, report: db.verify() };
  } catch (err) {
    return { available: true, ok: false, error: err && err.stack || String(err) };
  }
}

function compactOne(input) {
  const file = path.resolve(input);
  if (!fs.existsSync(file)) throw new Error(`B"H database not found: ${file}`);
  if (!fs.statSync(file).isFile()) throw new Error(`B"H not a file: ${file}`);

  const backup = `${file}.before-gc-${stamp()}.bak`;
  fs.copyFileSync(file, backup, fs.constants.COPYFILE_EXCL);

  const before = { physicalBytes: statSize(file) };
  let db = openDb(file);
  try {
    before.storageStats = typeof db.storageStats === 'function' ? db.storageStats() : null;
    before.verify = safeVerify(db);
    if (before.verify.available && before.verify.ok === false) {
      throw new Error(`B"H pre-GC verification failed for ${file}: ${before.verify.error}`);
    }
    if (typeof db.gc !== 'function') throw new Error('B"H db.gc() is not available');
    before.gc = db.gc();
  } finally {
    db.close();
  }

  const after = { physicalBytes: statSize(file) };
  db = openDb(file);
  try {
    after.storageStats = typeof db.storageStats === 'function' ? db.storageStats() : null;
    after.verify = safeVerify(db);
    if (after.verify.available && after.verify.ok === false) {
      throw new Error(`B"H post-GC verification failed for ${file}: ${after.verify.error}`);
    }
  } finally {
    db.close();
  }

  return { file, backup, before, after };
}

function main() {
  const files = args();
  if (files.length === 0) {
    console.log(usage());
    return;
  }

  const results = [];
  for (const file of files) results.push(compactOne(file));
  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(JSON.stringify({ ok: false, error: err && err.stack || String(err) }, null, 2));
  process.exit(1);
}
