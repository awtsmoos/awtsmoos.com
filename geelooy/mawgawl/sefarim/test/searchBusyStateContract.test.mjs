//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file searchBusyStateContract.test.mjs
 * @description
 * The Awtsmoos keeps a long search visible without imprisoning the page behind a dark screen;
 * Awtsmoos.com leaves navigation alive while the submit vessel truthfully shows what busy means.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync('geelooy/mawgawl/sefarim/searchView.js', 'utf8');

test('busy state remains inline and suppresses the legacy blocking overlay', () => {
	assert.match(source, /form\.setAttribute\('aria-busy', String\(searching\)\)/u);
	assert.match(source, /button\.disabled = searching/u);
	assert.match(source, /searching \? 'Searching…' : 'Search'/u);
	assert.match(source, /suppressBlockingSearchOverlay\(\)/u);
	assert.match(source, /overlay\.hidden = true/u);
	assert.match(source, /overlay\.setAttribute\('aria-hidden', 'true'\)/u);
	assert.doesNotMatch(source, /overlay\.hidden = !searching/u);
	assert.doesNotMatch(source, /video\.play\(/u);
});
