// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals one stable tree before detail divides into many meshes.
 * These Awtsmoos.com proofs use a tiny fixture to verify canonical structure,
 * trellis influence, twist lineage, shared LOD identity, and resource refusal.
 */

import assert from "node:assert/strict";
import {
	TreeGenerator,
	TreeSkeletonGenerator,
	generateTreeLods,
	generateTreeSkeleton,
	resolveTreeConfig
} from "../src/index.js";

const branch = {
	levels: 1,
	children: { 0: 2, 1: 0 },
	sections: { 0: 3, 1: 2 },
	segments: { 0: 5, 1: 4 },
	length: { 0: 4, 1: 2 },
	radius: { 0: 0.5, 1: 0.2 },
	taper: { 0: 0.7, 1: 0.8 },
	angle: { 1: 50 },
	start: { 1: 0.3 },
	gnarliness: { 0: 0.03, 1: 0.04 },
	twist: { 0: 90, 1: -35 }
};
const base = {
	preset: "Oak Medium",
	seed: 7001,
	maxBranches: 6,
	branch,
	leaves: { count: 2 }
};

const first = generateTreeSkeleton(base);
const second = generateTreeSkeleton(base);
assert.equal(first.contentHash, second.contentHash);
assert.deepEqual(first.branches, second.branches);
assert.ok(first.branches.flatMap((entry) => entry.nodes).every(
	(node) => Number.isFinite(node.twist) && node.position.every(Number.isFinite)
));
assert.ok(first.branches.some((entry) => entry.nodes.some((node) => node.twist !== 0)));

const reusable = new TreeSkeletonGenerator(resolveTreeConfig(base));
assert.equal(reusable.generate().contentHash, reusable.generate().contentHash);

const trained = generateTreeSkeleton({
	...base,
	trellis: {
		enabled: true,
		position: { x: 0, y: 0, z: 1 },
		width: 8,
		height: 8,
		spacing: 2,
		force: { strength: 0.2, maxDistance: 8, falloff: 1 }
	}
});
const free = generateTreeSkeleton({ ...base, trellis: { enabled: false } });
assert.equal(trained.branches.length, free.branches.length);
assert.equal(
	trained.branches.reduce((sum, entry) => sum + entry.nodes.length, 0),
	free.branches.reduce((sum, entry) => sum + entry.nodes.length, 0)
);
assert.notEqual(trained.contentHash, free.contentHash);

const lodSet = generateTreeLods(base);
assert.equal(lodSet.lods.length, 3);
assert.ok(lodSet.lods.every((lod) => lod.skeletonHash === lodSet.skeleton.contentHash));
for (let index = 1; index < lodSet.lods.length; index += 1) {
	assert.ok(lodSet.lods[index].stats.branchTriangles <= lodSet.lods[index - 1].stats.branchTriangles);
}
assert.throws(
	() => new TreeGenerator(base).generateLODs({ budget: { maxTriangles: 1 } }),
	(error) => error?.code === "RESOURCE_BUDGET_EXCEEDED"
);

console.log('B"H | treeSkeletonAdvanced.test.mjs passed');
