#!/usr/bin/env node
//B"H
/**
 * @file migrateHeichelFamiliesToRealAwtsmoosDbFs.js
 * @description
 * Chapter 39: The forest is carved once, then sealed into three arks.
 *
 * This migrates `dayuhChadash/social/heichelos/:heichel` into family-separated
 * real AwtsmoosDB filesystem files:
 * - comments: everything under `/comments`
 * - posts: every `series/:series/posts.awtsmoosJSON`
 * - series: all other files under `/series`
 *
 * Every file is copied as raw bytes into a native AwtsmoosDB blob. A plain
 * virtual filesystem tree is built in memory per family and assigned once to
 * `db.root.__fs__`, avoiding repeated deep live-handle mutations. No
 * AwtsmoosJSON is parsed. No map is exploded.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const CHUNK = 1024 * 1024;
const FAMILIES = ['comments', 'posts', 'series'];

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
  fs.writeFileSync(fd, JSON.stringify({ B_H: true, pid: process.pid, startedAt: Date.now(), file }, null, 2));
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

function familyFor(rel) {
  if (rel.startsWith('comments/')) return 'comments';
  if (/^series\/[^/]+\/posts\.awtsmoosJSON$/i.test(rel)) return 'posts';
  if (rel.startsWith('series/')) return 'series';
  return 'series';
}

function outFileFor({ packedDir, heichelId, family }) {
  return path.join(packedDir, `social.heichel.${heichelId}.${family}.fs.awtsdb`);
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

function virtualPath(heichelId, rel) {
  return `/social/heichelos/${heichelId}/${rel}`.replace(/\\/g, '/');
}

function setTreeBlob(tree, vpath, blob) {
  const parts = String(vpath).split('/').filter(Boolean);
  const name = parts.pop();
  let cur = tree;
  for (const part of parts) {
    if (!cur[part] || cur[part].__awtsmoosBlob === true) cur[part] = {};
    cur = cur[part];
  }
  cur[name] = blob;
}

function openDbs({ packedDir, heichelId }) {
  const dbs = {};
  for (const family of FAMILIES) {
    const outFile = outFileFor({ packedDir, heichelId, family });
    for (const suffix of ['', '.wal', '.lock']) if (fs.existsSync(outFile + suffix)) fs.rmSync(outFile + suffix, { force: true });
    const db = new AwtsmoosDB(outFile, { compression: false, reuseFreedSpace: 'verified' });
    db.open();
    dbs[family] = { db, outFile, tree: {} };
  }
  return dbs;
}

async function sealDbs(dbs) {
  for (const family of Object.keys(dbs)) {
    dbs[family].db.root.__fs__ = dbs[family].tree;
    await dbs[family].db.waitForIdle();
    dbs[family].info = dbs[family].db.info();
    dbs[family].db.close();
  }
}

async function main() {
  const dbPath = path.resolve(process.cwd(), arg('db', '../../dayuhChadash'));
  const heichelId = arg('heichel', 'ikar');
  const heichelRoot = path.join(dbPath, 'social', 'heichelos', heichelId);
  const packedDir = path.join(dbPath, 'socialPacked');
  const reportPath = path.resolve(process.cwd(), arg('report', `.awtsmoos-tmp/${heichelId}-family-fs-migration-report.json`));
  const lockPath = path.resolve(process.cwd(), `.awtsmoos-tmp/${heichelId}-family-fs-migration.lock`);
  await fsp.mkdir(packedDir, { recursive: true });
  const release = acquireLock(lockPath);
  const report = { B_H: true, engine: 'real-awtsmoosDB', mode: 'family-separated-tree-sealed-native-blobs', heichelId, dbPath, heichelRoot, packedDir, families: {}, filesDiscovered: 0, filesCopied: 0, bytesCopied: 0, current: null, startedAt: Date.now(), pid: process.pid };
  for (const family of FAMILIES) report.families[family] = { filesCopied: 0, bytesCopied: 0, outFile: outFileFor({ packedDir, heichelId, family }) };
  await writeJson(reportPath, report);
  let dbs;
  try {
    const files = await walkFiles(heichelRoot);
    report.filesDiscovered = files.length;
    await writeJson(reportPath, report);
    dbs = openDbs({ packedDir, heichelId });
    for (const file of files) {
      const family = familyFor(file.rel);
      report.current = { rel: file.rel, bytes: file.bytes, family };
      report.updatedAt = Date.now();
      await writeJson(reportPath, report);
      const blob = await streamFileIntoBlob(dbs[family].db, file);
      setTreeBlob(dbs[family].tree, virtualPath(heichelId, file.rel), blob);
      report.filesCopied++;
      report.bytesCopied += file.bytes;
      report.families[family].filesCopied++;
      report.families[family].bytesCopied += file.bytes;
      report.current = null;
      report.updatedAt = Date.now();
      await writeJson(reportPath, report);
    }
    await sealDbs(dbs);
    for (const family of FAMILIES) report.families[family].dbInfo = dbs[family].info;
    report.finishedAt = Date.now();
    await writeJson(reportPath, report);
    console.log(JSON.stringify({ B_H: true, reportPath, filesCopied: report.filesCopied, bytesCopied: report.bytesCopied, families: report.families }, null, 2));
  } finally {
    if (dbs) for (const family of Object.keys(dbs)) try { dbs[family].db.close(); } catch {}
    release();
  }
}

main().catch(async error => {
  await writeJson(path.resolve(process.cwd(), '.awtsmoos-tmp/family-fs-migration-error.json'), { B_H: true, error: error.message, stack: error.stack, at: Date.now() }).catch(() => {});
  console.error(error);
  process.exit(1);
});
