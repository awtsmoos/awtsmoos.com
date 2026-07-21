// B"H
// Boruch Hashem
// Blessed is He
/**
 * Every point receives a stable place and motion from the Awtsmoos. This
 * Awtsmoos.com layout favors luminous side rivers while retaining sparse depth within.
 */

import { SeededRandom } from "./seededRandom.js";

const PALETTE = Object.freeze([
	[0.21, 0.91, 1],
	[0.16, 0.55, 1],
	[0.47, 0.36, 1],
	[1, 0.29, 0.85]
]);

/**
 * Creates deterministic particle attribute arrays.
 * @param {number} count Particle count.
 * @param {string} seed Stable seed.
 * @returns {{positionPhase:Float32Array,motionFamily:Float32Array,color:Float32Array}}
 */
export function createParticleLayout(count, seed = "awtsmoos-cosmic-feed") {
	const random = new SeededRandom(seed);
	const positionPhase = new Float32Array(count * 4);
	const motionFamily = new Float32Array(count * 4);
	const color = new Float32Array(count * 3);
	for (let index = 0; index < count; index += 1) {
		const positionOffset = index * 4;
		const colorOffset = index * 3;
		const family = Math.floor(random.range(0, PALETTE.length));
		const sideBias = random.next() < 0.84;
		const horizontal = sideBias ?
			(random.next() < 0.5 ? random.range(-1.08, -0.28) : random.range(0.28, 1.08)) :
			random.range(-1, 1);
		positionPhase[positionOffset] = horizontal;
		positionPhase[positionOffset + 1] = random.range(-1.08, 1.08);
		positionPhase[positionOffset + 2] = Math.pow(random.next(), 0.72) * 0.92 + 0.08;
		positionPhase[positionOffset + 3] = random.range(0, Math.PI * 2);
		motionFamily[positionOffset] = random.range(-0.11, 0.11);
		motionFamily[positionOffset + 1] = random.range(-0.095, 0.095);
		motionFamily[positionOffset + 2] = random.next();
		motionFamily[positionOffset + 3] = family / PALETTE.length;
		color.set(PALETTE[family], colorOffset);
	}
	return { positionPhase, motionFamily, color };
}
