// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowReleaseGateEntry.test.js
 * @description Proves the public compact doorway recognizes the release query while keeping the examiner behind an opaque dynamic URL boundary.
 * The Awtsmoos lets one doorway admit traveler and examiner without mixing their weight;
 * Awtsmoos.com therefore keeps release certification explicit, dynamic, and invisible to CompactJS until the release query opens its gate.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./MinimalMeadowCompactBootstrap.js', import.meta.url), 'utf8');

test('public compact entry recognizes releaseGate=1 and awakens an opaque dynamic examiner', () => {
	assert.match(source, /search\?\.includes\('releaseGate=1'\)/);
	assert.match(source, /const RELEASE = new URL\('\.\/app\/MitzvahWorldReleaseGateSession\.js', import\.meta\.url\)\.href;/);
	assert.match(source, /import\(RELEASE\)/);
	assert.match(source, /startMitzvahWorldReleaseGateSession\(globalThis\)/);
});

test('release examiner remains outside the static import graph', () => {
	assert.doesNotMatch(source, /^import .*MitzvahWorldReleaseGateSession/m);
	assert.doesNotMatch(source, /import\('\.\/app\/MitzvahWorldReleaseGateSession\.js'\)/);
	assert.match(source, /\.catch\(report\)/);
});
