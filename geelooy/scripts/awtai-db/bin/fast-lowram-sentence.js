#!/usr/bin/env node
// B"H
const { runChat } = require('../decode/chat-loop.js');

function main() {
  const model = process.argv[2];
  const prompt = process.argv.slice(3).join(' ') || 'Write one sentence.';
  if (!model) return usage();
  const started = process.hrtime.bigint();
  process.env.AWTAI_MMAP_LM_HEAD ||= '1';
  process.env.AWTAI_TENSOR_CACHE_BYTES ||= '0';
  const result = runChat(model, prompt, {
    maxNewTokens: numberEnv('AWTAI_MAX_NEW', 4),
    minNewTokens: numberEnv('AWTAI_MIN_NEW', 0),
    tensorCacheBytes: 0,
    maxRamKvTokens: numberEnv('AWTAI_MAX_RAM_KV', 1),
    spillKvToDisk: true,
    deleteScratchOnClose: true,
    topK: numberEnv('AWTAI_TOP_K', 10),
  });
  const wallMs = Number(process.hrtime.bigint() - started) / 1e6;
  const stats = result.stats || {};
  const tokenPasses = result.promptTokens.length - 1 + result.generated.length;
  console.log(JSON.stringify({
    ok: true,
    text: result.text,
    generated: result.generated,
    wallMs,
    processRssMiB: process.memoryUsage().rss / 1048576,
    tempBytes: result.mmapLmHeadBytes || 0,
    readBytes: stats.readBytes || 0,
    tokenPasses,
    msPerTokenPass: wallMs / Math.max(1, tokenPasses),
    deletedTemp: true,
    topLogits: result.topLogits,
    mode: { fileProject: process.env.AWTAI_FILE_PROJECT || '0', mmapLmHead: process.env.AWTAI_MMAP_LM_HEAD },
    note: 'maxRssMiB must be read from /usr/bin/time -l maximum resident set size',
  }, null, 2));
}
function numberEnv(name, fallback) { const v = Number(process.env[name]); return Number.isFinite(v) ? v : fallback; }
function usage() { console.error('Usage: fast-lowram-sentence.js model.awtai-db "Write one sentence."'); process.exit(1); }
main();
