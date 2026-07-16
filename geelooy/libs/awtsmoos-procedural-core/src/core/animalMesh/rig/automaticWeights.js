// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	dotVector,
	subtractVector,
	vectorLength
} from "../geometry/vectorMath.js";

export function assignAutomaticBoneWeights(part, rig) {
	if (!rig.enabled || rig.bones.length === 0) {
		return part;
	}
	const maximumInfluences = Math.min(
		4,
		rig.weighting.maximum_influences_per_vertex || 4
	);
	const skinIndices = [];
	const skinWeights = [];

	for (let index = 0; index < part.positions.length; index += 3) {
		const point = part.positions.slice(index, index + 3);
		const ranked = rig.bones
			.map((bone, boneIndex) => ({
				boneIndex,
				distance: distanceToSegment(point, bone.head, bone.tail)
			}))
			.sort((left, right) => left.distance - right.distance)
			.slice(0, maximumInfluences);
		const rawWeights = ranked.map((item) => 1 / Math.max(item.distance, 0.001));
		const total = rawWeights.reduce((sum, value) => sum + value, 0);
		for (let influence = 0; influence < 4; influence += 1) {
			skinIndices.push(ranked[influence]?.boneIndex || 0);
			skinWeights.push(rawWeights[influence] ? rawWeights[influence] / total : 0);
		}
	}
	return {
		...part,
		skinIndices,
		skinWeights
	};
}

function distanceToSegment(point, start, end) {
	const segment = subtractVector(end, start);
	const pointOffset = subtractVector(point, start);
	const lengthSquared = dotVector(segment, segment);
	const amount = lengthSquared > 0
		? Math.max(0, Math.min(1, dotVector(pointOffset, segment) / lengthSquared))
		: 0;
	const closest = [
		start[0] + segment[0] * amount,
		start[1] + segment[1] * amount,
		start[2] + segment[2] * amount
	];
	return vectorLength(subtractVector(point, closest));
}
