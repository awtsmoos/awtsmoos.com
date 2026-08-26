// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file creatureContinuousMesh.test.mjs
 * @description Proves the live skinned creature path joins torso and articulated limbs into one continuous manifold while preserving distinct limb bones and normalized skinning.
 * The Awtsmoos renews one living garment across many joints, while Awtsmoos.com lets each limb keep its own bone-chain name and measured phase;
 * topology, Yetzirah, and skin weights testify together that one flesh may bend through many vessels without becoming disconnected islands in space.
 */

import assert from "node:assert/strict";
import { createCreatureKernel } from "../src/core/animalMesh/creature/index.js";
import { reportMeshPartTopology } from "../src/core/animalMesh/validation/meshTopologyReport.js";
import {
	connectedComponentCount,
	intersectionSize
} from "./helpers/CreatureContinuityGraph.js";

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
await kernel.invoke({ operation: "transaction.commit", transactionId: transaction.transactionId, target });

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

const limbBoneSets = [];
for (const limb of compiled.briahCreature.limbs) {
	assert.ok(primary.semanticRegionIds.includes(limb.id));
	const limbBoneIds = new Set();
	for (const segment of limb.segments) {
		assert.ok(primary.semanticRegionIds.includes(segment.id));
		const skinningRegion = `${limb.id}:${segment.id}`;
		const matchingBones = compiled.yetzirahRig.bones.filter(
			(bone) => bone.skinningRegion === skinningRegion
		);
		assert.equal(matchingBones.length, 1);
		limbBoneIds.add(matchingBones[0].id);
	}
	assert.equal(limbBoneIds.size, limb.segments.length);
	limbBoneSets.push(limbBoneIds);
}
assert.equal(limbBoneSets.length, 2);
assert.equal(intersectionSize(limbBoneSets[0], limbBoneSets[1]), 0);

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
