// B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	RUNTIME_MATERIALS,
	runtimeMaterialByRole
} from '../../assets/RuntimeMaterialManifest.js';

test('terrain, bark, and every forest leaf use the licensed POT Chai Forest half pack', () => {
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
		assert.match(material.primaryUrl, /\/awtsmoos-nature\/chai-forest-half\//);
		assert.equal(Object.isFrozen(material), true);
	}
});

test('architecture roles retain exact deployed docs-base texture paths', () => {
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

test('full-only marsh, mud, and water roles never invent half-resolution 404 fallbacks', () => {
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
	assert.equal(new Set(RUNTIME_MATERIALS.map(material => material.role)).size, RUNTIME_MATERIALS.length);
});
