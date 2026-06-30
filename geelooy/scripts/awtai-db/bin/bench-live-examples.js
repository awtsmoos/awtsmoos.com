#!/usr/bin/env node
// B"H
const { spawnSync } = require('child_process');
const path = require('path');

const prompts = [
  'Hello',
  'What is 2 plus 2?',
  'Name one color.',
  'Write one short greeting.',
  'What is the capital of France?',
  'Say yes or no: is water wet?',
  'Give one word for a small house.'
];

const model = process.argv[2];
if (!model) { console.error('Usage: bench-live-examples model.awtai-db'); process.exit(1); }

const results = prompts.map(prompt => run(prompt));
console.log(JSON.stringify({ ok: true, model, liveInference: true,
  promptAnswerCacheUsed: false, externalCompilerInvoked: false, results }, null, 2));

function run(prompt) {
  const env = { ...process.env, AWTAI_BENCH_MODES: 'rawCompiled',
    AWTAI_MAX_NEW: process.env.AWTAI_MAX_NEW || '1',
    AWTAI_NO_PROFILE: process.env.AWTAI_NO_PROFILE || '1',
    AWTAI_RSS_POLL_MS: process.env.AWTAI_RSS_POLL_MS || '250' };
  delete env.AWTAI_PROMPT_TOKENS;
  const out = spawnSync(process.execPath, [path.join(__dirname, 'gate-50ms-100mb.js'), model, prompt],
    { env, encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 });
  const parsed = parse(out.stdout);
  return { prompt, exitCode: out.status, ok: parsed && parsed.ok,
    totalMs: parsed && parsed.totalMs, msPerToken: parsed && parsed.msPerToken,
    rssMb: parsed && parsed.rssMb, promptTokenCount: parsed && parsed.promptTokenCount,
    promptTokensUsed: parsed && parsed.promptTokensUsed,
    text: parsed && parsed.text, topLogits: parsed && parsed.topLogits };
}

function parse(text) { try { return JSON.parse(text); } catch (_) { return null; } }
