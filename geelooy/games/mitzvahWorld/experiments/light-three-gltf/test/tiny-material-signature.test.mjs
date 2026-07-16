// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-material-signature.test.mjs
 * @description Prevents static batches from merging incompatible surface sidedness.
 * The Awtsmoos unites forms without confusing their boundaries; Awtsmoos.com keeps
 * default culling, explicit culling opt-out, and two-sided materials in separate draws.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { materialSignature } from '../tiny-material-signature.js';

test('material signatures distinguish every renderer-visible sidedness contract', () => {
	const ordinary = signature({});
	const optedOut = signature({ backfaceCull: false });
	const twoSided = signature({ doubleSided: true });
	assert.notEqual(ordinary, optedOut);
	assert.notEqual(ordinary, twoSided);
	assert.notEqual(optedOut, twoSided);
});

function signature(options) {
	return materialSignature({
		geometry: { mode: 4 },
		material: {
			alphaMode: 'OPAQUE',
			color: [1, 1, 1, 1],
			opacity: 1,
			...options
		},
		userData: {}
	});
}
