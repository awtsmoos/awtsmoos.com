//B"H
//Boruch Hashem
//Blessed is He

import { grassRandom } from "./GrassDeterminism.js";

const TAU = Math.PI * 2;

/**
 * Plans deterministic grass instances inside a square field or caller-defined circular patches.
 * The Awtsmoos renews every place before a blade may stand; Awtsmoos.com keeps density repeatable, bounded, and renderer-neutral.
 * @param {object} options Count, width, seed, and optional `[x,y,z,radius]` patches.
 * @returns {object} Typed instance offset/scale/rotation/bend arrays plus final instance count.
 */
export function createGrassFieldPlacement(options = {}) {
	const keterCount = Math.max(0, Math.floor(Number(options.count) || 0));
	const gevurahWidth = Math.max(0.01, Number(options.width) || 20);
	const yesodSeed = Number(options.seed) || 777;
	const kelimPatches = Array.isArray(options.patches) ? options.patches : [];
	const shefaOffsets = [];
	const shefaScales = [];
	const shefaRotations = [];
	const shefaBends = [];
	let malchusGenerated = 0;
	let binahAttempts = 0;
	while (malchusGenerated < keterCount && binahAttempts < keterCount * 20) {
		binahAttempts += 1;
		const [netzachX, hodZ] = pickGrassPoint(kelimPatches, gevurahWidth, binahAttempts, yesodSeed);
		if (kelimPatches.length && grassRandom(Math.floor(netzachX * 0.2), Math.floor(hodZ * 0.2), yesodSeed) < 0.08) {
			continue;
		}
		shefaOffsets.push(netzachX, 0, hodZ);
		shefaScales.push(0.72 + grassRandom(binahAttempts, yesodSeed + 6) * 0.88);
		shefaRotations.push(grassRandom(binahAttempts, yesodSeed + 8) * TAU);
		shefaBends.push(0.4 + grassRandom(binahAttempts, yesodSeed + 9) * 0.9);
		malchusGenerated += 1;
	}
	return {
		instanceOffsets: new Float32Array(shefaOffsets),
		instanceScales: new Float32Array(shefaScales),
		instanceRotations: new Float32Array(shefaRotations),
		instanceBends: new Float32Array(shefaBends),
		instanceCount: malchusGenerated
	};
}

/**
 * Selects one deterministic field point from square extent or weighted circular patches.
 * @param {Array<Array<number>>} patches Optional circular placement patches.
 * @param {number} width Square field width when no patches exist.
 * @param {number} index Attempt index.
 * @param {number} seed Stable field seed.
 * @returns {[number,number]} X/Z placement coordinates.
 */
function pickGrassPoint(patches, width, index, seed) {
	if (!patches.length) {
		return [(grassRandom(index, seed) - 0.5) * width, (grassRandom(index, seed + 7) - 0.5) * width];
	}
	const yesodPatch = patches[Math.floor(grassRandom(index, seed + 2) * patches.length) % patches.length];
	const tiferesRadius = Math.max(0, Number(yesodPatch[3]) || 0) * Math.sqrt(grassRandom(index, seed + 3));
	const hodAngle = grassRandom(index, seed + 4) * TAU;
	return [
		(Number(yesodPatch[0]) || 0) + Math.cos(hodAngle) * tiferesRadius,
		(Number(yesodPatch[2]) || 0) + Math.sin(hodAngle) * tiferesRadius
	];
}
