#!/usr/bin/env node
// B"H
const { sample } = require('../telemetry/memory.js');
const { Timer } = require('../profiling/timer.js');
const { AwtaiFile } = require('../storage/awtai-file.js');
const { TensorIndex } = require('../runtime/tensor-index.js');
const { GgufTokenizer } = require('../tokenizer/gguf-tokenizer.js');
const { TensorStreamer } = require('../tensors/tensor-streamer.js');
const { readModelConfig } = require('../config/model-config.js');
const { projectTensor } = require('../kernels/matvec-stream.js');
const { runToken } = require('../decode/token-runner.js');
const { RunStats } = require('../stats/run-stats.js');
const { MemoryTrace } = require('../telemetry/memory.js');
const { KvCache } = require('../kv/kv-cache.js');
const { KvDiskCache } = require('../kv/kv-disk-cache.js');
const { makeScratchDir, removeDir } = require('../scratch/scratch-dir.js');

const model = process.argv[2];
if (!model) { console.error('Usage: probe-memory-timing model.awtai-db'); process.exit(1); }

const marks = [];
const timer = new Timer();
let file, streamer, scratch;

try {
  mark('start');
  file = timer.time('open-file', () => new AwtaiFile(model)); mark('after-open-file');
  const index = timer.time('index', () => new TensorIndex(file.manifest)); mark('after-index');
  const tok = timer.time('tokenizer', () => new GgufTokenizer(file.manifest.metadata)); mark('after-tokenizer');
  const config = readModelConfig(file.manifest); mark('after-config');
  const stats = new RunStats();
  streamer = new TensorStreamer(file, stats, { cacheBytes: 0 }); mark('after-streamer');
  const embed = index.role('embed');
  const oneRaw = timer.time('first-tensor-range', () => streamer.range(embed, 0, Math.min(256, embed.byteLength)));
  mark(`after-first-tensor-${oneRaw.length}`);
  const q = index.role('attn_q', 0);
  const input = new Float32Array(config.hidden);
  const proj = timer.time('first-project', () => projectTensor(streamer, q, input, null, 'probe-q'));
  mark(`after-first-project-${proj.length}`);
  scratch = makeScratchDir('awtai-probe');
  const trace = new MemoryTrace();
  const diskKv = new KvDiskCache(`${scratch}/kv`);
  const ctx = { file, index, tokenizer: tok, config, streamer, trace, stats, timer,
    kv: new KvCache(1, diskKv), diskKv, scratch, nativeAttention: null,
    generatedSoFar: [tok.bos], topK: 5, suppressTokenIds: [] };
  timer.time('one-token', () => runToken(ctx, tok.bos, 0, true)); mark('after-one-token');
  cleanup();
  if (global.gc) { global.gc(); mark('after-gc'); }
  console.log(JSON.stringify({ ok: true, model, marks, timing: timer.summary(120),
    stats: stats.summary(), externalCompilerInvoked: false }, null, 2));
} catch (error) {
  cleanup();
  console.error(JSON.stringify({ ok: false, error: String(error.stack || error), marks }, null, 2));
  process.exit(2);
}

function mark(label) { marks.push(sample(label)); }
function cleanup() {
  if (streamer) { streamer.dispose(); streamer = null; }
  if (file) { file.close(); file = null; }
  if (scratch) { removeDir(scratch); scratch = null; }
}
