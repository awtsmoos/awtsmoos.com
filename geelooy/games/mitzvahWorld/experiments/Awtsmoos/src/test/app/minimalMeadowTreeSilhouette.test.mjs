// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTreeSilhouette.test.mjs
 * @description Proves canonical species keep distinct silhouettes and six bounded material families.
 * The Awtsmoos lets pine, birch, ash, and oak carry recognizable crowns through shared geometry;
 * Awtsmoos.com verifies deterministic transforms, variation, and material-family bounds.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	minimalMeadowTreeSilhouette
} from '../../app/MinimalMeadowTreeSilhouette.js';
import {
	createMinimalMeadowTreeSpecification
} from '../../app/MinimalMeadowTreePlacementFactory.js';

test('B"H canonical species retain distinct silhouettes', () => {
	const silhouettes = ['Pine Small', 'Birch Small', 'Ash Small', 'Oak Small']
		.map(name => minimalMeadowTreeSilhouette(name, 0.5));
	assert.equal(new Set(silhouettes.map(value => value.id)).size, 4);
	assert.notDeepEqual(silhouettes[0].canopyScale, silhouettes[3].canopyScale);
	assert.notDeepEqual(silhouettes[1].trunkScale, silhouettes[2].trunkScale);
});

test('B"H ecology placement selects a bounded shared material family', () => {
	const terrain = {
		heightAt() {
			return 2;
		},
		slopeAt() {
			return 0.12;
		}
	};
	const specification = createMinimalMeadowTreeSpecification({
		grove: { climate: 'temperate', id: 'test-grove' },
		key: 71,
		presets: ['Pine Small', 'Birch Small', 'Ash Small', 'Oak Small'],
		terrain,
		x: 68,
		z: 42
	});
	assert.ok(specification);
	assert.ok(specification.materialVariant >= 0);
	assert.ok(specification.materialVariant < 6);
	assert.ok(specification.silhouette.id);
});
