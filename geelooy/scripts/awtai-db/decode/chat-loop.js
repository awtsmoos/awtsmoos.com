// B"H
const { AwtaiFile } = require('../storage/awtai-file.js');
const { TensorIndex } = require('../runtime/tensor-index.js');
const { GgufTokenizer } = require('../tokenizer/gguf-tokenizer.js');
const { TensorStreamer } = require('../tensors/tensor-streamer.js');
const { readModelConfig } = require('../config/model-config.js');
const { MemoryTrace } = require('../telemetry/memory.js');
const { RunStats } = require('../stats/run-stats.js');
const { KvCache } = require('../kv/kv-cache.js');
const { KvDiskCache } = require('../kv/kv-disk-cache.js');
const { ChatState } = require('../state/chat-state.js');
const { runToken } = require('./token-runner.js');
const { makeScratchDir, removeDir } = require('../scratch/scratch-dir.js');
function runChat(model, prompt, options = {}) {
  const trace = new MemoryTrace();
  const stats = new RunStats();
  const scratch = options.scratchDir || makeScratchDir('awtai-run');
  trace.mark('start');
  const file = new AwtaiFile(model);
  try {
    const index = new TensorIndex(file.manifest);
    const tokenizer = new GgufTokenizer(file.manifest.metadata);
    const config = readModelConfig(file.manifest);
    const streamer = new TensorStreamer(file, stats);
    const diskKv = options.spillKvToDisk === false ? null : new KvDiskCache(options.kvDir || scratch + '/kv');
    const kv = new KvCache(options.maxRamKvTokens ?? 64, diskKv);
    const tokens = tokenizer.encode(prompt);
    const state = new ChatState(tokens.slice());
    const ctx = { file, index, tokenizer, config, streamer, trace, stats, kv, diskKv, scratch, generatedSoFar: tokens.slice() };
    trace.mark('after-init');
    const promptLimit = Math.min(tokens.length, options.promptTokens ?? tokens.length);
    for (let i = 0; i < Math.max(0, promptLimit - 1); i++) {
      runToken(ctx, tokens[i], i, false);
      trace.mark(`after-prefill-${i}`);
    }
    let current = tokens[Math.max(0, promptLimit - 1)] || tokenizer.bos;
    for (let g = 0; g < (options.maxNewTokens ?? 8); g++) {
      const next = runToken(ctx, current, promptLimit - 1 + g, true);
      state.append(next);
      ctx.generatedSoFar.push(next);
      current = next;
      trace.mark(`after-generate-${g}`);
      if (next === tokenizer.eos) break;
    }
    return { ok: true, mode: 'disk-first-js-full-kv-attention-experimental', scratch, promptTokens: tokens, generated: state.generated, text: tokenizer.decode(state.generated), config, kv: kv.summary(), diskKv: diskKv ? diskKv.summary() : null, stats: stats.summary(), memory: trace.summary() };
  } finally {
    file.close();
    if (options.deleteScratchOnClose) removeDir(scratch);
  }
}
module.exports = { runChat };
