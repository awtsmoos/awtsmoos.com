// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-material-signature.test.mjs
 * @description Prevents batching across sidedness or incompatible native pixel-density contracts.
 * The Awtsmoos unites forms without confusing their boundaries or scale; Awtsmoos.com keeps
 * distinct culling covenants and original-pixel measurements in separate renderer vessels.
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

test('pre-hydration signatures preserve distinct native-density policies', () => {
	const first = signature({
		texturePolicy: { nativeTexelDensity: true, texelsPerWorld: 96, tileWorld: 2 }
	});
	const second = signature({
		texturePolicy: { nativeTexelDensity: true, texelsPerWorld: 128, tileWorld: 2 }
	});
	assert.notEqual(first, second);
});

test('hydrated source dimensions become part of the effective repeat signature', () => {
	const sharedPolicy = { nativeTexelDensity: true, texelsPerWorld: 96, tileWorld: 2 };
	const first = signature({ mapImage: image(1024, 1024), texturePolicy: sharedPolicy });
	const second = signature({ mapImage: image(2048, 2048), texturePolicy: sharedPolicy });
	assert.notEqual(first, second);
});

function signature(options) {
	return materialSignature({
		geometry: { mode: 4 },
		material: {
			alphaMode: 'OPAQUE',
			color: [1, 1, 1, 1],
			mapRepeat: [1, 1],
			opacity: 1,
			...options
		},
		userData: {}
	});
}

function image(width, height) {
	return { complete: true, height, width };
}
