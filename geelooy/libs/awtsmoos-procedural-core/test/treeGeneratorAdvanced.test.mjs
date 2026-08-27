// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews one mesh generator without carrying yesterday's arrays.
 * These Awtsmoos.com proofs isolate deep overrides, reuse, twist, measured
 * reports, trellis attraction, and topology-stable deformation from LOD tests.
 */

import assert from "node:assert/strict";
import {
	TreeGenerator,
	calculateTreeTrellisForce,
	generateTreeProceduralData,
	nearestTreeTrellisPoint,
	normalizeTreeTrellis,
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
	seed: 90210,
	maxBranches: 6,
	branch,
	leaves: { count: 2 }
};

const resolved = resolveTreeConfig(base);
assert.equal(resolved.branch.children[0], 2);
assert.ok(resolved.bark && resolved.branch.force);

const generator = new TreeGenerator(base);
const first = generator.generate();
const second = generator.generate();
assert.deepEqual(first.branches.positions, second.branches.positions);
assert.deepEqual(first.leaves.positions, second.leaves.positions);
assert.deepEqual(first.stats, second.stats);
assert.ok(first.memoryEstimate.totalBytes > 0);
assert.ok(first.bounds.size.every(Number.isFinite));
assert.equal(first.metadata.rendererNeutral, true);

const untwisted = generateTreeProceduralData({
	...base,
	branch: { ...branch, twist: { 0: 0, 1: 0 } }
});
assert.equal(first.stats.branchTriangles, untwisted.stats.branchTriangles);
assert.notDeepEqual(first.branches.positions, untwisted.branches.positions);

const trellis = normalizeTreeTrellis({
	enabled: true,
	position: { x: 0, y: 0, z: 1 },
	width: 8,
	height: 8,
	spacing: 2,
	force: { strength: 0.2, maxDistance: 8, falloff: 1 }
});
const target = nearestTreeTrellisPoint([1.3, 2.7, 3], trellis);
assert.ok(target[0] >= -4 && target[0] <= 4);
assert.ok(target[1] >= -4 && target[1] <= 4);
assert.equal(target[2], 1);
assert.ok(calculateTreeTrellisForce([1.3, 2.7, 3], trellis, 0.5).some(
	(value) => Math.abs(value) > 0
));
assert.deepEqual(calculateTreeTrellisForce([100, 100, 100], trellis, 0.5), [0, 0, 0]);

const trained = generateTreeProceduralData({ ...base, trellis });
const free = generateTreeProceduralData({ ...base, trellis: { enabled: false } });
assert.equal(trained.stats.branchTriangles, free.stats.branchTriangles);
assert.notDeepEqual(trained.branches.positions, free.branches.positions);
assert.equal(trained.metadata.trellis.enabled, true);
assert.equal(free.metadata.trellis.enabled, false);

console.log('B"H | treeGeneratorAdvanced.test.mjs passed');
