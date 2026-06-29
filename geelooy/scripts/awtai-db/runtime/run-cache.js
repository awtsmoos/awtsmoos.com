// B"H

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

/**
 * One-format acceleration cache.
 *
 * The .awtai-db remains the only model covenant.  This cache is a temporary
 * breath around it: derived files, measured, disposable, never a second model.
 */
function createRunCache(modelPath, options = {}) {
  const root = options.dir || fs.mkdtempSync(path.join(os.tmpdir(), 'awtai-run-'));
  for (const name of ['layers', 'kv', 'scratch']) fs.mkdirSync(path.join(root, name), { recursive: true });
  const identity = modelIdentity(modelPath);
  const manifest = {
    BH: 'B\"H',
    kind: 'awtai-runtime-cache',
    version: 1,
    oneModelFormat: true,
    model: identity,
    createdAt: new Date().toISOString(),
    packs: [],
  };
  writeJson(path.join(root, 'manifest.json'), manifest);
  return { root, identity, manifestPath: path.join(root, 'manifest.json') };
}

function modelIdentity(modelPath) {
  const stat = fs.statSync(modelPath);
  const hash = crypto.createHash('sha256')
    .update(path.resolve(modelPath))
    .update(String(stat.size))
    .update(String(stat.mtimeMs))
    .digest('hex');
  return { path: path.resolve(modelPath), size: stat.size, mtimeMs: stat.mtimeMs, cacheKey: hash.slice(0, 24) };
}

function readManifest(cache) {
  return JSON.parse(fs.readFileSync(path.join(cache.root, 'manifest.json'), 'utf8'));
}

function updateManifest(cache, mutator) {
  const file = path.join(cache.root, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  mutator(manifest);
  writeJson(file, manifest);
  return manifest;
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function cleanupRunCache(cache) {
  if (cache && cache.root) fs.rmSync(cache.root, { recursive: true, force: true });
}

module.exports = { createRunCache, cleanupRunCache, readManifest, updateManifest };
