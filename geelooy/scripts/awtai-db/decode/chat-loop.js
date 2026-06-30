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
const { runToken, runLayer, startToken } = require('./token-runner.js');
const { renderPrompt } = require('./prompt-template.js');
const { makeScratchDir, removeDir } = require('../scratch/scratch-dir.js');
const { dirBytes } = require('../scratch/dir-size.js');
const { Timer } = require('../profiling/timer.js');
const { nativeCreateAttentionSession, nativeResetAttentionSession } = require('../native/native-matvec.js');

function runChat(model, prompt, options = {}) {
  const profiling = options.profile !== false && !off(process.env.AWTAI_PROFILE);
  const trace = profiling ? new MemoryTrace() : quietTrace();
  const stats = new RunStats();
  const timer = profiling ? new Timer() : quietTimer();
  const scratch = options.scratchDir || makeScratchDir('awtai-run');
  let parts = null;
  trace.mark('start');
  const file = timer.time('open-awtai-file', () => new AwtaiFile(model));
  try {
    trace.mark('after-open-file');
    parts = openParts(file, stats, timer, scratch, prompt, options, trace);
    timer.time('prefill', () => runPrefill(parts.ctx, trace, parts.tokens, options));
    timer.time('generate', () => generate(parts.ctx, parts.state, parts.tokenizer, parts.tokens, options, trace));
    return result(parts, trace, timer, profiling, options);
  } finally {
    if (parts && parts.ctx) disposeCtx(parts.ctx);
    file.close();
    if (options.deleteScratchOnClose) removeDir(scratch);
  }
}

function openParts(file, stats, timer, scratch, prompt, options, trace) {
  const index = timer.time('build-tensor-index', () => new TensorIndex(file.manifest));
  const tokenizer = timer.time('build-tokenizer', () => new GgufTokenizer(file.manifest.metadata));
  const config = readModelConfig(file.manifest);
  const streamer = new TensorStreamer(file, stats, { cacheBytes: options.tensorCacheBytes ?? defaultCacheBytes() });
  const diskKv = options.spillKvToDisk === false ? null : new KvDiskCache(options.kvDir || scratch + '/kv');
  const kv = new KvCache(options.maxRamKvTokens ?? 64, diskKv);
  const renderedPrompt = timer.time('render-prompt', () => renderPrompt(file.manifest.metadata, prompt, options));
  const tokens = timer.time('tokenize-prompt', () => tokenizer.encode(renderedPrompt, options.addBos !== false));
  const state = new ChatState(tokens.slice());
  const nativeAttention = createNativeAttention(config, tokens, options);
  trace.mark('after-init');
  const ctx = { file, index, tokenizer, config, streamer, trace, stats, timer, kv, diskKv,
    scratch, nativeAttention, generatedSoFar: tokens.slice(), topK: options.topK ?? 10,
    suppressTokenIds: [], compiledTopKMaxRows: options.compiledTopKMaxRows };
  return { scratch, tokens, state, tokenizer, config, kv, diskKv, stats, renderedPrompt, ctx };
}

function runPrefill(ctx, trace, tokens, options) {
  if (off(process.env.AWTAI_LAYER_MAJOR_PREFILL)) return runTokenMajorPrefill(ctx, trace, tokens, options);
  const limit = promptLimit(tokens, options) - 1;
  if (limit <= 0) return;
  const xs = [];
  for (let i = 0; i < limit; i++) xs.push(startToken(ctx, tokens[i], i));
  for (let layer = 0; layer < ctx.config.layers; layer++) {
    ctx.streamer.beginScope();
    try { for (let i = 0; i < limit; i++) runLayer(ctx, layer, xs[i], i); }
    finally { ctx.streamer.endScope(); }
  }
  trace.mark('after-layer-major-prefill');
}

function runTokenMajorPrefill(ctx, trace, tokens, options) {
  const limit = promptLimit(tokens, options);
  for (let i = 0; i < Math.max(0, limit - 1); i++) { runToken(ctx, tokens[i], i, false); trace.mark(`after-prefill-${i}`); }
}

function generate(ctx, state, tokenizer, tokens, options, trace) {
  const limit = promptLimit(tokens, options);
  let current = tokens[Math.max(0, limit - 1)] || tokenizer.bos;
  for (let g = 0; g < (options.maxNewTokens ?? 8); g++) {
    ctx.suppressTokenIds = g < (options.minNewTokens ?? 0) ? [tokenizer.eos] : [];
    const next = runToken(ctx, current, limit - 1 + g, true);
    ctx.suppressTokenIds = []; state.append(next); ctx.generatedSoFar.push(next); current = next;
    if (options.onToken) options.onToken(next, tokenizer.decode([next]));
    trace.mark(`after-generate-${g}`);
    if (next === tokenizer.eos && g >= (options.minNewTokens ?? 0)) break;
  }
}

function createNativeAttention(config, tokens, options) {
  if (/^(0|false|no)$/.test(String(process.env.AWTAI_NATIVE_ATTENTION || '1'))) return null;
  const expected = promptLimit(tokens, options) + (options.maxNewTokens ?? 8) + 2;
  const cap = Number(options.nativeAttentionTokens || process.env.AWTAI_NATIVE_ATTENTION_TOKENS || expected);
  return Number.isFinite(cap) && cap >= expected ? nativeCreateAttentionSession(config.layers, Math.ceil(cap), config.kvHeads * config.headDim) : null;
}
function promptLimit(tokens, options) { return Math.min(tokens.length, options.promptTokens ?? tokens.length); }
function defaultCacheBytes() { const v = Number(process.env.AWTAI_TENSOR_CACHE_BYTES); return Number.isFinite(v) && v >= 0 ? v : 0; }
function disposeCtx(ctx) { if (ctx.nativeAttention) nativeResetAttentionSession(ctx.nativeAttention); if (ctx.streamer) ctx.streamer.dispose(); }
function result(parts, trace, timer, profiling, options) {
  const { scratch, tokens, state, tokenizer, config, kv, diskKv, stats, renderedPrompt, ctx } = parts;
  return { ok: true, mode: 'cached-native-awtai-chat', scratch, renderedPrompt,
    promptTokens: tokens, promptTokensUsed: promptLimit(tokens, options),
    generated: state.generated, generatedCount: state.generated.length,
    text: tokenizer.decode(state.generated), topLogits: ctx.lastTopLogits,
    mmapLmHeadBytes: ctx.mmapLmHeadBytes || 0, tempBytes: dirBytes(scratch), config,
    nativeAttention: !!ctx.nativeAttention, kv: kv.summary(), diskKv: diskKv ? diskKv.summary() : null,
    streamer: ctx.streamer.summary(), stats: stats.summary(), timing: timer.summary(),
    memory: trace.summary(), profiling, externalCompilerInvoked: false };
}
function quietTimer() { return { time: (_label, fn) => fn(), summary: () => [] }; }
function quietTrace() { return { mark: () => null, summary: () => ({ maxRss: process.memoryUsage().rss, sampleCount: 0, samples: [] }) }; }
function off(value) { return /^(0|false|no)$/.test(String(value || '1')); }

module.exports = { runChat };
