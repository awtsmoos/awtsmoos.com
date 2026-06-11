#!/usr/bin/env node
// B"H
/**
 * @file live-visible-root-regression.cjs
 * @description
 * Chapter 648: The served river must match the source river on the real loopback.
 *
 * Static files can be pure while the live server still pours an old compact
 * stream. Android loopback can resolve `localhost` differently, so this probe
 * defaults to `127.0.0.1` and judges the actual HTML/modules a browser receives.
 */
const http = require('http');

const base = process.env.MITZVAH_WORLD_BASE_URL || 'http://127.0.0.1:8080/games/mitzvahWorld/';
const seal = 'visible-root-binding-20260610-bh710';
const banned = ['wall-direct-mobile-move-20260610-bh705', 'wall-direct-mobile-router-20260610-bh706', 'physics-motion-trace-20260610-bh708', 'chossid-model-load-20260610-bh709'];

const checks = [
  { route: '?path=/levels/ladder/data/village.json', must: ['index.js?compact=true&v=' + seal] },
  { route: 'index.js?compact=true&v=' + seal, must: ['visible-root-binding-20260610-bh710', 'ikar.js?compact=true&bh=${SEAL}'] },
  { route: 'ckidsAwtsmoos/ikar.js?compact=true&bh=' + seal, must: ['__AWTSMOOS_REQUEST_PLAYER_PROBE__', '__AWTSMOOS_ASSERT_PLAYER_BODY__', seal] },
  { route: 'ckidsAwtsmoos/Olam/worldManager/index.js?compact=true&v=' + seal, must: ['playerProbeResult', seal] },
  { route: 'ckidsAwtsmoos/Olam/oyved/core/ContinuousEventRouter.js?v=' + seal, must: ['WorldDisposal.js?v=' + seal, 'SpikeResetActions.js?v=' + seal, 'playerProbe'] },
  { route: 'ckidsAwtsmoos/Olam/oyved/core/PlayerRuntimeProbe.js?v=' + seal, must: ['modelParentIsRoot', 'fallbackPresent', seal] },
  { route: 'ckidsAwtsmoos/Olam/oyved/core/WorldDisposal.js?v=' + seal, must: ['destroyWorld', 'disposed'] },
  { route: 'ckidsAwtsmoos/Olam/oyved/core/SpikeResetActions.js?v=' + seal, must: ['resetAfterSpikeDeath', 'enableAfterSpikeReset'] },
  { route: 'ckidsAwtsmoos/chayim/chossid/index.js?v=' + seal, must: [seal] },
  { route: 'ckidsAwtsmoos/chayim/chai/index.js?v=' + seal, must: [seal] }
];

function absoluteUrl(route) {
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  if (route.startsWith('?')) return cleanBase + route;
  return new URL(route, cleanBase).href;
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    http.get(url, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode > 299) reject(new Error(`${url} returned HTTP ${response.statusCode}`));
        else resolve(body);
      });
    }).on('error', reject);
  });
}

function assertBody(url, body, must) {
  for (const needle of banned) if (body.includes(needle)) throw new Error(`${url} served stale seal: ${needle}`);
  for (const needle of must) if (!body.includes(needle)) throw new Error(`${url} missing served witness: ${needle}`);
}

async function main() {
  const results = [];
  for (const check of checks) {
    const url = absoluteUrl(check.route);
    const body = await fetchText(url);
    assertBody(url, body, check.must);
    results.push({ url, bytes: Buffer.byteLength(body) });
  }
  console.log('B"H live visible-root regression passed', JSON.stringify({ seal, base, checked: results.length, results }, null, 2));
}

main().catch(error => { console.error('B"H live visible-root regression failed:', error.message); process.exit(1); });
