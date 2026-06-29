#!/usr/bin/env node
// B"H

const path = require('path');
const { AwtaiFile } = require('../storage/awtai-file.js');
const { TensorIndex } = require('../runtime/tensor-index.js');
const { readModelConfig } = require('../config/model-config.js');
const { createRunCache, cleanupRunCache, readManifest } = require('../runtime/run-cache.js');
const { writeAllPacks } = require('../prepack/layer-pack-writer.js');
const { Timer } = require('../profiling/timer.js');

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.model) usage();
  const modelPath = path.resolve(args.model);
  const timer = new Timer();
  const file = new AwtaiFile(modelPath);
  const cache = createRunCache(modelPath, { dir: args.dir });
  try {
    const index = new TensorIndex(file.manifest);
    const config = readModelConfig(file.manifest);
    if (args.layers) config.layers = Math.min(config.layers, args.layers);
    const packs = timer.time('write-packs', () => writeAllPacks({ awtaiFile: file, index, config, cache }));
    const manifest = readManifest(cache);
    const summary = {
      ok: true,
      cache: cache.root,
      kept: args.keep,
      oneModelFormat: true,
      model: manifest.model,
      config: manifest.config,
      packCount: packs.length,
      packBytes: packs.reduce((sum, pack) => sum + pack.bytes, 0),
      timings: timer.summary(),
    };
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    file.close();
    if (!args.keep) cleanupRunCache(cache);
  }
}

function parseArgs(argv) {
  const out = { keep: false, model: '' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--keep') out.keep = true;
    else if (arg === '--dir') out.dir = argv[++i];
    else if (arg === '--layers') out.layers = Number(argv[++i]);
    else if (!out.model) out.model = arg;
    else throw new Error(`B'H unknown argument ${arg}`);
  }
  return out;
}

function usage() {
  console.error('B\"H usage: node bin/prepack-model-cache.js MODEL.awtai-db [--keep] [--dir DIR] [--layers N]');
  process.exit(1);
}

main();
