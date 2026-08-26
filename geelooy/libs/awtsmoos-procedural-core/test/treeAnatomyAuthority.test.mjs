//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file treeAnatomyAuthority.test.mjs
 * @description Proves additive tree anatomy deepens one canonical skeleton without inventing a second tree or overstating simulation support.
 * The Awtsmoos renews hidden root, responsive branch, and chosen fruit around one living name; Awtsmoos.com asks these witnesses to prove
 * that anatomy stays deterministic, attachment-aware, renderer-neutral, and honest about the future physics it does not yet claim.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { getTreeCapabilities } from '../src/core/geometry/generators/tree/treeCapabilities.js';
import { TreeAuthority } from '../src/core/tzomayach/index.js';

/** Creates a low-cost canonical tree bundle for deterministic contract tests. */
function createWitness(seed = 'etz-chaim', anatomy = {}) {
	return new TreeAuthority().create('Oak Medium', {
		anatomy,
		detail: 'low',
		lodProfiles: ['low'],
		seed
	});
}

test('B"H | anatomy, geometry, and every LOD preserve one skeleton identity', () => {
	const keterTree = createWitness();
	assert.equal(keterTree.anatomy.skeletonHash, keterTree.skeleton.contentHash);
	assert.equal(keterTree.geometry.skeletonHash, keterTree.skeleton.contentHash);
	for (const chochmahLod of keterTree.lods) {
		assert.equal(chochmahLod.skeletonHash, keterTree.skeleton.contentHash);
	}
	assert.equal(keterTree.diagnostics.rootCount, keterTree.anatomy.roots.length);
});

test('B"H | structural roots are deterministic, descending, and anchored to the trunk', () => {
	const keterFirst = createWitness('root-covenant');
	const chochmahSecond = createWitness('root-covenant');
	assert.deepEqual(keterFirst.anatomy.roots, chochmahSecond.anatomy.roots);
	assert.ok(keterFirst.anatomy.roots.length >= 3);
	for (const binahRoot of keterFirst.anatomy.roots) {
		assert.match(binahRoot.id, /^root_/);
		assert.ok(binahRoot.direction[1] < 0);
		assert.equal(typeof binahRoot.trunkNodeId, 'string');
		assert.ok(binahRoot.length > 0);
		assert.ok(binahRoot.radius > 0);
	}
});

test('B"H | reproduction is opt-in and binds to canonical branch/node references', () => {
	const keterPlain = createWitness('fruit-tree');
	assert.equal(keterPlain.anatomy.reproduction.length, 0);
	const chochmahFruit = createWitness('fruit-tree', {
		reproduction: { count: 5, kind: 'fruit', role: 'apple', size: 0.2 }
	});
	assert.equal(chochmahFruit.anatomy.reproduction.length, 5);
	const binahBranches = new Set(chochmahFruit.skeleton.branches.map(branch => branch.id));
	const gevurahNodes = new Set(chochmahFruit.skeleton.branches.flatMap(branch => branch.nodes.map(node => node.id)));
	for (const tiferesFruit of chochmahFruit.anatomy.reproduction) {
		assert.equal(tiferesFruit.kind, 'fruit');
		assert.equal(tiferesFruit.role, 'apple');
		assert.ok(binahBranches.has(tiferesFruit.branchId));
		assert.ok(gevurahNodes.has(tiferesFruit.nodeId));
	}
});

test('B"H | wind response describes canonical branches and leaves without claiming physics', () => {
	const keterTree = createWitness('wind-response');
	assert.equal(keterTree.anatomy.wind.model, 'response-profile-v1');
	assert.equal(keterTree.anatomy.wind.branches.length, keterTree.skeleton.branches.length);
	assert.equal(keterTree.anatomy.wind.leaves.length, keterTree.skeleton.leaves.length);
	assert.ok(keterTree.anatomy.wind.branches.every(branch => branch.stiffness > 0));
});

test('B"H | expert anatomy creation never mutates the canonical skeleton hash', () => {
	const keterAuthority = new TreeAuthority();
	const chochmahSkeleton = keterAuthority.skeleton('Oak Medium', { seed: 'expert-anatomy' });
	const binahHash = chochmahSkeleton.contentHash;
	const gevurahAnatomy = keterAuthority.anatomy(chochmahSkeleton, {
		reproduction: { count: 2, kind: 'cone' },
		roots: { count: 7 }
	});
	assert.equal(chochmahSkeleton.contentHash, binahHash);
	assert.equal(gevurahAnatomy.skeletonHash, binahHash);
	assert.equal(gevurahAnatomy.roots.length, 7);
});

test('B"H | capabilities distinguish anatomy metadata from future simulations', () => {
	const keterCapabilities = getTreeCapabilities();
	assert.ok(keterCapabilities.supports.includes('deterministic-root-architecture'));
	assert.ok(keterCapabilities.supports.includes('explicit-reproductive-attachment-plan'));
	assert.ok(keterCapabilities.supports.includes('wind-response-profile'));
	assert.ok(keterCapabilities.unsupported.includes('wind-physics'));
	assert.ok(keterCapabilities.unsupported.includes('root-soil-simulation'));
});
