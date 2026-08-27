#!/usr/bin/env node
//B"H
/**
 * @file migrateHeichelToRealAwtsmoosDbFs.js
 * @description
 * Chapter 27: Every old file enters the ark as itself.
 *
 * This copies the physical heichel tree into one real AwtsmoosDB virtual
 * filesystem. Every file is copied as raw bytes into one blob token at the same
 * virtual path. No AwtsmoosJSON is parsed. No post/comment map is unpacked.
 * The old folder remains untouched.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const CHUNK = 1024 * 1024;

function arg(name, fallback = '') {
  const found = process.argv.find(item => item === `--${name}` || item.startsWith(`--${name}=`));
  if (!found) return fallback;
  return found.includes('=') ? found.split('=').slice(1).join('=') : 'yes';
}

async function writeJson(file, value) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  await fsp.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
}

function acquireLock(file) {
  const fd = fs.openSync(file, 'wx');
  fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, startedAt: Date.now() }, null, 2));
  return () => { try { fs.closeSync(fd); } catch {} try { fs.rmSync(file, { force: true }); } catch {} };
}

async function walkFiles(root) {
  const out = [];
  async function walk(dir) {
    for (const item of await fsp.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) await walk(full);
      else if (item.isFile()) {
        const stat = await fsp.stat(full);
        out.push({ full, rel: path.relative(root, full).replace(/\\/g, '/'), bytes: stat.size, mtimeMs: stat.mtimeMs });
      }
    }
  }
  await walk(root);
  return out.sort((a, b) => a.rel.localeCompare(b.rel));
}

async function streamFileIntoBlob(db, file) {
  let blob = db.blob.create(file.bytes, { name: path.basename(file.rel), rel: file.rel, originalPath: file.full, bytes: file.bytes, mtimeMs: file.mtimeMs, type: 'awtsmoosDB.fs.rawFile' });
  const fd = fs.openSync(file.full, 'r');
  const buffer = Buffer.allocUnsafe(CHUNK);
  let pos = 0;
  try {
    while (pos < file.bytes) {
      const read = fs.readSync(fd, buffer, 0, Math.min(CHUNK, file.bytes - pos), pos);
      if (!read) break;
      blob = db.blob.write(blob, pos, buffer.subarray(0, read));
      pos += read;
    }
  } finally { fs.closeSync(fd); }
  return blob;
}

function ensurePlainObject(parent, key) {
  const current = parent[key];
  if (!current || typeof current !== 'object' || current.__awtsmoosBlob === true) parent[key] = {};
  return parent[key];
}

function setVirtualBlob(db, vpath, blob) {
  const parts = String(vpath).replace(/\\/g, '/').split('/').filter(Boolean);
  const fileName = parts.pop();
  if (!db.root.__fs__) db.root.__fs__ = {};
  let cur = db.root.__fs__;
  for (const part of parts) cur = ensurePlainObject(cur, part);
  cur[fileName] = blob;
}

function virtualPath(heichelId, rel) {
  return `/social/heichelos/${heichelId}/${rel}`.replace(/\\/g, '/');
}

async function main() {
  const dbPath = path.resolve(process.cwd(), arg('db', '../../dayuhChadash'));
  const heichelId = arg('heichel', 'ikar');
  const heichelRoot = path.join(dbPath, 'social', 'heichelos', heichelId);
  const outFile = path.resolve(dbPath, 'socialPacked', arg('out', `social.heichel.${heichelId}.fs.awtsdb`));
  const reportPath = path.resolve(process.cwd(), arg('report', `.awtsmoos-tmp/${heichelId}-real-fs-migration-report.json`));
  await fsp.mkdir(path.dirname(outFile), { recursive: true });
  for (const suffix of ['', '.wal', '.lock']) if (fs.existsSync(outFile + suffix)) fs.rmSync(outFile + suffix, { force: true });
  const release = acquireLock(outFile + '.migration.lock');
  const db = new AwtsmoosDB(outFile, { compression: false, reuseFreedSpace: 'verified' });
  db.open();

  try {
    const files = await walkFiles(heichelRoot);
    const report = { B_H: true, engine: 'real-awtsmoosDB', mode: 'raw-files-as-native-db-fs-blobs', dbPath, heichelRoot, outFile, heichelId, filesDiscovered: files.length, filesCopied: 0, bytesCopied: 0, current: null, samples: [], startedAt: Date.now(), pid: process.pid };
    await writeJson(reportPath, report);
    for (const file of files) {
      report.current = { rel: file.rel, bytes: file.bytes };
      report.updatedAt = Date.now();
      await writeJson(reportPath, report);
      const blob = await streamFileIntoBlob(db, file);
      setVirtualBlob(db, virtualPath(heichelId, file.rel), blob);
      report.filesCopied++;
      report.bytesCopied += file.bytes;
      if (report.samples.length < 20) report.samples.push({ rel: file.rel, bytes: file.bytes });
      report.current = null;
      report.updatedAt = Date.now();
      await writeJson(reportPath, report);
    }
    await db.waitForIdle();
    report.finishedAt = Date.now();
    report.dbInfo = db.info();
    await writeJson(reportPath, report);
    console.log(JSON.stringify({ B_H: true, reportPath, outFile, filesCopied: report.filesCopied, bytesCopied: report.bytesCopied }, null, 2));
  } finally {
    db.close();
    release();
  }
}

main().catch(async error => {
  await writeJson(path.resolve(process.cwd(), '.awtsmoos-tmp/real-fs-migration-error.json'), { B_H: true, error: error.message, stack: error.stack, at: Date.now() }).catch(() => {});
  console.error(error);
  process.exit(1);
});
