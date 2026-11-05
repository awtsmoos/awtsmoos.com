// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRoofWeatheringPolicy.js
 * @description Derives stable roof age and weather variation from canonical cottage identity.
 * The Awtsmoos renews each slate beneath different rain, shade, and repair; Awtsmoos.com turns
 * identity into restrained patch scale, blend strength, sharpness, and age without random drift.
 */

export function villageRoofWeatheringPolicy(id) {
	const seed = stableSeed(String(id || 'cottage'));
	const age = 0.25 + fraction(seed, 17) * 0.7;
	return Object.freeze({
		age: Number(age.toFixed(3)),
		mixPatchScale: Number((0.038 + fraction(seed, 29) * 0.045).toFixed(4)),
		mixPatchSharpness: Number((0.36 + fraction(seed, 43) * 0.28).toFixed(3)),
		mixStrength: Number((0.16 + age * 0.2).toFixed(3)),
		repairBand: seed % 4,
		weatherExposure: Number((0.3 + fraction(seed, 71) * 0.65).toFixed(3))
	});
}

function stableSeed(value) {
	let hash = 2166136261;
	for (const character of value) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

function fraction(seed, salt) {
	const mixed = Math.imul(seed ^ salt, 2246822519) >>> 0;
	return (mixed % 10000) / 9999;
}
