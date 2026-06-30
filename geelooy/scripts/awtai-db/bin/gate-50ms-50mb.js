#!/usr/bin/env node
// B"H
const { spawnSync } = require('child_process');
const path = require('path');

const model = process.argv[2];
const prompt = process.argv.slice(3).join(' ') || 'Hello';
if (!model) { console.error('Usage: gate-50ms-50mb model.awtai-db "prompt"'); process.exit(1); }
const env = { ...process.env, AWTAI_BENCH_MODES: process.env.AWTAI_BENCH_MODES || 'nativeFast', AWTAI_MAX_NEW: process.env.AWTAI_MAX_NEW || '1' };
const r = spawnSync(process.execPath, [path.join(__dirname, 'bench-chat.js'), model, prompt], { env, encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 });
if (r.status !== 0) { process.stdout.write(r.stdout); process.stderr.write(r.stderr); process.exit(r.status || 1); }
const report = JSON.parse(r.stdout);
const first = report.results[0] || {};
const pass = first.msPerToken <= 50 && first.rss <= 50 * 1024 * 1024;
console.log(JSON.stringify({ ok: pass, gate: '50ms-50mb', mode: first.name, msPerToken: first.msPerToken, rss: first.rss, rssMb: first.rssMb, text: first.text }, null, 2));
process.exit(pass ? 0 : 1);
