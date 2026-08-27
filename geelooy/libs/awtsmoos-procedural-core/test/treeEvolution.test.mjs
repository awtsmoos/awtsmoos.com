// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	TreeGenerator,
	generateTreeSkeleton,
	getTreeCapabilities
} from "../src/index.js";

const first = generateTreeSkeleton("Oak Medium");
const second = generateTreeSkeleton("Oak Medium");
assert.equal(first.contentHash, second.contentHash, "A seed must reproduce the same skeleton.");
assert.deepEqual(first.branches, second.branches, "Stable branch anatomy drifted.");

const leafy = generateTreeSkeleton({ preset: "Oak Medium", leaves: { count: 48 } });
const sparse = generateTreeSkeleton({ preset: "Oak Medium", leaves: { count: 2 } });
assert.deepEqual(leafy.branches, sparse.branches, "Foliage options perturbed the structural random stream.");

const lodSet = new TreeGenerator("Oak Medium").generateLODs();
assert.equal(lodSet.lods.length, 3);
assert.ok(lodSet.lods.every((lod) => lod.skeletonHash === lodSet.skeleton.contentHash));
for (let index = 1; index < lodSet.lods.length; index += 1) {
	const previous = lodSet.lods[index - 1].stats;
	const current = lodSet.lods[index].stats;
	assert.ok(current.branchTriangles <= previous.branchTriangles, "Branch LOD complexity must not rise.");
	assert.ok(current.leafTriangles <= previous.leafTriangles, "Leaf LOD complexity must not rise.");
}

assert.throws(
	() => new TreeGenerator("Oak Medium").generateLODs({ budget: { maxTriangles: 1 } }),
	(error) => error.code === "RESOURCE_BUDGET_EXCEEDED"
);

const capabilities = getTreeCapabilities();
assert.equal(capabilities.sharedSkeletonLods, true);
assert.equal(capabilities.rendererNeutral, true);
console.log(JSON.stringify({ skeletonHash: first.contentHash, lods: lodSet.lods.map((lod) => lod.stats) }, null, 2));
