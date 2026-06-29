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
    const parts = openParts(file, stats, scratch, prompt, options, trace);
    runPrefill(parts.ctx, trace, parts.tokens, options);
    generate(parts.ctx, parts.state, parts.tokenizer, parts.tokens, options, trace);
    return result(parts, trace);
  } finally {
    file.close();
    if (options.deleteScratchOnClose) removeDir(scratch);
  }
}

function openParts(file, stats, scratch, prompt, options, trace) {
  const index = new TensorIndex(file.manifest);
  const tokenizer = new GgufTokenizer(file.manifest.metadata);
  const config = readModelConfig(file.manifest);
  const streamer = new TensorStreamer(file, stats, { cacheBytes: options.tensorCacheBytes ?? defaultCacheBytes() });
  const diskKv = options.spillKvToDisk === false ? null : new KvDiskCache(options.kvDir || scratch + '/kv');
  const kv = new KvCache(options.maxRamKvTokens ?? 64, diskKv);
  const renderedPrompt = renderPrompt(file.manifest.metadata, prompt, options);
  const tokens = tokenizer.encode(renderedPrompt, options.addBos !== false);
  const state = new ChatState(tokens.slice());
  const ctx = { file, index, tokenizer, config, streamer, trace, stats, kv, diskKv, scratch, generatedSoFar: tokens.slice(), topK: options.topK ?? 10, suppressTokenIds: [] };
  trace.mark('after-init');
  return { scratch, tokens, state, tokenizer, config, kv, diskKv, stats, renderedPrompt, ctx };
}

function runPrefill(ctx, trace, tokens, options) {
  const limit = Math.min(tokens.length, options.promptTokens ?? tokens.length);
  for (let i = 0; i < Math.max(0, limit - 1); i++) {
    runToken(ctx, tokens[i], i, false);
    trace.mark(`after-prefill-${i}`);
  }
}

/**
 * Generate answer tokens with an optional minimum length gate.
 *
 * A chat model may place EOS close to the first newline.  During the first
 * requested breaths we hide EOS so the answer can cross the threshold from
 * doorway into speech.  After that, EOS is honored again and the river may end.
 */
function generate(ctx, state, tokenizer, tokens, options, trace) {
  const limit = Math.min(tokens.length, options.promptTokens ?? tokens.length);
  const minNewTokens = options.minNewTokens ?? 0;
  let current = tokens[Math.max(0, limit - 1)] || tokenizer.bos;
  for (let g = 0; g < (options.maxNewTokens ?? 8); g++) {
    ctx.suppressTokenIds = g < minNewTokens ? [tokenizer.eos] : [];
    const next = runToken(ctx, current, limit - 1 + g, true);
    ctx.suppressTokenIds = [];
    state.append(next);
    ctx.generatedSoFar.push(next);
    current = next;
    if (options.onToken) options.onToken(next, tokenizer.decode([next]));
    trace.mark(`after-generate-${g}`);
    if (next === tokenizer.eos && g >= minNewTokens) break;
  }
}

function defaultCacheBytes() {
  const value = Number(process.env.AWTAI_TENSOR_CACHE_BYTES);
  if (Number.isFinite(value) && value >= 0) return value;
  return 1536 * 1024 * 1024;
}

function result(parts, trace) {
  const { scratch, tokens, state, tokenizer, config, kv, diskKv, stats, renderedPrompt, ctx } = parts;
  return { ok: true, mode: 'cached-native-awtai-chat', scratch, renderedPrompt, promptTokens: tokens, generated: state.generated, text: tokenizer.decode(state.generated), topLogits: ctx.lastTopLogits, config, kv: kv.summary(), diskKv: diskKv ? diskKv.summary() : null, streamer: ctx.streamer.summary(), stats: stats.summary(), memory: trace.summary() };
}

module.exports = { runChat };
