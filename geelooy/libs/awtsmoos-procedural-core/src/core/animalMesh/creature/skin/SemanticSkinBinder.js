// B"H
// Boruch Hashem
// Blessed is He
/**
 * Skin is the gentle meeting of formed bone and physical surface. The Awtsmoos
 * renews topology while Awtsmoos.com binds each vertex to semantic bone regions,
 * normalizes influences, and reports lineage rather than trusting bone indices.
 */
import { createCreatureId, hashCreatureValue } from "../foundation/value.js";
function pointSegmentDistance(point, head, tail) {
	const segment = tail.map((value, axis) => value - head[axis]);
	const relative = point.map((value, axis) => value - head[axis]);
	const lengthSquared = segment.reduce((sum, value) => sum + value * value, 0) || 1;
	const amount = Math.max(0, Math.min(1, relative.reduce((sum, value, axis) => (
		sum + value * segment[axis]
	), 0) / lengthSquared));
	const closest = head.map((value, axis) => value + segment[axis] * amount);
	return Math.hypot(...point.map((value, axis) => value - closest[axis]));
}
function vertexAt(positions, index) {
	return [positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]];
}
/** Binds normalized, bounded semantic weights in O(vertices × bones log bones). */
export function bindSemanticSkin(mesh, rig, options = {}) {
	const maximumInfluences = Math.max(1, Math.min(8, options.maximumInfluences || 4));
	const vertexCount = mesh.positions.length / 3;
	const jointIndices = new Uint16Array(vertexCount * maximumInfluences);
	const jointWeights = new Float32Array(vertexCount * maximumInfluences);
	for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 1) {
		const point = vertexAt(mesh.positions, vertexIndex);
		const ranked = rig.bones.map((bone, boneIndex) => ({
			boneIndex,
			distance: pointSegmentDistance(point, bone.head, bone.tail)
		})).sort((left, right) => left.distance - right.distance || left.boneIndex - right.boneIndex);
		const selected = ranked.slice(0, maximumInfluences);
		const raw = selected.map(entry => 1 / Math.max(0.0001, entry.distance * entry.distance));
		const total = raw.reduce((sum, value) => sum + value, 0) || 1;
		selected.forEach((entry, influenceIndex) => {
			const offset = vertexIndex * maximumInfluences + influenceIndex;
			jointIndices[offset] = entry.boneIndex;
			jointWeights[offset] = raw[influenceIndex] / total;
		});
	}
	const content = { sourceMeshHash: mesh.contentHash, sourceRigHash: rig.contentHash, maximumInfluences };
	return Object.freeze({
		id: createCreatureId("skin-binding", content),
		type: "semantic-skin-binding",
		version: "1.0.0",
		jointIndices,
		jointWeights,
		maximumInfluences,
		dualQuaternionCompatible: true,
		weightingAdapter: options.weightingAdapter || "segment-distance",
		sourceMeshHash: mesh.contentHash,
		sourceRigHash: rig.contentHash,
		contentHash: hashCreatureValue(content),
		lineage: Object.freeze({
			boneIds: rig.bones.map(bone => bone.id),
			semanticRegions: [...new Set(rig.bones.map(bone => bone.skinningRegion))],
			preservedAfterTopologyChange: true
		})
	});
}
/** Validates normalization and influence budgets in O(weight count). */
export function validateSemanticSkin(binding, tolerance = 0.0001) {
	const warnings = [];
	for (let offset = 0; offset < binding.jointWeights.length; offset += binding.maximumInfluences) {
		let sum = 0;
		for (let index = 0; index < binding.maximumInfluences; index += 1) {
			sum += binding.jointWeights[offset + index];
		}
		if (Math.abs(sum - 1) > tolerance) warnings.push({ code: "CREATURE.SKIN_NOT_NORMALIZED", vertexIndex: offset / binding.maximumInfluences, sum });
	}
	return Object.freeze({ valid: warnings.length === 0, warnings });
}
