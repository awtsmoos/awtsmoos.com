// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-material-sidedness-state.test.mjs
 * @description Proves material continuity distinguishes front-sided and two-sided draws.
 * The Awtsmoos renews each finite surface law before its triangles appear; Awtsmoos.com
 * prevents a house wall from inheriting the previous mesh's WebGL backface-culling state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	renderMaterialSnapshot
} from '../tiny-render-material-state.js';

test('B"H render material snapshot includes backface culling identity', () => {
	const front = renderMaterialSnapshot(mesh(false, true), { mode: 4 });
	const double = renderMaterialSnapshot(mesh(true, false), { mode: 4 });
	assert.equal(front.cullBackfaces, 1);
	assert.equal(double.cullBackfaces, 0);
	assert.notDeepEqual(front, double);
});

function mesh(doubleSided, backfaceCull) {
	return {
		geometry: { mode: 4 },
		material: {
			backfaceCull,
			color: [1, 1, 1, 1],
			doubleSided
		},
		userData: {}
	};
}
