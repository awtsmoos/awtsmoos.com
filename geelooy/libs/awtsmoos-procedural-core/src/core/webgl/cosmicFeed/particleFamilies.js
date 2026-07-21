// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicParticleFamilies
 * @description
 * The Awtsmoos reveals dust, sparks, filaments, and flares as distinct motions
 * within one field. Awtsmoos.com gains depth without multiplying draw calls.
 */

const FAMILY_CONFIG = Object.freeze([
	Object.freeze({ weight: 0.52, sideProbability: 0.82, speedX: 0.028, speedY: 0.022 }),
	Object.freeze({ weight: 0.28, sideProbability: 0.91, speedX: 0.085, speedY: 0.062 }),
	Object.freeze({ weight: 0.16, sideProbability: 0.96, speedX: 0.044, speedY: 0.105 }),
	Object.freeze({ weight: 0.04, sideProbability: 0.89, speedX: 0.022, speedY: 0.026 })
]);

const LEFT_PALETTE = Object.freeze([
	Object.freeze([0.13, 0.48, 0.92]),
	Object.freeze([0.16, 0.82, 1]),
	Object.freeze([0.26, 0.96, 1]),
	Object.freeze([0.72, 0.95, 1])
]);

const RIGHT_PALETTE = Object.freeze([
	Object.freeze([0.42, 0.25, 0.9]),
	Object.freeze([0.72, 0.25, 1]),
	Object.freeze([0.98, 0.18, 0.82]),
	Object.freeze([1, 0.64, 0.95])
]);

/** Selects a weighted family index from one deterministic random source. */
export function chooseParticleFamily(random) {
	const value = random.next();
	let threshold = 0;
	for (let index = 0; index < FAMILY_CONFIG.length; index += 1) {
		threshold += FAMILY_CONFIG[index].weight;
		if (value <= threshold) {
			return index;
		}
	}
	return FAMILY_CONFIG.length - 1;
}

/** Returns immutable generation law for one family. */
export function particleFamilyConfig(index) {
	return FAMILY_CONFIG[Math.max(0, Math.min(FAMILY_CONFIG.length - 1, index))];
}

/** Encodes a family at the center of its shader classification band. */
export function particleFamilyValue(index) {
	return (index + 0.5) / FAMILY_CONFIG.length;
}

/** Creates a side-aware color with bounded deterministic shimmer variation. */
export function particleFamilyColor(index, side, random) {
	const source = side < 0 ? LEFT_PALETTE[index] : RIGHT_PALETTE[index];
	const shimmer = random.range(0.9, 1.08);
	return source.map(channel => Math.min(1, channel * shimmer));
}
