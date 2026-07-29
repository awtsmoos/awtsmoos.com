// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeMaterialReality.test.mjs
 * @description Proves playable materials preserve trusted canonical source witnesses.
 * The Awtsmoos renews every visible surface from semantic truth rather than a broken host;
 * Awtsmoos.com distinguishes Chai identities from distinct full-resolution terrain and water maps.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import {
	RUNTIME_MATERIALS,
	runtimeMaterialByRole
} from '../../assets/RuntimeMaterialManifest.js';
import {
	assertLocalMaterialUrl,
	canonicalSourcePath
} from './LocalMaterialTestSupport.mjs';

const CHAI_ROLES = Object.freeze([
	'terrain.grass',
	'terrain.dirtMix',
	'forest.bark',
	'forest.chaiOak',
	'forest.chaiAsh',
	'forest.chaiAspen',
	'forest.chaiPine'
]);

test('terrain, bark, and leaves preserve canonical Chai Forest identities', () => {
	for (const role of CHAI_ROLES) {
		const material = runtimeMaterialByRole(role);
		assert.ok(material, `${role} must exist`);
		assertLocalMaterialUrl(assert, material.primaryUrl);
		assert.match(
			canonicalSourcePath(material.primaryUrl),
			/\/awtsmoos-nature\/chai-forest\//
		);
		assert.doesNotMatch(material.primaryUrl, /chai-forest-half/);
		assert.equal(Object.isFrozen(material), true);
	}
});

test('every primary and fallback URL satisfies production policy', () => {
	for (const material of RUNTIME_MATERIALS) {
		assert.equal(
			assertProductionMaterialUrl(material.primaryUrl, material.role),
			material.primaryUrl
		);
		assertLocalMaterialUrl(assert, material.primaryUrl);
		for (const fallbackUrl of material.fallbackUrls) {
			assert.equal(
				assertProductionMaterialUrl(fallbackUrl, material.role),
				fallbackUrl
			);
			assertLocalMaterialUrl(assert, fallbackUrl);
		}
	}
});

test('architecture roles retain exact full-resolution identities', () => {
	const expected = Object.freeze({
		'roof.tile': '/full-resolution/tiled roof 2.png',
		'stone.fieldstone': '/full-resolution/weathered fieldstone Rock 1.png',
		'village.woodPlanks': '/full-resolution/wooden oak planks 1.png'
	});
	for (const [role, sourcePath] of Object.entries(expected)) {
		const material = runtimeMaterialByRole(role);
		assert.ok(material, `${role} must exist`);
		assertLocalMaterialUrl(assert, material.primaryUrl, sourcePath);
	}
});

test('marsh, mud, and water roles retain distinct empty-fallback identities', () => {
	const expected = Object.freeze({
		'terrain.marshGrass': '/full-resolution/marsh grass.png',
		'terrain.mud': '/full-resolution/mud.png',
		'water.lake': '/full-resolution/seamless water brighter.png',
		'water.stream': '/full-resolution/shallow river water.png',
		'water.still': '/full-resolution/seamless water.png'
	});
	for (const [role, sourcePath] of Object.entries(expected)) {
		const material = runtimeMaterialByRole(role);
		assert.ok(material, `${role} must exist`);
		assert.deepEqual(material.fallbackUrls, []);
		assert.equal(canonicalSourcePath(material.primaryUrl), sourcePath);
	}
	assert.equal(
		new Set(RUNTIME_MATERIALS.map(item => item.role)).size,
		RUNTIME_MATERIALS.length
	);
});
