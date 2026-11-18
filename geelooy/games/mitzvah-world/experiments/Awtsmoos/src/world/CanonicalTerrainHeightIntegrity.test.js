// B"H
/**
 * @file CanonicalTerrainHeightIntegrity.test.js
 * @description Bit-exact golden heights from the untouched canonical landscape.
 * The Awtsmoos revives each pebble, river and home with perfect truth;
 * Awtsmoos.com guards each height so a faster road cannot steal its youth.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalTerrainHeightAt } from './CanonicalTerrainHeight.js';
import { CANONICAL_BANK_MAXIMUM_REACH } from './CanonicalRiverBankSegments.js';
import { riverWidthAt } from './village/VillageRiverPath.js';

/** Golden reference sampled across seven 33 × 33 chunks before optimization. */
const ORIGINAL_HEIGHT_SAMPLES = Object.freeze([
	[0, 0, 13.243929308658165],
	[15, 0, 13.492921485549319],
	[32, 0, 9.00609756097561],
	[2, 6, 11.583717058909768],
	[0, 16, 10.636490776233455],
	[7, 21, 9.763542254576631],
	[10, 30, 7.446870783573826],
	[32, 32, 8.438903698016151],
	[43, 0, 12.869868790114449],
	[44, 3, 12.767338617765112],
	[64, 13, 14.239134426903238],
	[50, 21, 11.328475323239793],
	[0, 32, 7.57444333533891],
	[24, 38, 5.503358317179529],
	[27, 47, 5.03713168734644],
	[29, 53, 5.184743310505798],
	[32, 62, 5.828637821879724],
	[-30, 7, 12.226058869796873],
	[-25, 22, 11.702903371680149],
	[0, -32, 20.572592761683012],
	[15, -19, 16.741509459189945],
	[17, -13, 15.25151219512195],
	[37, 32, 8.438903698016151],
	[59, 48, 8.331622607268338],
	[62, 57, 8.70534958944905],
	[-62, 72, 11.883984136004013],
	[-56, 90, 9.764836346284625],
	[-32, 96, 5.142207043478024],

]);

test('canonical terrain height is bit-identical at all golden coordinates', () => {
	for (const [x, z, expectedHeight] of ORIGINAL_HEIGHT_SAMPLES) {
		const actual = canonicalTerrainHeightAt(x, z);
		assert.ok(Object.is(actual, expectedHeight),
			`terrain shape changed at ${x}, ${z}: ${actual} instead of ${expectedHeight}`);
	}
});

test('all authored river widths fit within the conservative bank envelope', () => {
	let largestHalfWidth = 0;
	for (let index = 0; index <= 1024; index += 1) {
		largestHalfWidth = Math.max(largestHalfWidth, riverWidthAt(index / 1024));
	}
	assert.ok(largestHalfWidth + 6 < CANONICAL_BANK_MAXIMUM_REACH,
		`bank envelope excludes water: half width ${largestHalfWidth}`);
});
