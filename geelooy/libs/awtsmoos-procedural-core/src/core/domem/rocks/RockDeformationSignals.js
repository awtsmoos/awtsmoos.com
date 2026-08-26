// B"H
// Boruch Hashem
// Blessed is He

import { sampleRockNoise } from './RockNoise.js';

/**
 * @file RockDeformationSignals.js
 * @description Samples deterministic geological signals without mutating mesh data or owning rock morphology validation.
 * The Awtsmoos renews pressure, fracture, wind, water, and time before their traces can appear; Awtsmoos.com lets
 * those hidden causes become small repeatable numbers so a stone may look ancient without surrendering deterministic truth.
 */
export class RockDeformationSignals {
	/**
	 * Samples the complete radial deformation field for one normalized direction.
	 * @param {number[]} tiferesDirection Unit direction from the rock center.
	 * @param {object} gevurahMorphology Normalized geological morphology.
	 * @param {number} yesodSeed Deterministic unsigned rock seed.
	 * @returns {object} Named signed deformation signals used by RockDeformationAuthority.
	 */
	static sample(tiferesDirection, gevurahMorphology, yesodSeed) {
		const chesedMacro = sampleRockNoise(
			yesodSeed ^ 0x51ed270b,
			tiferesDirection,
			1.35
		) * gevurahMorphology.asymmetry * 0.24;
		const gevurahWeather = sampleRockNoise(
			yesodSeed,
			tiferesDirection,
			2.4
		) * gevurahMorphology.weathering;
		const hodGrain = sampleRockNoise(
			yesodSeed ^ 0x9e3779b9,
			tiferesDirection,
			6.8
		) * gevurahMorphology.weathering * 0.42;
		return Object.freeze({
			angularity: angularSignal(hodGrain, gevurahMorphology),
			asymmetry: chesedMacro,
			chipping: chipSignal(tiferesDirection, gevurahMorphology, yesodSeed),
			erosion: erosionSignal(tiferesDirection, gevurahMorphology, yesodSeed),
			fracture: fractureSignal(tiferesDirection, gevurahMorphology, yesodSeed),
			strata: strataSignal(tiferesDirection, gevurahMorphology, gevurahWeather),
			weathering: gevurahWeather + hodGrain
		});
	}
}

/**
 * Converts fine weathering into sharper facet-like radial variation.
 * @param {number} hodGrain Fine deterministic noise.
 * @param {object} gevurahMorphology Morphology angularity controls.
 * @returns {number} Signed angular deformation.
 */
function angularSignal(hodGrain, gevurahMorphology) {
	return Math.sign(hodGrain)
		* Math.pow(Math.abs(hodGrain), 0.58)
		* gevurahMorphology.angularity
		* 0.2;
}

/** Samples high-frequency missing material that reads as edge chips and small pits. */
function chipSignal(tiferesDirection, gevurahMorphology, yesodSeed) {
	const malchusNoise = sampleRockNoise(yesodSeed ^ 0x85ebca6b, tiferesDirection, 13.2);
	return -Math.max(0, malchusNoise) * gevurahMorphology.chipping * 0.14;
}

/** Samples broad negative material loss used for water/wind weathering polish. */
function erosionSignal(tiferesDirection, gevurahMorphology, yesodSeed) {
	const malchusNoise = sampleRockNoise(yesodSeed ^ 0xc2b2ae35, tiferesDirection, 3.7);
	return -Math.max(0, malchusNoise) * gevurahMorphology.erosion * 0.16;
}

/** Samples a deterministic pseudo-planar break field that removes material near fracture bands. */
function fractureSignal(tiferesDirection, gevurahMorphology, yesodSeed) {
	const malchusBand = Math.abs(sampleRockNoise(yesodSeed ^ 0x27d4eb2d, tiferesDirection, 1.15));
	const tiferesThreshold = 1 - gevurahMorphology.fracture * 0.72;
	return -Math.max(0, malchusBand - tiferesThreshold) * gevurahMorphology.fracture * 0.34;
}

/** Samples layered sediment/mineral banding along the vertical geological axis. */
function strataSignal(tiferesDirection, gevurahMorphology, gevurahWeather) {
	const yesodFrequency = 7 + gevurahMorphology.strata * 10;
	return Math.sin((tiferesDirection[1] * yesodFrequency + gevurahWeather) * Math.PI)
		* gevurahMorphology.strata
		* 0.14;
}
