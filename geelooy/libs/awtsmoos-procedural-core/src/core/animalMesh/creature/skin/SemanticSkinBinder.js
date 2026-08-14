//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SemanticSkinBinder.js
 * @description Binds renderer-neutral creature vertices through anatomy-first capsule envelopes and hierarchy-aware continuity.
 * The Awtsmoos lets bone and surface meet without one distant limb stealing another limb's flesh;
 * Awtsmoos.com preserves semantic lineage first, geometric nearness second, and normalized weights in every finite vertex vessel.
 */

import { createCreatureId, hashCreatureValue } from '../foundation/value.js';
import {
	selectSkinInfluenceCandidates,
	skinEnvelopeFor
} from './SkinInfluencePolicy.js';

export { validateSemanticSkin } from './SemanticSkinValidation.js';

/** Binds deterministic semantic weights while preserving the typed-array renderer contract. */
export function bindSemanticSkin(mesh, rig, options = {}) {
	const maximumInfluences = clampInfluenceCount(options.maximumInfluences);
	const vertexCount = mesh.positions.length / 3;
	const jointIndices = new Uint16Array(vertexCount * maximumInfluences);
	const jointWeights = new Float32Array(vertexCount * maximumInfluences);
	const candidates = selectSkinInfluenceCandidates(mesh, rig);
	const ranked = new Array(candidates.length);
	for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 1) {
		bindVertex(mesh.positions, vertexIndex, candidates, ranked, jointIndices, jointWeights, maximumInfluences, options);
	}
	const content = {
		maximumInfluences,
		sourceMeshHash: mesh.contentHash || null,
		sourceMeshId: mesh.id || null,
		sourceRigHash: rig.contentHash
	};
	return Object.freeze({
		boneCount: rig.bones.length,
		contentHash: hashCreatureValue(content),
		coverage: Object.freeze({
			candidateCount: candidates.length,
			fallbackUsed: candidates.every(entry => entry.relationship === 'fallback'),
			semanticRegionCount: mesh.semanticRegionIds?.length || 0
		}),
		dualQuaternionCompatible: true,
		id: createCreatureId('skin-binding', content),
		jointIndices,
		jointWeights,
		maximumInfluences,
		sourceMeshHash: mesh.contentHash || null,
		sourceRigHash: rig.contentHash,
		type: 'semantic-skin-binding',
		version: '2.1.0',
		weightingAdapter: 'semantic-capsule-hierarchy'
	});
}

function bindVertex(positions, vertexIndex, candidates, ranked, indices, weights, stride, options) {
	const offset3 = vertexIndex * 3;
	for (let index = 0; index < candidates.length; index += 1) {
		ranked[index] = weightCandidate(positions, offset3, candidates[index], options, ranked[index]);
	}
	ranked.sort(compareCandidateWeights);
	let total = 0;
	for (let influence = 0; influence < stride && influence < ranked.length; influence += 1) total += ranked[influence].weight;
	for (let influence = 0; influence < stride; influence += 1) {
		const output = vertexIndex * stride + influence;
		const selected = ranked[influence];
		indices[output] = selected?.boneIndex || 0;
		weights[output] = selected && total > 1e-12 ? selected.weight / total : influence === 0 ? 1 : 0;
	}
}

function weightCandidate(positions, offset, candidate, options, target = {}) {
	const bone = candidate.bone;
	const metric = capsuleMetric(positions, offset, bone.head, bone.tail);
	const envelope = skinEnvelopeFor(candidate, options);
	const proximity = 1 / (1 + Math.pow(metric.distance / envelope.radius, envelope.falloff));
	const endpoint = Math.abs(metric.amount - 0.5) * 2;
	target.boneIndex = candidate.boneIndex;
	target.weight = proximity * envelope.priority * (candidate.relationship === 'direct' ? 1 + endpoint * 0.08 : 1 + endpoint * 0.28);
	return target;
}

function capsuleMetric(positions, offset, head, tail) {
	const sx = tail[0] - head[0];
	const sy = tail[1] - head[1];
	const sz = tail[2] - head[2];
	const rx = positions[offset] - head[0];
	const ry = positions[offset + 1] - head[1];
	const rz = positions[offset + 2] - head[2];
	const lengthSquared = sx * sx + sy * sy + sz * sz || 1;
	const amount = Math.max(0, Math.min(1, (rx * sx + ry * sy + rz * sz) / lengthSquared));
	const dx = positions[offset] - (head[0] + sx * amount);
	const dy = positions[offset + 1] - (head[1] + sy * amount);
	const dz = positions[offset + 2] - (head[2] + sz * amount);
	return { amount, distance: Math.hypot(dx, dy, dz) };
}

function compareCandidateWeights(left, right) {
	return right.weight - left.weight || left.boneIndex - right.boneIndex;
}

function clampInfluenceCount(value) {
	return Math.max(1, Math.min(8, Number(value || 4)));
}
