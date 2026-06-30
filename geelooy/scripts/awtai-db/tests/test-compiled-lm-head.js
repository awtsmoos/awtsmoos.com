// B"H
process.env.AWTAI_COMPILED_LM_HEAD = '1';
const assert = require('assert');
const { AwtaiFile } = require('../storage/awtai-file.js');
const { TensorIndex } = require('../runtime/tensor-index.js');
const { TensorStreamer } = require('../tensors/tensor-streamer.js');
const { RunStats } = require('../stats/run-stats.js');
const { buildLmHeadSource } = require('../compile/lm-head-source.js');
const { compiledQuantTopK } = require('../lm-head/compiled-topk.js');
const { directQuantTopKFallback } = require('../lm-head/direct-quant-topk.js');

assert(buildLmHeadSource({ key:'x', rows:8, cols:256, stride:210, f16Path:require.resolve('../math/f16.js') }).includes('function dotQ6'));
const model = process.argv[2];
if (!model) return console.log(JSON.stringify({ ok: true, test: 'compiled-source-validity', modelParity: 'skipped' }));
const file = new AwtaiFile(model);
try {
  const ctx = { file, index: new TensorIndex(file.manifest), stats: new RunStats(), directTopKMaxRows: 64, compiledTopKMaxRows: 64 };
  ctx.streamer = new TensorStreamer(file, ctx.stats, { cacheBytes: 0 });
  const tensor = ctx.index.role('lm_head');
  const input = new Float32Array(tensor.dims[0]);
  for (let i = 0; i < input.length; i++) input[i] = Math.sin(i * 0.013) * 0.5;
  const direct = directQuantTopKFallback(ctx, tensor, input, 8);
  const compiled = compiledQuantTopK(ctx, tensor, input, 8);
  assert(compiled, 'compiled top-k should run when AWTAI_COMPILED_LM_HEAD=1');
  assert.deepStrictEqual(compiled.map(x => x.id), direct.map(x => x.id));
  for (let i = 0; i < direct.length; i++) assert(Math.abs(compiled[i].logit - direct[i].logit) < 1e-6);
  ctx.streamer.dispose();
  console.log(JSON.stringify({ ok: true, test: 'compiled-lm-head-parity', rows: 64, top: compiled.slice(0, 3) }));
} finally { file.close(); }
