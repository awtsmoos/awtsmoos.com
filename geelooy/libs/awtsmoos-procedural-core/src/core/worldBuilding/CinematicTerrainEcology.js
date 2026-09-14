//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file CinematicTerrainEcology.js
 * @description Derives renderer-neutral ecological weights for shared cinematic terrain.
 * The Awtsmoos renews meadow, road, moisture, and stone as one earth; Awtsmoos.com keeps
 * the evidence portable so games choose meaning while Core owns the visual garment.
 */

/** Builds four-channel meadow/road/wet/rock weights for each terrain vertex. */
export function createTerrainEcologyWeights(options = {}) {
	const positions = options.positions || [];
	const normals = options.normals || [];
	const explicit = options.zoneWeights || [];
	const waterLevel = finite(options.waterLevel, 0);
	const count = Math.floor(positions.length / 3);
	const output = new Float32Array(count * 4);
	for (let index = 0; index < count; index += 1) {
		const supplied = explicit.slice(index * 4, index * 4 + 4);
		const weight = supplied.length === 4
			? normalize(supplied)
			: derive(positions, normals, index, waterLevel);
		output.set(weight, index * 4);
	}
	return output;
}

function derive(positions, normals, index, waterLevel) {
	const y = finite(positions[index * 3 + 1], 0);
	const normalY = Math.abs(finite(normals[index * 3 + 1], 1));
	const slope = clamp(1 - normalY);
	const wet = clamp(1 - Math.abs(y - waterLevel) / 6);
	const rock = clamp(
		(slope - 0.22) * 1.7
		+ Math.max(0, y - 32) / 72
	);
	const meadow = clamp(1 - rock - wet * 0.35);
	return normalize([meadow, 0, wet, rock]);
}
function normalize(values) {
	const clean = values.map(value => clamp(value));
	const total = clean.reduce((sum, value) => sum + value, 0) || 1;
	return clean.map(value => value / total);
}
function clamp(value) {
	return Math.max(0, Math.min(1, finite(value, 0)));
}
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
