// B"H
/**
 * Read-only guard for the Ikar Heichel and Torah series. It never mutates DB.
 */
import assert from 'node:assert/strict';

const ORIGIN = process.env.AWTS_STRESS_ORIGIN || 'http://127.0.0.1:8080';
const candidates = ['theOralTorah', 'oralTorah', 'torahSheBaalPeh', 'theOralLaw', 'oralLaw'];
const required = [
  '/',
  '/heichelos/ikar?view=series',
  '/heichelos/ikar/series/theWrittenTorah?view=series',
  '/api/social/heichelos/ikar',
  '/api/social/heichelos/ikar/series/root/details',
  '/api/social/heichelos/ikar/series/root/subSeries?details=true',
  '/api/social/heichelos/ikar/series/theWrittenTorah/details',
  '/api/social/heichelos/ikar/series/theWrittenTorah/subSeries?details=true'
];

async function hit(path) {
  const response = await fetch(ORIGIN + path, { cache: 'no-store' });
  const text = await response.text();
  assert.ok(response.ok, `${path} returned ${response.status}: ${text.slice(0, 200)}`);
  assert.ok(text.length > 0, `${path} returned empty body`);
  return { path, status: response.status, bytes: text.length, text };
}

const results = [];
for (const path of required) results.push(await hit(path));
const rootSubseries = results.find(item => item.path.includes('root/subSeries'))?.text || '';
const discovered = candidates.filter(id => rootSubseries.includes(id));
const oralResults = [];
for (const id of [...new Set([...discovered, ...candidates])]) {
  try {
    const details = await hit(`/api/social/heichelos/ikar/series/${id}/details`);
    oralResults.push({ id, status: details.status, bytes: details.bytes });
    break;
  } catch {}
}

console.log(JSON.stringify({ BH: 'B"H', pass: true, required: results.map(({ path, status, bytes }) => ({ path, status, bytes })), oralTorahProbe: oralResults[0] || null }, null, 2));
