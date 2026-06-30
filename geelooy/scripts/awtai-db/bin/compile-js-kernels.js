#!/usr/bin/env node
// B"H
const { AwtaiFile } = require('../storage/awtai-file.js');
const { TensorIndex } = require('../runtime/tensor-index.js');
const { TensorStreamer } = require('../tensors/tensor-streamer.js');
const { RunStats } = require('../stats/run-stats.js');
const { compileLmHeadKernel } = require('../compile/lm-head-compiler.js');

function main() {
  const model = process.argv[2];
  if (!model) return usage();
  const file = new AwtaiFile(model);
  try {
    const ctx = { file, index: new TensorIndex(file.manifest), stats: new RunStats() };
    ctx.streamer = new TensorStreamer(file, ctx.stats, { cacheBytes: 0 });
    const result = compileLmHeadKernel(ctx, ctx.index.role('lm_head'));
    ctx.streamer.dispose();
    console.log(JSON.stringify({ ok: true, file: result.file, plan: result.plan }, null, 2));
  } finally { file.close(); }
}
function usage(){ console.error('Usage: compile-js-kernels model.awtai-db'); process.exit(1); }
main();
