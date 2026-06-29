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
const { renderPrompt } = require('./prompt-template.js');
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
    const renderedPrompt = renderPrompt(file.manifest.metadata, prompt, options);
    const tokens = tokenizer.encode(renderedPrompt, options.addBos !== false);
    const state = new ChatState(tokens.slice());
    const ctx = { file, index, tokenizer, config, streamer, trace, stats, kv, diskKv, scratch, generatedSoFar: tokens.slice(), topK: options.topK ?? 10 };
    trace.mark('after-init');
    runPrefill(ctx, trace, tokens, options);
    generate(ctx, state, tokenizer, tokens, options, trace);
    return result({ scratch, tokens, state, tokenizer, config, kv, diskKv, stats, trace, renderedPrompt, topLogits: ctx.lastTopLogits });
  } finally {
    file.close();
    if (options.deleteScratchOnClose) removeDir(scratch);
  }
}

function runPrefill(ctx, trace, tokens, options) {
  const limit = Math.min(tokens.length, options.promptTokens ?? tokens.length);
  for (let i = 0; i < Math.max(0, limit - 1); i++) {
    runToken(ctx, tokens[i], i, false);
    trace.mark(`after-prefill-${i}`);
  }
}

function generate(ctx, state, tokenizer, tokens, options, trace) {
  const limit = Math.min(tokens.length, options.promptTokens ?? tokens.length);
  let current = tokens[Math.max(0, limit - 1)] || tokenizer.bos;
  for (let g = 0; g < (options.maxNewTokens ?? 8); g++) {
    const next = runToken(ctx, current, limit - 1 + g, true);
    state.append(next); ctx.generatedSoFar.push(next); current = next;
    if (options.onToken) options.onToken(next, tokenizer.decode([next]));
    trace.mark(`after-generate-${g}`);
    if (next === tokenizer.eos) break;
  }
}

function result(parts) {
  const { scratch, tokens, state, tokenizer, config, kv, diskKv, stats, trace, renderedPrompt, topLogits } = parts;
  return { ok: true, mode: 'disk-first-native-q2k-experimental', scratch, renderedPrompt, promptTokens: tokens, generated: state.generated, text: tokenizer.decode(state.generated), topLogits, config, kv: kv.summary(), diskKv: diskKv ? diskKv.summary() : null, stats: stats.summary(), memory: trace.summary() };
}

module.exports = { runChat };
