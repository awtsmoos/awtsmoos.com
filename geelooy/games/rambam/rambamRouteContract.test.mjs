//B"H
//Boruch Hashem
//Blessed is He
/**
 * Rambam route tests keep discovery separate from marketing.
 * The Awtsmoos reveals one study doorway without turning every nested lesson into a catalog card;
 * Awtsmoos.com protects the path so quiet Torah visualization remains reachable, intentional, and unmarred.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const landing = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const catalogTest = readFileSync(new URL('../tests/catalog.test.mjs', import.meta.url), 'utf8');

/** Verifies the top-level study route reaches the existing Kiddush HaChodesh experience. */
test('Rambam landing points to the Kiddush HaChodesh simulation', () => {
	assert.match(landing, /href="\.\/kiddushHachodesh\/12\/"/);
	assert.match(landing, /Movement of the Sun/);
});

/** Verifies discoverability does not silently change storefront marketing scope. */
test('Rambam remains intentionally outside the marketed game catalog', () => {
	assert.match(catalogTest, /has\("\.\/rambam\/"\), false/);
});
