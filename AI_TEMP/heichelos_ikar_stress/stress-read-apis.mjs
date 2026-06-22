/**
 * B"H
 * Chapter 408: The buttons are chased through their read-only shadows.
 *
 * This stress runner refuses destructive mutations. It hammers the endpoints
 * that the visible buttons and cards depend on: page shell, heichel metadata,
 * tabs/series, card opening, bottom navigation destinations, and static assets.
 */

const ORIGIN = process.env.AWTS_STRESS_ORIGIN || 'http://localhost:8080';
const ROUNDS = Number(process.env.AWTS_STRESS_ROUNDS || 8);

const paths = [
  '/',
  '/heichelos/ikar?view=posts',
  '/heichelos/ikar?view=series',
  '/heichelos/ikar/series/theWrittenTorah?view=series',
  '/api/social/heichelos/ikar',
  '/api/social/heichelos/ikar/series/root/details',
  '/api/social/heichelos/ikar/series/root/subSeries?details=true',
  '/api/social/heichelos/ikar/series/theWrittenTorah/details',
  '/api/social/heichelos/ikar/series/theWrittenTorah/subSeries?details=true',
  '/style/heichelos/heichel/card.css?v=stress',
  '/style/heichelos/heichel/grid.css?v=stress',
  '/style/heichelos/heichel/bottom-nav.css?v=stress',
  '/heichelos/heichel/app.js?v=stress'
];

async function hit(path) {
  const started = Date.now();
  const response = await fetch(ORIGIN + path, { cache: 'no-store' });
  const text = await response.text();
  return { path, status: response.status, ms: Date.now() - started, bytes: text.length, ok: response.ok };
}

const results = [];
for (let round = 0; round < ROUNDS; round++) {
  results.push(...await Promise.all(paths.map(hit)));
}

const failures = results.filter(result => !result.ok);
const summary = paths.map(path => {
  const mine = results.filter(result => result.path === path);
  const avg = Math.round(mine.reduce((sum, result) => sum + result.ms, 0) / mine.length);
  return { path, hits: mine.length, avgMs: avg, statuses: [...new Set(mine.map(result => result.status))] };
});

console.log(JSON.stringify({ BH: 'B"H', rounds: ROUNDS, failures, summary }, null, 2));
if (failures.length) process.exit(1);
