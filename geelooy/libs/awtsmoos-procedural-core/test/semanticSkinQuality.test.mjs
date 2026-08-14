// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file semanticSkinQuality.test.mjs
 * @description Proves Creator skin quality evidence is bounded, deterministic, and deformation-neutral.
 * The Awtsmoos gives each influence its measure without altering its portion; Awtsmoos.com proves the witness
 * can name confidence, ambiguity, rigidity, and fallback while the typed skin arrays remain exactly themselves.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { bindSemanticSkin } from '../src/core/animalMesh/creature/skin/SemanticSkinBinder.js';
import { analyzeSemanticSkinQuality } from '../src/core/animalMesh/creature/skin/SemanticSkinQuality.js';

test('B"H quality analysis is deterministic, bounded, and does not mutate weights', () => {
	const binding = fakeBinding(false);
	const before = [...binding.jointWeights];
	const first = analyzeSemanticSkinQuality(binding);
	const second = analyzeSemanticSkinQuality(binding);
	assert.deepEqual(second, first);
	assert.deepEqual([...binding.jointWeights], before);
	assert.equal(first.vertexCount, 3);
	assert.equal(first.rigidVertexCount, 1);
	assert.ok(first.ambiguousVertexCount >= 1);
	for (const key of ['ambiguousRatio', 'confidenceScore', 'meanDominantWeight', 'meanNormalizedEntropy', 'rigidRatio']) {
		assert.ok(first[key] >= 0 && first[key] <= 1, key);
	}
	assert.ok(first.effectiveInfluenceMean >= 1 && first.effectiveInfluenceMean <= 4);
});

test('fallback coverage produces a deterministic quality warning', () => {
	const quality = analyzeSemanticSkinQuality(fakeBinding(true));
	assert.equal(quality.fallbackUsed, true);
	assert.ok(quality.warnings.some(warning => warning.code === 'CREATURE.SKIN_QUALITY_FALLBACK'));
});

test('canonical semantic binder publishes quality beside unchanged typed arrays', () => {
	const mesh = {
		contentHash: 'quality-mesh',
		id: 'limb.left',
		positions: new Float32Array([0, 0.4, 0, 0, 0.95, 0]),
		semanticRegionIds: ['limb.left']
	};
	const rig = {
		contentHash: 'quality-rig',
		bones: [
			bone('root', 'body.core', null, [0, 0, 0], [0, 1, 0]),
			bone('left.upper', 'limb.left', 'root', [0, 0, 0], [0, 1, 0]),
			bone('left.lower', 'limb.left', 'left.upper', [0, 1, 0], [0, 2, 0])
		]
	};
	const binding = bindSemanticSkin(mesh, rig, { maximumInfluences: 4, quality: 'high' });
	assert.equal(binding.jointIndices instanceof Uint16Array, true);
	assert.equal(binding.jointWeights instanceof Float32Array, true);
	assert.equal(Object.isFrozen(binding.quality), true);
	assert.equal(binding.quality.vertexCount, 2);
	assert.equal(Number.isFinite(binding.quality.confidenceScore), true);
});

function fakeBinding(fallbackUsed) {
	return {
		coverage: {
			candidateCount: 3,
			fallbackUsed,
			semanticRegionCount: fallbackUsed ? 0 : 1
		},
		jointWeights: new Float32Array([
			1, 0, 0, 0,
			0.5, 0.5, 0, 0,
			0.45, 0.3, 0.2, 0.05
		]),
		maximumInfluences: 4
	};
}

function bone(id, sourceAnatomyId, parentBoneId, head, tail) {
	return {
		head,
		id,
		length: Math.hypot(tail[0] - head[0], tail[1] - head[1], tail[2] - head[2]),
		parentBoneId,
		radius: 0.2,
		semanticRole: 'locomotion.support',
		skinningRegion: sourceAnatomyId,
		sourceAnatomyId,
		tail
	};
}
