// B"H
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { AwtaiFile } = require('../storage/awtai-file.js');
const { readModelConfig } = require('../config/model-config.js');
const { rowsCols } = require('../tensors/tensor-shape.js');
const { repoRoot } = require('./cache-dir.js');

const VERSION = 'awtai-static-model-plan-v1';

function compileModelPlan(modelPath, options = {}) {
  const file = new AwtaiFile(modelPath);
  try {
    const stat = fs.statSync(modelPath);
    const config = readModelConfig(file.manifest);
    const tensors = file.manifest.tensors.map(t => tensorEntry(file, t));
    const plan = { version: VERSION, modelPath, modelSize: stat.size,
      cacheKey: keyFor(stat, file.manifest), config, tensors,
      roles: buildRoles(tensors), externalCompilerInvoked: false };
    const dir = options.dir || path.join(repoRoot(), 'runtime-cache', 'model-plans');
    fs.mkdirSync(dir, { recursive: true });
    const artifact = path.join(dir, `${plan.cacheKey}.json`);
    fs.writeFileSync(artifact, JSON.stringify(plan, null, 2));
    return { ok: true, artifact, bytes: fs.statSync(artifact).size, plan };
  } finally {
    file.close();
  }
}

function tensorEntry(file, t) {
  const shape = rowsCols(t);
  return { id: t.id, name: t.name, role: t.role || null, layer: t.layer ?? null,
    type: t.type, dims: t.dims, rows: shape.rows, cols: shape.cols,
    byteLength: t.byteLength, awtaiOffset: t.awtaiOffset, fileOffset: file.tensorOffset(t) };
}

function buildRoles(tensors) {
  const out = {};
  for (const t of tensors) {
    if (!t.role) continue;
    const key = t.layer === null ? t.role : `${t.role}:${t.layer}`;
    out[key] = t.id;
  }
  return out;
}

function keyFor(stat, manifest) {
  return crypto.createHash('sha256').update(JSON.stringify({
    version: VERSION, size: stat.size, mtimeMs: stat.mtimeMs,
    tensors: manifest.tensors.map(t => [t.name, t.type, t.dims, t.byteLength, t.awtaiOffset])
  })).digest('hex').slice(0, 24);
}

module.exports = { VERSION, compileModelPlan };
