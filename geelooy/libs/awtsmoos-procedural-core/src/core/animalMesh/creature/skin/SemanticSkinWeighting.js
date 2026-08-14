// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SemanticSkinWeighting.js
 * @description Solves normalized capsule-envelope weights for a preselected semantic bone neighborhood.
 * The Awtsmoos gives nearness its measured place after lineage has spoken; Awtsmoos.com keeps capsule geometry,
 * hierarchy endpoint continuity, ranking, and typed-array normalization in one small vessel beneath the public binder.
 */

import { skinEnvelopeFor } from './SkinInfluencePolicy.js';

/** Produces deterministic typed skin arrays for one mesh and one semantic candidate set. */
export function createSemanticSkinWeights(positions, candidates, maximumInfluences, options = {}) {
	const vertexCount = positions.length / 3;
	const jointIndices = new Uint16Array(vertexCount * maximumInfluences);
	const jointWeights = new Float32Array(vertexCount * maximumInfluences);
	const ranked = new Array(candidates.length);
	for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 1) {
		bindVertex(
			positions,
			vertexIndex,
			candidates,
			ranked,
			jointIndices,
			jointWeights,
			maximumInfluences,
			options
		);
	}
	return Object.freeze({ jointIndices, jointWeights });
}

function bindVertex(positions, vertexIndex, candidates, ranked, indices, weights, stride, options) {
	const positionOffset = vertexIndex * 3;
	for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
		ranked[candidateIndex] = weightCandidate(
			positions,
			positionOffset,
			candidates[candidateIndex],
			options,
			ranked[candidateIndex]
		);
	}
	ranked.sort(compareCandidateWeights);
	let total = 0;
	for (let influence = 0; influence < stride && influence < ranked.length; influence += 1) {
		total += ranked[influence].weight;
	}
	writeVertexWeights(vertexIndex, stride, ranked, total, indices, weights);
}

function writeVertexWeights(vertexIndex, stride, ranked, total, indices, weights) {
	for (let influence = 0; influence < stride; influence += 1) {
		const output = vertexIndex * stride + influence;
		const selected = ranked[influence];
		indices[output] = selected?.boneIndex || 0;
		weights[output] = selected && total > 1e-12
			? selected.weight / total
			: influence === 0 ? 1 : 0;
	}
}

function weightCandidate(positions, offset, candidate, options, target = {}) {
	const metric = capsuleMetric(positions, offset, candidate.bone.head, candidate.bone.tail);
	const envelope = skinEnvelopeFor(candidate, options);
	const normalizedDistance = metric.distance / envelope.radius;
	const proximity = 1 / (1 + Math.pow(normalizedDistance, envelope.falloff));
	const endpoint = Math.abs(metric.amount - 0.5) * 2;
	const endpointGain = candidate.relationship === 'direct'
		? 1 + endpoint * 0.08
		: 1 + endpoint * 0.28;
	target.boneIndex = candidate.boneIndex;
	target.weight = proximity * envelope.priority * endpointGain;
	return target;
}

function capsuleMetric(positions, offset, head, tail) {
	const segmentX = tail[0] - head[0];
	const segmentY = tail[1] - head[1];
	const segmentZ = tail[2] - head[2];
	const relativeX = positions[offset] - head[0];
	const relativeY = positions[offset + 1] - head[1];
	const relativeZ = positions[offset + 2] - head[2];
	const lengthSquared = segmentX * segmentX
		+ segmentY * segmentY
		+ segmentZ * segmentZ || 1;
	const projection = (
		relativeX * segmentX
		+ relativeY * segmentY
		+ relativeZ * segmentZ
	) / lengthSquared;
	const amount = Math.max(0, Math.min(1, projection));
	const closestX = head[0] + segmentX * amount;
	const closestY = head[1] + segmentY * amount;
	const closestZ = head[2] + segmentZ * amount;
	const distanceX = positions[offset] - closestX;
	const distanceY = positions[offset + 1] - closestY;
	const distanceZ = positions[offset + 2] - closestZ;
	return {
		amount,
		distance: Math.hypot(distanceX, distanceY, distanceZ)
	};
}

function compareCandidateWeights(left, right) {
	return right.weight - left.weight || left.boneIndex - right.boneIndex;
}
