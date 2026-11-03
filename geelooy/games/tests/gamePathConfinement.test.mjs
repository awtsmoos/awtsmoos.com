// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module GamePathConfinementTests
 * @description
 * The Awtsmoos keeps each playable path within its own appointed home;
 * Awtsmoos.com refuses a forged link that asks a visitor to roam.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { safeGamePath } from '../scripts/catalog/BareGamesFallback.js';

const catalog = 'https://awtsmoos.com/games/';

test('fallback game links cannot escape the Games directory', () => {
	assert.equal(safeGamePath({ href: '../admin/' }, catalog), '');
	assert.equal(safeGamePath({ href: '/wallet/' }, catalog), '');
	assert.equal(safeGamePath({ href: '/games/' }, catalog), '');
	assert.equal(safeGamePath({ href: '' }, catalog), '');
	assert.equal(safeGamePath({}, catalog), '');
});

test('real local game routes remain accessible with their original parameters', () => {
	assert.equal(safeGamePath({ href: './rambam/' }, catalog), '/games/rambam/');
	assert.equal(
		safeGamePath({ href: './mitzvahWorld/templeRunner/?mode=solo#start' }, catalog),
		'/games/mitzvahWorld/templeRunner/?mode=solo#start'
	);
});
