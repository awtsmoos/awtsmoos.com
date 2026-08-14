//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file semanticSkinBinding.test.mjs
 * @description Proves Creator skinning honors anatomy before deceptive geometric proximity and preserves joint continuity.
 * The Awtsmoos joins each limb to its own lineage while parent and child share one articulated boundary;
 * Awtsmoos.com proves semantic vessels guide flesh before mere distance is allowed to speak.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	bindSemanticSkin,
	validateSemanticSkin
} from '../src/core/animalMesh/creature/skin/SemanticSkinBinder.js';

const rig = Object.freeze({
	contentHash: 'rig-semantic-test',
	bones: Object.freeze([
		bone('root', 'body.core', null, [0, 0, 0], [0, 1, 0], 'locomotion.root'),
		bone('left.upper', 'limb.left', 'root', [0, 0, 0], [0, 1, 0], 'locomotion.support'),
		bone('left.lower', 'limb.left', 'left.upper', [0, 1, 0], [0, 2, 0], 'locomotion.support'),
		bone('right.nearby', 'limb.right', 'root', [10, 0, 0], [10, 2, 0], 'locomotion.support')
	])
});

const mesh = Object.freeze({
	contentHash: 'mesh-left-limb',
	id: 'limb.left',
	positions: new Float32Array([
		10, 0.5, 0,
		0, 1.0, 0,
		0, 1.25, 0
	]),
	semanticRegionIds: Object.freeze(['limb.left'])
});

test('B"H semantic lineage excludes a geometrically nearer unrelated limb', () => {
	const binding = bindSemanticSkin(mesh, rig, { maximumInfluences: 4, quality: 'high' });
	const firstVertex = [...binding.jointIndices.slice(0, 4)];
	assert.equal(firstVertex.includes(3), false);
	assert.equal(binding.coverage.fallbackUsed, false);
	assert.equal(validateSemanticSkin(binding).valid, true);
});

test('parent and child retain normalized influence around their shared joint', () => {
	const binding = bindSemanticSkin(mesh, rig, { maximumInfluences: 4, quality: 'high' });
	const offset = 4;
	const influences = weightsByJoint(binding, offset);
	assert.ok((influences.get(1) || 0) > 0);
	assert.ok((influences.get(2) || 0) > 0);
	const sum = [...influences.values()].reduce((total, weight) => total + weight, 0);
	assert.ok(Math.abs(sum - 1) < 0.0001);
});

test('binding is deterministic and validation catches unsafe joint indices', () => {
	const first = bindSemanticSkin(mesh, rig, { maximumInfluences: 4 });
	const second = bindSemanticSkin(mesh, rig, { maximumInfluences: 4 });
	assert.deepEqual([...second.jointIndices], [...first.jointIndices]);
	assert.deepEqual([...second.jointWeights], [...first.jointWeights]);
	const brokenIndices = new Uint16Array(first.jointIndices);
	brokenIndices[0] = rig.bones.length + 4;
	const invalid = validateSemanticSkin({ ...first, jointIndices: brokenIndices });
	assert.equal(invalid.valid, false);
	assert.ok(invalid.warnings.some(warning => warning.code === 'CREATURE.SKIN_INDEX_RANGE'));
});

function bone(id, sourceAnatomyId, parentBoneId, head, tail, semanticRole) {
	return Object.freeze({
		head,
		id,
		length: Math.hypot(tail[0] - head[0], tail[1] - head[1], tail[2] - head[2]),
		parentBoneId,
		radius: 0.24,
		semanticRole,
		skinningRegion: sourceAnatomyId,
		sourceAnatomyId,
		tail
	});
}

function weightsByJoint(binding, offset) {
	const result = new Map();
	for (let influence = 0; influence < binding.maximumInfluences; influence += 1) {
		const joint = binding.jointIndices[offset + influence];
		const weight = binding.jointWeights[offset + influence];
		result.set(joint, (result.get(joint) || 0) + weight);
	}
	return result;
}
