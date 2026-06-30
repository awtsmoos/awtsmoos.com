#!/usr/bin/env node
// B"H
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const BASE_LOW_RAM = { AWTAI_TENSOR_CACHE_BYTES: '0', AWTAI_MAX_RAM_KV: '1' };
const MODES = {
  nativeFast: { ...BASE_LOW_RAM, AWTAI_JS_DIRECT_LM_HEAD: '1', AWTAI_COMPILED_LM_HEAD: '0',
    AWTAI_PERSISTENT_POOL: '1', AWTAI_THREADS: process.env.AWTAI_THREADS || '4' },
  compiled: { ...BASE_LOW_RAM, AWTAI_JS_DIRECT_LM_HEAD: '1', AWTAI_COMPILED_LM_HEAD: '1' },
  direct: { ...BASE_LOW_RAM, AWTAI_JS_DIRECT_LM_HEAD: '1', AWTAI_COMPILED_LM_HEAD: '0' },
  noNative: { ...BASE_LOW_RAM, AWTAI_NO_NATIVE: '1', AWTAI_JS_DIRECT_LM_HEAD: '1' },
  default: {}
};

function main() {
  const model = process.argv[2];
  const prompt = process.argv.slice(3).join(' ') || 'Hello';
  if (!model) return usage();
  const names = (process.env.AWTAI_BENCH_MODES || 'nativeFast,direct').split(',').filter(Boolean);
  const results = names.map(name => runMode(name, model, prompt));
  console.log(JSON.stringify({ ok: true, model, prompt, externalTimeAvailable: fs.existsSync('/usr/bin/time'), results }, null, 2));
}

function runMode(name, model, prompt) {
  const env = { ...process.env, ...(MODES[name] || {}), AWTAI_MAX_NEW: envValue('AWTAI_MAX_NEW', '1'),
    AWTAI_TOP_K: envValue('AWTAI_TOP_K', '10'), AWTAI_MAX_RAM_KV: envValue('AWTAI_MAX_RAM_KV', '1') };
  const args = [path.join(__dirname, 'real-chat.js'), model, prompt];
  const start = process.hrtime.bigint();
  const out = spawnSync(process.execPath, args, { env, encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 });
  const wallMs = Number(process.hrtime.bigint() - start) / 1e6;
  const parsed = parseJson(out.stdout);
  const generated = parsed && parsed.generatedCount ? parsed.generatedCount : null;
  return { name, exitCode: out.status, wallMs, msPerToken: generated ? wallMs / generated : null,
    rss: parsed && parsed.memory && parsed.memory.maxRss, rssMb: mb(parsed && parsed.memory && parsed.memory.maxRss),
    tempBytes: parsed && parsed.tempBytes, readBytes: parsed && parsed.stats && parsed.stats.readBytes,
    dequantBytes: parsed && parsed.stats && parsed.stats.dequantBytes, tensorsRead: parsed && parsed.stats && parsed.stats.tensorsRead,
    cache: parsed && parsed.streamer, text: parsed && parsed.text, topLogits: parsed && parsed.topLogits,
    flags: pick(env), stderr: out.stderr.trim() };
}

function parseJson(text) { try { return JSON.parse(text); } catch (_) { return null; } }
function envValue(name, fallback) { return process.env[name] || fallback; }
function mb(bytes) { return Number.isFinite(bytes) ? bytes / 1048576 : null; }
function pick(env) { return ['AWTAI_THREADS','AWTAI_PERSISTENT_POOL','AWTAI_TENSOR_CACHE_BYTES','AWTAI_JS_DIRECT_LM_HEAD','AWTAI_COMPILED_LM_HEAD','AWTAI_NO_NATIVE'].reduce((o,k)=>(env[k]&&(o[k]=env[k]),o),{}); }
function usage(){ console.error('Usage: bench-chat model.awtai-db "prompt"'); process.exit(1); }
main();
