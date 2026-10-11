#!/usr/bin/env node
// B"H
// merkava-shot — Instant screenshot via Merkava's native software renderer.
// NO CHROME. Pure Merkava: parse → cascade → layout → paint → PNG.
//
// Usage:
//   node merkava-shot.mjs --url <url> --out shot.png [--width 1280 --height 800 --full]
//   node merkava-shot.mjs --html '<h1>hi</h1>' --out shot.png
//   node merkava-shot.mjs --file page.html --out shot.png
//
// For --url: fetches HTML over HTTP(S) with Node (dumb pipe), renders with
// Merkava (smart). JS-heavy pages render their static HTML shell; for full
// JS execution use the MerkavaExecutor runtime snapshot pipeline instead.
import { writeFileSync, readFileSync } from 'fs';
import { renderVirtualSnapshotPng } from './geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/virtualPngRenderer.js';

function arg(name, def = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : def;
}
const has = (name) => process.argv.includes(name);

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Merkava/1.0 (screenshot)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

async function main() {
  const url = arg('--url');
  const htmlArg = arg('--html');
  const file = arg('--file');
  const out = arg('--out', '/tmp/merkava-shot.png');
  const width = parseInt(arg('--width', '1280'), 10);
  const height = parseInt(arg('--height', '800'), 10);
  const fullPage = has('--full');

  let html;
  if (url) {
    console.log(`Fetching ${url} ...`);
    html = await fetchHtml(url);
  } else if (file) {
    html = readFileSync(file, 'utf8');
  } else if (htmlArg) {
    html = htmlArg;
  } else {
    console.error('Need one of: --url, --file, --html');
    process.exit(1);
  }

  const t0 = Date.now();
  const result = renderVirtualSnapshotPng(
    { html },
    { width, height, fullPage }
  );
  const ms = Date.now() - t0;
  const png = Buffer.from(result.dataUrl.split(',')[1], 'base64');
  writeFileSync(out, png);
  console.log(`OK ${out} ${result.width}x${result.height} ${png.length}B in ${ms}ms (no Chrome)`);
}

main().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
