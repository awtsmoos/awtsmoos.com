// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file profileCardUX.test.mjs
 * @description
 * The Awtsmoos proves profile post cards reveal human context and the real post doorway,
 * while composition/comment actions remain conditional on an active public alias.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { openPath, postContext } from '../js/profile/PostCard.js';

const source = readFileSync(new URL('../js/profile/PostCard.js', import.meta.url), 'utf8');

test('post context is human-readable instead of a raw slash coordinate', () => {
	assert.equal(postContext({
		heichelName: 'Torah Worlds',
		seriesName: 'Bereishis',
		heichelId: 'internal-heichel',
		seriesId: 'internal-series'
	}), 'Torah Worlds · Bereishis');
	assert.doesNotMatch(source, /canonicalCoordinate|<code>/);
});

test('open action preserves explicit post path and remains primary', () => {
	assert.equal(openPath({ path: '/heichelos/ikar/post/BH_POST_1' }, 'BH_POST_1'), '/heichelos/ikar/post/BH_POST_1');
	assert.match(source, /Open post →/);
	assert.match(source, /profileCardPrimaryAction/);
});

test('alias-owned Add and Comment actions are conditional', () => {
	assert.match(source, /if \(!aliasId\) return/);
	assert.match(source, /Add to Heichel/);
	assert.match(source, /Comment/);
});
