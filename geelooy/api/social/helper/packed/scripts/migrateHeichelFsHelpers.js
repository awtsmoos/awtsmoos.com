//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file migrateHeichelFsHelpers.js
 * @description Shared helpers extracted verbatim from migrateHeichelToRealAwtsmoosDbFs.js.
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

module.exports = { CHUNK, arg, writeJson, acquireLock, walkFiles, streamFileIntoBlob, ensurePlainObject, setVirtualBlob, virtualPath };