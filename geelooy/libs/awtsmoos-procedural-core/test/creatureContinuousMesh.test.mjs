// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file creatureContinuousMesh.test.mjs
 * @description Proves the live skinned creature path joins torso and articulated limbs into one continuous manifold while preserving distinct limb bones and normalized skinning.
 * The Awtsmoos renews one living garment across many joints, while Awtsmoos.com lets each limb keep its own bone-chain name and measured phase;
 * this test asks topology, Yetzirah, and skin weights to testify together that one flesh may bend through many vessels without becoming a pile of islands in space.
 */

import assert from "node:assert/strict";
import { createCreatureKernel } from "../src/core/animalMesh/creature/index.js";
import { reportMeshPartTopology } from "../src/core/animalMesh/validation/meshTopologyReport.js";

const kernel = createCreatureKernel();
const created = await kernel.invoke({
	operation: "creature.create",
	version: "1.0.0",
	arguments: { seed: 78123, axialProportions: { sectionCount: 7 } }
});
const target = { artifactId: created.artifactId };
const transaction = await kernel.invoke({ operation: "transaction.begin", target });
await kernel.invoke({
	operation: "creature.limb.createPair",
	transactionId: transaction.transactionId,
	target,
	arguments: {
		attachmentRegion: "lower-torso",
		role: "locomotion.support",
		segments: [
			{ length: 0.78, radiusStart: 0.2, radiusEnd: 0.14 },
			{ length: 0.66, radiusStart: 0.14, radiusEnd: 0.09 }
		]
	}
});
await kernel.invoke({
	operation: "transaction.commit",
	transactionId: transaction.transactionId,
	target
});

const compiled = await kernel.invoke({
	operation: "creature.compile",
	target,
	arguments: { deterministic: true, lodLevels: 2 }
});
const repeated = await kernel.invoke({
	operation: "creature.compile",
	target,
	arguments: { deterministic: true, lodLevels: 2 }
});
const skin = await kernel.invoke({ operation: "creature.skin.bind", target });
const mesh = compiled.asiyahMesh;
const primary = mesh.parts[0];
const topology = reportMeshPartTopology(primary);

assert.equal(mesh.parts.length, 1);
assert.equal(topology.open_boundary_count, 0);
assert.equal(topology.non_manifold_edge_count, 0);
assert.equal(topology.degenerate_face_count, 0);
assert.equal(connectedComponentCount(primary), 1);
assert.equal(repeated.asiyahMesh.contentHash, mesh.contentHash);
assert.deepEqual(repeated.asiyahMesh.indices, mesh.indices);
assert.ok(primary.semanticRegionIds.includes("body.base"));

for (const limb of compiled.briahCreature.limbs) {
	assert.ok(primary.semanticRegionIds.includes(limb.id));
	for (const segment of limb.segments) {
		assert.ok(primary.semanticRegionIds.includes(segment.id));
		assert.ok(compiled.yetzirahRig.bones.some((bone) => bone.id === segment.id));
	}
}

const stride = skin.maximumInfluences;
const vertexCount = primary.positions.length / 3;
assert.equal(skin.jointWeights.length, vertexCount * stride);
for (let vertex = 0; vertex < vertexCount; vertex += 1) {
	let total = 0;
	for (let influence = 0; influence < stride; influence += 1) {
		total += skin.jointWeights[vertex * stride + influence];
	}
	assert.ok(Math.abs(total - 1) < 1e-4);
}

console.log('B"H | creatureContinuousMesh.test.mjs passed');

/** Counts triangle-connected vertex components among vertices actually referenced by the primary mesh. */
function connectedComponentCount(part) {
	const neighbors = new Map();
	for (const vertex of part.indices) {
		if (!neighbors.has(vertex)) neighbors.set(vertex, new Set());
	}
	for (let index = 0; index < part.indices.length; index += 3) {
		const triangle = part.indices.slice(index, index + 3);
		for (let corner = 0; corner < 3; corner += 1) {
			const left = triangle[corner];
			const right = triangle[(corner + 1) % 3];
			neighbors.get(left).add(right);
			neighbors.get(right).add(left);
		}
	}
	const unseen = new Set(neighbors.keys());
	let components = 0;
	while (unseen.size) {
		components += 1;
		const stack = [unseen.values().next().value];
		while (stack.length) {
			const vertex = stack.pop();
			if (!unseen.delete(vertex)) continue;
			stack.push(...neighbors.get(vertex));
		}
	}
	return components;
}
