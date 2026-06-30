#!/usr/bin/env node
// B"H
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const BASE_LOW_RAM = { AWTAI_TENSOR_CACHE_BYTES: '0', AWTAI_MAX_RAM_KV: '1',
  AWTAI_MAPPED_PROJECT_ADD: '1', AWTAI_DIRECT_TOPK_ROWS: process.env.AWTAI_DIRECT_TOPK_ROWS || '64' };
const MODES = {
  nativeFast: { ...BASE_LOW_RAM, AWTAI_JS_DIRECT_LM_HEAD: '1', AWTAI_COMPILED_LM_HEAD: '0',
    AWTAI_PERSISTENT_POOL: '1', AWTAI_THREADS: process.env.AWTAI_THREADS || '4' },
  rawCompiled: { AWTAI_NATIVE_MODEL_MAP: '0', AWTAI_FILE_PROJECT: '0', AWTAI_RAW_QKV: '1',
    AWTAI_RAW_FFN: '1', AWTAI_TENSOR_CACHE_BYTES: '0', AWTAI_JS_DIRECT_LM_HEAD: '1',
    AWTAI_COMPILED_LM_HEAD: '1', AWTAI_DIRECT_TOPK_ROWS: '64', AWTAI_PERSISTENT_POOL: '1',
    AWTAI_THREADS: process.env.AWTAI_THREADS || '4' },
  lowRssFile: { ...BASE_LOW_RAM, AWTAI_JS_DIRECT_LM_HEAD: '1', AWTAI_FILE_PROJECT: '1',
    AWTAI_NATIVE_MODEL_MAP: '0', AWTAI_MAPPED_PROJECT_ADD: '0' },
  compiled: { ...BASE_LOW_RAM, AWTAI_JS_DIRECT_LM_HEAD: '1', AWTAI_COMPILED_LM_HEAD: '1' },
  direct: { ...BASE_LOW_RAM, AWTAI_JS_DIRECT_LM_HEAD: '1', AWTAI_COMPILED_LM_HEAD: '0' },
  noNative: { ...BASE_LOW_RAM, AWTAI_NO_NATIVE: '1', AWTAI_JS_DIRECT_LM_HEAD: '1' },
  default: {}
};

async function main() {
  const model = process.argv[2];
  const prompt = process.argv.slice(3).join(' ') || 'Hello';
  if (!model) return usage();
  const names = (process.env.AWTAI_BENCH_MODES || 'nativeFast,direct').split(',').filter(Boolean);
  const results = [];
  for (const name of names) results.push(await runMode(name, model, prompt));
  console.log(JSON.stringify({ ok: true, model, prompt, rssMonitor: 'ps-poll',
    rssPollMs: pollMs(), externalTimeAvailable: fs.existsSync('/usr/bin/time'),
    externalCompilerInvoked: false, liveInference: true, results }, null, 2));
}

function runMode(name, model, prompt) {
  if (name === 'promptCache') throw new Error("B'H prompt-answer cache is forbidden for live inference gate");
  const env = { ...process.env, ...(MODES[name] || {}), AWTAI_MAX_NEW: envValue('AWTAI_MAX_NEW', '1'),
    AWTAI_TOP_K: envValue('AWTAI_TOP_K', '10'), AWTAI_MAX_RAM_KV: envValue('AWTAI_MAX_RAM_KV', '1') };
  const start = process.hrtime.bigint();
  const child = spawn(process.execPath, [path.join(__dirname, 'real-chat.js'), model, prompt], { env });
  let stdout = '', stderr = '', peakRss = 0;
  child.stdout.on('data', d => { stdout += d; });
  child.stderr.on('data', d => { stderr += d; });
  const timer = setInterval(() => { peakRss = Math.max(peakRss, sampleRss(child.pid)); }, pollMs());
  return new Promise(resolve => child.on('close', code => {
    peakRss = Math.max(peakRss, sampleRss(child.pid));
    clearInterval(timer);
    const wallMs = Number(process.hrtime.bigint() - start) / 1e6;
    const parsed = parseJson(stdout);
    const generated = parsed && parsed.generatedCount ? parsed.generatedCount : null;
    const childRss = parsed && parsed.memory && parsed.memory.maxRss || 0;
    const rss = Math.max(peakRss, childRss);
    resolve({ name, exitCode: code, totalMs: wallMs, msPerToken: generated ? wallMs / generated : null,
      rss, rssMb: mb(rss), generatedCount: parsed && parsed.generatedCount,
      promptTokens: parsed && parsed.promptTokens, promptTokenCount: parsed && parsed.promptTokens && parsed.promptTokens.length,
      promptTokensUsed: parsed && parsed.promptTokensUsed,
      tempBytes: parsed && parsed.tempBytes, readBytes: parsed && parsed.stats && parsed.stats.readBytes,
      dequantBytes: parsed && parsed.stats && parsed.stats.dequantBytes, tensorsRead: parsed && parsed.stats && parsed.stats.tensorsRead,
      cache: parsed && parsed.streamer, text: parsed && parsed.text, topLogits: parsed && parsed.topLogits,
      timing: parsed && parsed.timing, memory: parsed && parsed.memory, stats: parsed && parsed.stats,
      liveInference: true, externalCompilerInvoked: false, flags: pick(env), stderr: stderr.trim() });
  }));
}

function pollMs() { return Math.max(25, Number(process.env.AWTAI_RSS_POLL_MS || 100) || 100); }
function sampleRss(pid) {
  if (!pid) return 0;
  const out = spawnSync('ps', ['-o', 'rss=', '-p', String(pid)], { encoding: 'utf8' });
  const kb = Number((out.stdout || '').trim());
  return Number.isFinite(kb) ? kb * 1024 : 0;
}
function parseJson(text) { try { return JSON.parse(text); } catch (_) { return null; } }
function envValue(name, fallback) { return process.env[name] || fallback; }
function mb(bytes) { return Number.isFinite(bytes) ? bytes / 1048576 : null; }
function pick(env) {
  return ['AWTAI_THREADS','AWTAI_FILE_PROJECT','AWTAI_NATIVE_MODEL_MAP','AWTAI_MAPPED_PROJECT_ADD',
    'AWTAI_DIRECT_TOPK_ROWS','AWTAI_TENSOR_CACHE_BYTES','AWTAI_JS_DIRECT_LM_HEAD',
    'AWTAI_COMPILED_LM_HEAD','AWTAI_RAW_QKV','AWTAI_RAW_FFN','AWTAI_NO_NATIVE','AWTAI_NO_PROFILE']
    .reduce((o, k) => (env[k] && (o[k] = env[k]), o), {});
}
function usage() { console.error('Usage: bench-chat model.awtai-db "prompt"'); process.exit(1); }
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
