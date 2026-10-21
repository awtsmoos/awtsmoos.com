//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file migrateHeichelFamiliesFsHelpers.js
 * @description Shared filesystem/DB helpers extracted verbatim from migrateHeichelFamiliesToRealAwtsmoosDbFs.js.
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

module.exports = { FAMILIES, arg, writeJson, acquireLock, walkFiles, familyFor, outFileFor, streamFileIntoBlob, virtualPath, setTreeBlob, openDbs, sealDbs };