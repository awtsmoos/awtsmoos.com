// B"H
import fs from 'fs';
import path from 'path';
import { simulateRuntime } from '../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js';

const out = 'AI_THOUGHTS/runtime-stress/local-action-sandbox/merkava-snapshot-proof';
fs.mkdirSync(out, { recursive: true });
const result = await simulateRuntime({
  runtime: 'MekravaExecutor',
  entry: 'index.html',
  files: { 'index.html': '<!doctype html><html><body><h1>B\'H Real Snapshot Proof</h1><p>Visible text from virtual DOM.</p><button>Repair</button><script>window.appState={ready:true,issueCount:1};</script></body></html>' },
  snapshot: true,
  format: 'png',
  fullPage: true,
  values: ['window.appState']
});
const snap = result.snapshot || {};
fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({ ok: result.ok, values: result.values, snapshot: { format: snap.format, fullPage: snap.fullPage, html: snap.html, text: snap.text, image: { ...snap.image, dataUrl: snap.image?.dataUrl ? '[omitted]' : null }, hasDataUrl: Boolean(snap.dataUrl) } }, null, 2));
if (snap.dataUrl) fs.writeFileSync(path.join(out, 'snapshot.png'), Buffer.from(snap.dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
console.log(JSON.stringify({ ok: result.ok, hasHtml: Boolean(snap.html), hasText: Boolean(snap.text), hasDataUrl: Boolean(snap.dataUrl), backend: snap.image?.backend, fallbackReason: snap.image?.fallbackReason || null, bytes: snap.image?.bytes || 0 }, null, 2));
if (!result.ok || !snap.html || !snap.text || !snap.dataUrl || !snap.image?.backend) process.exit(1);
