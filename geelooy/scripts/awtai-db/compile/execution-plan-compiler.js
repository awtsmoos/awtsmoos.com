// B"H
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { AwtaiFile } = require('../storage/awtai-file.js');
const { readModelConfig } = require('../config/model-config.js');
const { rowsCols } = require('../tensors/tensor-shape.js');
const { repoRoot } = require('./cache-dir.js');

const VERSION = 'awtai-lowrss-execution-plan-v1';

function compileExecutionPlan(modelPath, options = {}) {
  const file = new AwtaiFile(modelPath);
  try {
    const stat = fs.statSync(modelPath);
    const config = readModelConfig(file.manifest);
    const tensors = file.manifest.tensors.map(tensor => entry(file, tensor));
    const plan = buildPlan({ modelPath, stat, config, tensors, manifest: file.manifest });
    const dir = options.dir || path.join(repoRoot(), 'runtime-cache', 'execution-plans');
    fs.mkdirSync(dir, { recursive: true });
    const artifact = path.join(dir, `${plan.cacheKey}.json`);
    fs.writeFileSync(artifact, JSON.stringify(plan, null, 2));
    return { ok: true, artifact, bytes: fs.statSync(artifact).size, plan };
  } finally {
    file.close();
  }
}

function buildPlan({ modelPath, stat, config, tensors, manifest }) {
  const cacheKey = keyFor(stat, manifest);
  const plan = { version: VERSION, cacheKey, modelPath, modelSize: stat.size,
    config, globals: globals(tensors), layers: layers(tensors, config.layers),
    budgets: budgets(tensors, config), audit: audit() };
  plan.summary = summary(plan);
  return plan;
}

function entry(file, tensor) {
  const shape = rowsCols(tensor);
  return { id: tensor.id, name: tensor.name, role: tensor.role || null,
    layer: tensor.layer ?? null, type: tensor.type, dims: tensor.dims,
    rows: shape.rows, cols: shape.cols, byteLength: tensor.byteLength,
    awtaiOffset: tensor.awtaiOffset, fileOffset: file.tensorOffset(tensor) };
}

function globals(tensors) {
  return { embed: find(tensors, 'embed'), outputNorm: byName(tensors, 'output_norm.weight'),
    lmHead: find(tensors, 'lm_head') };
}

function layers(tensors, count) {
  const out = [];
  for (let layer = 0; layer < count; layer++) out.push(layerPlan(tensors, layer));
  return out;
}

function layerPlan(tensors, layer) {
  return { layer, attnNorm: byName(tensors, `blk.${layer}.attn_norm.weight`),
    q: find(tensors, 'attn_q', layer), k: find(tensors, 'attn_k', layer),
    v: find(tensors, 'attn_v', layer), o: find(tensors, 'attn_out', layer),
    ffnNorm: byName(tensors, `blk.${layer}.ffn_norm.weight`),
    gate: find(tensors, 'ffn_gate', layer), up: find(tensors, 'ffn_up', layer),
    down: find(tensors, 'ffn_down', layer) };
}

function budgets(tensors, config) {
  const totalBytes = tensors.reduce((sum, tensor) => sum + tensor.byteLength, 0);
  return { tensorBytes: totalBytes, hiddenBytes: config.hidden * 4,
    ffnBytes: config.ffn * 4, logitsBytes: config.vocab * 4,
    lowRssTargetBytes: 100 * 1024 * 1024, tokenTargetMs: 50 };
}

function audit() {
  return { compiler: 'repo-owned-js-node-builtins', externalCompilerInvoked: false,
    externalAssemblerInvoked: false, npmInstallInvoked: false, downloadsInvoked: false,
    artifactKind: 'static-execution-plan-json' };
}

function summary(plan) {
  return { layers: plan.layers.length, tensorsResolved: countResolved(plan),
    missing: missing(plan), compilerVersion: VERSION };
}

function countResolved(plan) {
  return JSON.stringify(plan).split('"id":').length - 1;
}

function missing(plan) {
  const misses = [];
  for (const [name, tensor] of Object.entries(plan.globals)) if (!tensor) misses.push(`global:${name}`);
  for (const layer of plan.layers) for (const [name, tensor] of Object.entries(layer)) {
    if (name !== 'layer' && !tensor) misses.push(`layer:${layer.layer}:${name}`);
  }
  return misses;
}

function find(tensors, role, layer = null) {
  return tensors.find(t => t.role === role && (layer === null || t.layer === layer)) || null;
}

function byName(tensors, name) {
  return tensors.find(t => t.name === name) || null;
}

function keyFor(stat, manifest) {
  return crypto.createHash('sha256').update(JSON.stringify({ version: VERSION,
    size: stat.size, mtimeMs: stat.mtimeMs,
    tensors: manifest.tensors.map(t => [t.name, t.type, t.dims, t.byteLength, t.awtaiOffset])
  })).digest('hex').slice(0, 24);
}

module.exports = { VERSION, compileExecutionPlan };
