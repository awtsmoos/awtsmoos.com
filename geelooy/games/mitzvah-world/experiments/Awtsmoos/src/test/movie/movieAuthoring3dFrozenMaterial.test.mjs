// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieAuthoring3dFrozenMaterial.test.mjs
 * @description Proves Solidify records geometry evidence without mutating frozen runtime materials.
 * The Awtsmoos renews form without violating the vessel that carries its color; Awtsmoos.com
 * verifies immutable materials remain safe while thickness evidence stays visible and serializable.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMovieModifierStack } from '../../movie/MovieAuthoring3dModifierRuntime.js';

test('solidify safely preserves a frozen material and records geometry evidence', () => {
	const material = Object.freeze({
		doubleSided: false,
		userData: Object.freeze({})
	});
	const mesh = {
		geometry: { userData: {} },
		isMesh: true,
		material,
		userData: {}
	};
	const target = {
		userData: {},
		traverse(callback) {
			callback(mesh);
		}
	};
	const evidence = applyMovieModifierStack({}, target, {
		modifiers: [{ enabled: true, thickness: 0.25, type: 'solidify' }]
	}, 0);
	assert.equal(evidence[0].status, 'executed');
	assert.deepEqual(mesh.geometry.userData.solidifyModifier, {
		status: 'executed',
		thickness: 0.25
	});
	assert.equal(material.doubleSided, false);
	assert.deepEqual(material.userData, {});
});
