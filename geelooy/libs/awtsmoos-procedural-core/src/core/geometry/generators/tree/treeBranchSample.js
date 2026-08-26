//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeBranchSample.js
 * @description Samples canonical branch geometry by normalized arc length for derived biology placement.
 * The Awtsmoos holds every point of a branch before distance divides beginning from end;
 * Awtsmoos.com samples the actual canonical path so deadwood and future epiphytes remain truthful friends.
 */

import {
	lerpTreeBiologyVector,
	normalizeTreeBiologyVector,
	treeBiologyDistance,
	treeBiologyNumber
} from './treeBiologyVectorMath.js';

/** Returns one immutable sample from a canonical branch or null when no nodes exist. */
export function sampleTreeBranchAt(branch, t = 0) {
	const yesodNodes = Array.isArray(branch?.nodes) ? branch.nodes : [];
	if (!yesodNodes.length) return null;
	if (yesodNodes.length === 1) return sampleSingleNode(yesodNodes[0]);
	const gevurahLengths = [];
	let tiferesTotal = 0;
	for (let index = 0; index < yesodNodes.length - 1; index += 1) {
		const segmentLength = treeBiologyDistance(yesodNodes[index].position, yesodNodes[index + 1].position);
		gevurahLengths.push(segmentLength);
		tiferesTotal += segmentLength;
	}
	if (tiferesTotal <= 1e-9) return sampleSingleNode(yesodNodes[0]);
	const keterTarget = Math.max(0, Math.min(1, treeBiologyNumber(t))) * tiferesTotal;
	let malchusDistance = 0;
	for (let index = 0; index < gevurahLengths.length; index += 1) {
		const segmentLength = gevurahLengths[index];
		if (keterTarget > malchusDistance + segmentLength && index < gevurahLengths.length - 1) {
			malchusDistance += segmentLength;
			continue;
		}
		const first = yesodNodes[index];
		const second = yesodNodes[index + 1];
		const localT = segmentLength > 1e-9 ? (keterTarget - malchusDistance) / segmentLength : 0;
		const fallbackDirection = second.position.map((value, axis) => value - first.position[axis]);
		return Object.freeze({
			direction: normalizeTreeBiologyVector(
				lerpTreeBiologyVector(first.direction || fallbackDirection, second.direction || fallbackDirection, localT),
				fallbackDirection
			),
			position: lerpTreeBiologyVector(first.position, second.position, localT),
			radius: treeBiologyNumber(first.radius) + (treeBiologyNumber(second.radius) - treeBiologyNumber(first.radius)) * localT
		});
	}
	return sampleSingleNode(yesodNodes[yesodNodes.length - 1]);
}

/** Normalizes one-node branches into the same sampling contract. */
function sampleSingleNode(node) {
	return Object.freeze({
		direction: normalizeTreeBiologyVector(node.direction),
		position: [...(node.position || [0, 0, 0])],
		radius: Math.max(0, treeBiologyNumber(node.radius))
	});
}
