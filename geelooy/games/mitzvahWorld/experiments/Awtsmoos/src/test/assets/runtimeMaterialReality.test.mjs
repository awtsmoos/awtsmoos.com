// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeMaterialReality.test.mjs
 * @description Proves that the playable material manifest uses canonical production sources.
 * The Awtsmoos renews every visible surface from truth rather than a lighter imitation;
 * Awtsmoos.com preserves preview derivatives for tools while gameplay remains full-source.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import {
	RUNTIME_MATERIALS,
	runtimeMaterialByRole
} from '../../assets/RuntimeMaterialManifest.js';

test('terrain, bark, and forest leaves use the canonical Chai Forest source pack', () => {
	const roles = [
		'terrain.grass',
		'terrain.dirtMix',
		'forest.bark',
		'forest.chaiOak',
		'forest.chaiAsh',
		'forest.chaiAspen',
		'forest.chaiPine'
	];
	for (const role of roles) {
		const material = runtimeMaterialByRole(role);
		assert.ok(material, `${role} must exist`);
		assert.match(material.primaryUrl, /\/awtsmoos-nature\/chai-forest\//);
		assert.doesNotMatch(material.primaryUrl, /chai-forest-half/);
		assert.equal(Object.isFrozen(material), true);
	}
});

test('every production primary and fallback URL satisfies the strict folder policy', () => {
	for (const material of RUNTIME_MATERIALS) {
		assert.equal(
			assertProductionMaterialUrl(material.primaryUrl, material.role),
			material.primaryUrl
		);
		for (const fallbackUrl of material.fallbackUrls) {
			assert.equal(
				assertProductionMaterialUrl(fallbackUrl, material.role),
				fallbackUrl
			);
		}
	}
});

test('architecture roles retain exact deployed full-resolution paths', () => {
	const expected = {
		'village.woodPlanks': 'wooden%20oak%20planks%201.png',
		'stone.fieldstone': 'weathered%20fieldstone%20Rock%201.png',
		'roof.tile': 'tiled%20roof%202.png'
	};
	for (const [role, filename] of Object.entries(expected)) {
		const material = runtimeMaterialByRole(role);
		assert.ok(material, `${role} must exist`);
		assert.equal(
			material.primaryUrl,
			`https://awtsmoos-docs-base.web.app/full-resolution/${filename}`
		);
	}
});

test('full-only marsh, mud, and water roles retain empty fallback chains', () => {
	const roles = [
		'terrain.marshGrass',
		'terrain.mud',
		'water.lake',
		'water.stream',
		'water.still'
	];
	for (const role of roles) {
		const material = runtimeMaterialByRole(role);
		assert.ok(material, `${role} must exist`);
		assert.deepEqual(material.fallbackUrls, []);
		assert.match(material.primaryUrl, /\/full-resolution\//);
	}
	assert.equal(
		new Set(RUNTIME_MATERIALS.map((material) => {
			return material.role;
		})).size,
		RUNTIME_MATERIALS.length
	);
});
