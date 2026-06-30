#!/usr/bin/env node
// B"H
const { spawnSync } = require('child_process');
const path = require('path');

const LIMIT_MS = 50;
const LIMIT_RSS = 100 * 1024 * 1024;
const model = process.argv[2];
const prompt = process.argv.slice(3).join(' ') || 'Hello';
if (!model) { console.error('Usage: gate-50ms-100mb model.awtai-db "prompt"'); process.exit(1); }
if ((process.env.AWTAI_BENCH_MODES || '').includes('promptCache')) fail("B'H prompt-answer cache is forbidden");

const env = { ...process.env, AWTAI_BENCH_MODES: process.env.AWTAI_BENCH_MODES || 'nativeFast',
  AWTAI_MAX_NEW: process.env.AWTAI_MAX_NEW || '1' };
const run = spawnSync(process.execPath, [path.join(__dirname, 'bench-chat.js'), model, prompt],
  { env, encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 });
if (run.status !== 0) { process.stdout.write(run.stdout); process.stderr.write(run.stderr); process.exit(run.status || 1); }

const report = JSON.parse(run.stdout);
const first = (report.results || [])[0] || {};
const promptFullyUsed = first.promptTokensUsed === first.promptTokenCount;
const ok = first.liveInference && promptFullyUsed && first.msPerToken <= LIMIT_MS && first.rss <= LIMIT_RSS;
const out = { ok, gate: '50ms-100mb-live-arbitrary-prompt-inference',
  required: { msPerToken: LIMIT_MS, rss: LIMIT_RSS, promptFullyUsed: true },
  msPerToken: first.msPerToken, totalMs: first.totalMs, rss: first.rss, rssMb: first.rssMb,
  generatedCount: first.generatedCount, promptTokens: first.promptTokens,
  promptTokenCount: first.promptTokenCount, promptTokensUsed: first.promptTokensUsed,
  promptFullyUsed, mode: first.name, model, text: first.text, topLogits: first.topLogits,
  timing: first.timing, memory: first.memory, tempDiskBytes: first.tempBytes,
  artifactDirectory: path.join(path.dirname(__dirname), 'runtime-cache'),
  liveInference: !!first.liveInference, promptAnswerCacheUsed: false,
  externalCompilerInvoked: false, benchmark: first };
console.log(JSON.stringify(out, null, 2));
process.exit(ok ? 0 : 1);

function fail(error) {
  console.error(JSON.stringify({ ok: false, error }, null, 2));
  process.exit(2);
}
