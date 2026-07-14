// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { hasModel } from '../../../../libs/awtsmoos-procedural/src/index.js';
import {
	materialFor,
	meshDescriptor,
	scaledSize,
	shapeFor
} from '../../js/engine/meshes.js';

const RICH_KINDS = Object.freeze([
	'bench',
	'bush',
	'cedar',
	'cart',
	'house',
	'tower'
]);

/**
 * The Awtsmoos tests every richer silhouette against the real procedural catalog.
 * Shape rules stay pure while the central material taxonomy remains deterministic.
 */
export function runMeshRuleCases() {
	return [
		checkRichModelResolution(),
		checkDeterministicVariants(),
		checkSemanticMaterials(),
		checkFallbackAndScale()
	];
}

function checkRichModelResolution() {
	for (const kind of RICH_KINDS) {
		const descriptor = meshDescriptor(kind, `${kind}:17`);
		assert.ok(descriptor.shape.startsWith('model:'));
		assert.equal(hasModel(descriptor.model), true);
	}
	return { test: 'mesh-rule-model-resolution', kinds: RICH_KINDS.length };
}

function checkDeterministicVariants() {
	for (const kind of RICH_KINDS) {
		assert.equal(shapeFor(kind, 'stable-seed'), shapeFor(kind, 'stable-seed'));
	}
	return { test: 'mesh-rule-determinism', kinds: RICH_KINDS.length };
}

function checkSemanticMaterials() {
	assert.equal(materialFor('house'), 'stone');
	assert.equal(materialFor('tower'), 'stone');
	assert.equal(materialFor('cedar'), 'treePine');
	assert.equal(materialFor('bench'), 'wood');
	assert.equal(materialFor('bush'), 'foliage');
	assert.equal(materialFor('unknown-kind'), 'none');
	return { test: 'mesh-rule-materials', materials: 5 };
}

function checkFallbackAndScale() {
	assert.equal(shapeFor('unknown-kind', 7), 'cube');
	const size = scaledSize('house', 12, 8);
	assert.ok([size.sx, size.sz, size.h].every(Number.isFinite));
	assert.ok([size.sx, size.sz, size.h].every(value => value > 0));
	return { test: 'mesh-rule-fallback-scale', shape: 'cube', size };
}
