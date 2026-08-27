// B"H
// Boruch Hashem
// Blessed is He

/**
 * One tree may appear through legacy buffers and many LODs without multiplying
 * its planner. These Awtsmoos.com regressions reject structural drift, open
 * branch tubes, unconserved child radii, and broken compatibility contracts.
 */

import assert from "node:assert/strict";
import { TreeRNG } from "../src/core/geometry/generators/tree/rng.js";
import { TreeGeometryBuilder } from "../src/core/geometry/generators/tree/treeGeometryBuilder.js";
import {
	TreeGenerator,
	generateTreeProceduralData,
	generateTreeSkeleton,
	resolveTreeConfig
} from "../src/core/geometry/generators/tree/treeGenerator.js";
import { TreeGrowthSystem } from "../src/core/geometry/generators/tree/treeGrowthSystem.js";

function nodeMap(skeleton) {
	return new Map(skeleton.branches.flatMap((branch) => (
		branch.nodes.map((node) => [node.id, node])
	)));
}

function childAreas(skeleton) {
	const areas = new Map();
	for (const branch of skeleton.branches) {
		if (!branch.parentNodeId) {
			continue;
		}
		const radius = branch.nodes[0].radius;
		areas.set(branch.parentNodeId, (areas.get(branch.parentNodeId) || 0) + radius * radius);
	}
	return areas;
}

const generator = new TreeGenerator("Oak Medium");
const skeleton = generator.generateSkeleton();
const legacy = generator.generate({ detail: "high" });
assert.equal(legacy.metadata.skeletonSignature, skeleton.contentHash);
assert.equal(legacy.metadata.canonicalSkeleton, true);
assert.equal(legacy.stats.branchCaps, skeleton.branches.length * 2);
assert.equal(legacy.stats.closedBranchComponents, skeleton.branches.length);

const lodSet = generator.generateLODs({ profiles: ["high", "medium", "low"] });
assert.ok(lodSet.lods.every((lod) => lod.skeletonHash === lodSet.skeleton.contentHash));
assert.ok(lodSet.lods.every((lod) => lod.stats.branchCaps === skeleton.branches.length * 2));
assert.ok(lodSet.lods[0].stats.branchTriangles > lodSet.lods[1].stats.branchTriangles);
assert.ok(lodSet.lods[1].stats.branchTriangles > lodSet.lods[2].stats.branchTriangles);
assert.ok(lodSet.lods[0].stats.leafVertices >= lodSet.lods[1].stats.leafVertices);
assert.ok(lodSet.lods[1].stats.leafVertices >= lodSet.lods[2].stats.leafVertices);

const nodes = nodeMap(skeleton);
for (const [parentNodeId, childArea] of childAreas(skeleton)) {
	const parentRadius = nodes.get(parentNodeId).radius;
	assert.ok(childArea <= parentRadius * parentRadius * 0.780001);
}

const config = resolveTreeConfig("Oak Medium");
const builder = new TreeGeometryBuilder();
const system = new TreeGrowthSystem(config, new TreeRNG(config.seed), builder, "high");
system.generate();
assert.equal(system.skeletonSignature(), skeleton.contentHash);
assert.ok(builder.verts.length > 0);
assert.ok(builder.indices.length > 0);
assert.deepEqual(generateTreeProceduralData("Oak Medium"), generateTreeProceduralData("Oak Medium"));
assert.equal(generateTreeSkeleton("Oak Medium").contentHash, skeleton.contentHash);
console.log('B"H | treeCanonicalConsolidation.test.mjs passed');
