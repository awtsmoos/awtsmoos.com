// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockDirectionalFields.js
 * @description Samples coherent geological fields from one seed-derived orientation profile without owning mesh construction.
 * The Awtsmoos renews fault, layer, ridge, frost, and river-worn face before any coordinate can claim a lonely cause;
 * Awtsmoos.com lets those forces share one hidden orientation, so each stone reads as formed geology rather than unrelated noise.
 */

const TAU = Math.PI * 2;

/**
 * Samples deterministic deformation evidence for one normalized source direction.
 * @param {readonly number[]} direction Unit source direction.
 * @param {object} profile Canonical geological profile.
 * @param {object} orientation Seed-derived fracture/strata/ridge orientation.
 * @param {number|string} seed Stable root seed.
 * @returns {{noise:number,fracture:number,strata:number,weathering:number}} Geological field values.
 */
export function sampleRockDirectionalFields(direction, profile, orientation, seed) {
	const weathering = profile.weathering || {};
	const composition = profile.composition || {};
	return {
		fracture: fractureField(direction, profile.fracture, weathering.frostFracture, orientation),
		noise: signedHash(seed, direction),
		strata: strataField(direction, profile.strata, composition.sediment, orientation),
		weathering: weatheringField(direction, profile.erosion, weathering.waterWear, orientation, seed)
	};
}

/** Reveals narrow fracture valleys along one stable seed-derived fault direction. */
function fractureField(direction, fracture, frost, orientation) {
	const yesodProjection = dot(direction, orientation.fractureAxis);
	const gevurahPlane = Math.abs(Math.sin((yesodProjection * 3.7 + orientation.fracturePhase) * Math.PI));
	const tiferesStrength = unit(fracture) * (1 + unit(frost) * 0.42);
	return Math.pow(1 - gevurahPlane, 5) * 0.32 * tiferesStrength;
}

/** Reveals sedimentary banding along one stable strata axis rather than the global Y axis. */
function strataField(direction, strata, sediment, orientation) {
	const hodStrength = Math.max(unit(strata), unit(sediment));
	if (!hodStrength) return 0;
	const yesodProjection = dot(direction, orientation.strataAxis);
	const tiferesPhase = yesodProjection * 5.5 + orientation.ridgePhase / TAU;
	return Math.sin(tiferesPhase * TAU) * hodStrength * 0.08;
}

/** Reveals erosion with seed-stable microvariation plus ridge-sensitive water wear. */
function weatheringField(direction, erosion, waterWear, orientation, seed) {
	const malchusNoise = Math.abs(signedHash((Number(seed) >>> 0) ^ 0x9e3779b9, direction));
	const hodRidge = dot(direction, orientation.ridgeAxis);
	const tiferesWater = Math.abs(Math.sin(hodRidge * 2.8 + orientation.erosionPhase));
	return malchusNoise * unit(erosion) * 0.11 + tiferesWater * unit(waterWear) * 0.035;
}

/** Creates deterministic signed microvariation from one normalized direction and seed. */
function signedHash(seed, direction) {
	const yesodSeed = (Number(seed) >>> 0) * 0.0000001192092896;
	const phase = direction[0] * 12.9898 + direction[1] * 78.233 + direction[2] * 37.719 + yesodSeed * 43758.5453;
	const fraction = Math.sin(phase) * 43758.5453123;
	return (fraction - Math.floor(fraction)) * 2 - 1;
}

/** Computes a three-axis dot product without allocating temporary vectors. */
function dot(left, right) {
	return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

/** Returns one bounded geological unit scalar. */
function unit(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0;
}
