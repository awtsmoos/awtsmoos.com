// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos renews one seed into many faithful geometric vessels. */
import assert from "node:assert/strict";
import {
	TreeGenerator,
	generateTreeProceduralData,
	resolveTreeConfig
} from "../src/index.js";

const compactConfig = {
	preset: "Oak Medium",
	seed: 90210,
	maxBranches: 80,
	branch: {
		children: { 0: 3, 1: 2, 2: 1 },
		sections: { 0: 8, 1: 6, 2: 4, 3: 3 },
		segments: { 0: 8, 1: 7, 2: 6, 3: 5 },
		twist: { 0: 70, 1: 35, 2: 18, 3: 8 }
	},
	leaves: { count: 12 }
};

const resolved = resolveTreeConfig(compactConfig);
assert.equal(resolved.branch.children[0], 3);
assert.ok(resolved.branch.length[0] > 0, "Deep overrides must preserve untouched preset keys.");

const generator = new TreeGenerator(compactConfig);
const first = generator.generate();
const second = generator.generate();
assert.deepEqual(first.branches.positions, second.branches.positions);
assert.deepEqual(first.leaves.positions, second.leaves.positions);
assert.equal(first.stats.branchVertices, second.stats.branchVertices, "Generator reuse must not accumulate buffers.");

const untwisted = generateTreeProceduralData({
	...compactConfig,
	branch: { ...compactConfig.branch, twist: { 0: 0, 1: 0, 2: 0, 3: 0 } }
});
assert.equal(first.stats.branchTriangles, untwisted.stats.branchTriangles);
assert.notDeepEqual(first.branches.positions, untwisted.branches.positions, "Twist must affect branch frames.");

const lods = generator.generateLODs();
assert.equal(lods.length, 3);
assert.ok(lods[0].stats.branchTriangles >= lods[1].stats.branchTriangles);
assert.ok(lods[1].stats.branchTriangles >= lods[2].stats.branchTriangles);
assert.ok(lods[0].stats.leafTriangles >= lods[1].stats.leafTriangles);
assert.ok(lods[1].stats.leafTriangles >= lods[2].stats.leafTriangles);
assert.equal(new Set(lods.map((lod) => lod.metadata.skeletonSignature)).size, 1,
	"Every LOD must derive from the same planned skeleton.");

for (const lod of lods) {
	assert.ok(lod.memoryEstimate.totalBytes > 0);
	assert.ok(lod.bounds.size.every(Number.isFinite));
	assert.equal(lod.metadata.rendererNeutral, true);
}

console.log('B"H | treeGeneratorAdvanced.test.mjs passed');
