// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file functionalHouseStaticBatch.test.mjs
 * @description Proves fixed house surfaces may batch while every dynamic vessel stays separate.
 * The Awtsmoos renews wall and doorway through one will; Awtsmoos.com tests that still
 * masonry may unite, but doors, reactive grass, transparency, and living motion never do.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { staticBatchMetadata } from '../../../../light-three-gltf/tiny-static-batch-policy.js';
import {
	createStaticBatchStats,
	recordStaticBatchGroup
} from '../../../../light-three-gltf/tiny-static-batch-stats.js';

function houseMesh(options = {}) {
	const parent = {
		name: options.parentName || 'AwtsmoosHouse',
		parent: null,
		userData: {
			family: 'functional-house',
			...(options.parentUserData || {})
		}
	};
	return {
		geometry: { mode: 4 },
		isSkinnedMesh: false,
		material: {
			opacity: options.opacity ?? 1,
			transparent: options.transparent || false
		},
		name: options.name || 'AwtsmoosHouseWall',
		parent,
		userData: options.userData || {}
	};
}

test('fixed functional-house surfaces are certified for conservative batching', () => {
	const metadata = staticBatchMetadata(houseMesh());
	assert.equal(metadata.family, 'functional-house');
});

test('doors, dynamic definitions, reactive grass, and transparency remain excluded', () => {
	assert.equal(staticBatchMetadata(houseMesh({ name: 'AwtsmoosDoorPanel' })), null);
	assert.equal(staticBatchMetadata(houseMesh({
		parentUserData: { dynamic: true }
	})), null);
	assert.equal(staticBatchMetadata(houseMesh({
		userData: { AwtsmoosYardGrass: { reactsToPlayer: true } }
	})), null);
	assert.equal(staticBatchMetadata(houseMesh({ transparent: true })), null);
});

test('batch statistics expose singleton and mergeable family opportunity', () => {
	const stats = createStaticBatchStats();
	recordStaticBatchGroup(stats, [{ metadata: { family: 'functional-house' } }]);
	recordStaticBatchGroup(stats, [
		{ metadata: { family: 'functional-house' } },
		{ metadata: { family: 'functional-house' } },
		{ metadata: { family: 'functional-house' } }
	]);
	assert.equal(stats.candidateGroups, 2);
	assert.equal(stats.candidateMeshes, 4);
	assert.equal(stats.singletonGroups, 1);
	assert.equal(stats.mergeableGroups, 1);
	assert.equal(stats.potentialSavedDraws, 2);
	assert.equal(stats.families['functional-house'].meshes, 4);
});
