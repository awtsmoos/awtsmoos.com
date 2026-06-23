// B"H
/**
 * Read-only guard for the Ikar Heichel and Torah series.
 *
 * This vessel never mutates DB, never creates content, and never writes social data.
 * It verifies that the public Ikar/Torah surfaces and the known Oral Torah node
 * remain readable after Social Civilization media work.
 */
import assert from 'node:assert/strict';

const ORIGIN = process.env.AWTS_STRESS_ORIGIN || 'http://127.0.0.1:8080';
const ORAL_TORAH_ID = 'theOralTorah';
const oralTorahCandidates = [ORAL_TORAH_ID, 'oralTorah', 'torahSheBaalPeh', 'theOralLaw', 'oralLaw'];
const required = [
  '/',
  '/heichelos/ikar?view=series',
  '/heichelos/ikar/series/theWrittenTorah?view=series',
  `/heichelos/ikar/series/${ORAL_TORAH_ID}?view=series`,
  '/api/social/heichelos/ikar',
  '/api/social/heichelos/ikar/series/root/details',
  '/api/social/heichelos/ikar/series/root/subSeries?details=true',
  '/api/social/heichelos/ikar/series/theWrittenTorah/details',
  '/api/social/heichelos/ikar/series/theWrittenTorah/subSeries?details=true',
  `/api/social/heichelos/ikar/series/${ORAL_TORAH_ID}/details`,
  `/api/social/heichelos/ikar/series/${ORAL_TORAH_ID}/subSeries?details=true`
];

async function hit(path) {
  const response = await fetch(ORIGIN + path, { cache: 'no-store' });
  const body = await response.text();
  assert.ok(response.ok, `${path} returned ${response.status}: ${body.slice(0, 200)}`);
  assert.ok(body.length > 0, `${path} returned empty body`);
  return { path, status: response.status, bytes: body.length, body };
}

function findOralTorahId(rootSubseriesText) {
  return oralTorahCandidates.find(id => rootSubseriesText.includes(id)) || null;
}

const results = [];
for (const path of required) results.push(await hit(path));

const rootSubseries = results.find(item => item.path.includes('root/subSeries'))?.body || '';
const discoveredOralTorahId = findOralTorahId(rootSubseries);
assert.equal(discoveredOralTorahId, ORAL_TORAH_ID, `Expected Oral Torah id ${ORAL_TORAH_ID}, found ${discoveredOralTorahId || 'none'}`);

console.log(JSON.stringify({
  BH: 'B"H',
  pass: true,
  oralTorahId: ORAL_TORAH_ID,
  required: results.map(({ path, status, bytes }) => ({ path, status, bytes }))
}, null, 2));
