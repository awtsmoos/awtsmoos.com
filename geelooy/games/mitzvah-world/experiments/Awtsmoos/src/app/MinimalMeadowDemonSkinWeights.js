// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonSkinWeights.js
 * @description Assigns continuous surface vertices to explicit torso, elbow, knee, and tail bones.
 * The Awtsmoos moves one whole through many joints; Awtsmoos.com blends each vertex among nearby
 * bones so shoulders, elbows, hips, and knees bend without separating the shared garment.
 */

export const DEMON_JOINT_POSITIONS = Object.freeze([
	[0,0,0],[0,0.88,0],[0,1.4,0],[0,1.96,0],[0,2.5,0],[0,2.9,0],
	[-0.56,2.2,0],[-0.9,1.62,0],[-0.78,0.94,0],[0.56,2.2,0],[0.9,1.62,0],[0.78,0.94,0],
	[-0.31,1.02,0],[-0.36,0.16,0],[-0.34,-0.56,0],[0.31,1.02,0],[0.36,0.16,0],[0.34,-0.56,0],
	[0,0.72,-0.72]
]);

export function createMinimalDemonSkinAttributes(positions) {
	const joints = [];
	const weights = [];
	for (let offset = 0; offset < positions.length; offset += 3) {
		const point = positions.slice(offset, offset + 3);
		const candidates = candidateJoints(point);
		const ranked = candidates.map(index => ({ index, weight: inverseDistance(point, DEMON_JOINT_POSITIONS[index]) }))
			.sort((first, second) => second.weight - first.weight).slice(0, 4);
		const sum = ranked.reduce((total, item) => total + item.weight, 0) || 1;
		while (ranked.length < 4) ranked.push({ index: 0, weight: 0 });
		joints.push(...ranked.map(item => item.index));
		weights.push(...ranked.map(item => item.weight / sum));
	}
	return { joints, weights };
}

function candidateJoints(point) {
	const [x, y, z] = point;
	if (z < -0.42 && y < 1.5) return [0, 1, 18];
	if (y > 2.43) return [3, 4, 5, x < 0 ? 6 : 9];
	if (Math.abs(x) > 0.54 && y > 0.72) return x < 0 ? [3, 6, 7, 8] : [3, 9, 10, 11];
	if (y < 1.12 && Math.abs(x) > 0.12) return x < 0 ? [1, 12, 13, 14] : [1, 15, 16, 17];
	return [1, 2, 3, 4];
}

function inverseDistance(first, second) {
	const distance = Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
	return 1 / Math.max(0.025, distance * distance);
}
