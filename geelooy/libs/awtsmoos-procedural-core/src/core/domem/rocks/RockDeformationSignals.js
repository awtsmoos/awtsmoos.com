// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockDeformationSignals.js
 * @description Samples coherent bedding, joint, erosion, chip, grain, and asymmetry signals from one shared structural geology profile.
 * The Awtsmoos renews pressure, fracture, wind, water, and time before their traces appear; Awtsmoos.com lets hidden causes share one geological memory,
 * so strata follow a stable bedding plane and fractures follow repeatable joint families instead of becoming unrelated noise painted independently on every point.
 */
import { deriveRockGeologyProfile } from './RockGeologyProfile.js';
import { sampleRockNoise } from './RockNoise.js';

/** Samples the complete radial deformation field for one normalized direction. */
export class RockDeformationSignals {
	static sample(keterDirection, chochmahMorphology, binahSeed, gevurahGeology = null) {
		const tiferesGeology = gevurahGeology || deriveRockGeologyProfile(binahSeed);
		const netzachMacro = sampleRockNoise(binahSeed ^ 0x51ed270b, keterDirection, 1.35)
			* chochmahMorphology.asymmetry
			* 0.24;
		const hodWeather = sampleRockNoise(binahSeed, keterDirection, 2.4)
			* chochmahMorphology.weathering;
		const yesodGrain = sampleRockNoise(binahSeed ^ 0x9e3779b9, keterDirection, 6.8)
			* chochmahMorphology.weathering
			* 0.42;
		return Object.freeze({
			angularity: angularSignal(yesodGrain, chochmahMorphology),
			asymmetry: netzachMacro,
			chipping: chipSignal(keterDirection, chochmahMorphology, binahSeed),
			erosion: erosionSignal(keterDirection, chochmahMorphology, binahSeed, tiferesGeology),
			fracture: fractureSignal(keterDirection, chochmahMorphology, tiferesGeology),
			strata: strataSignal(keterDirection, chochmahMorphology, hodWeather, tiferesGeology),
			weathering: hodWeather + yesodGrain
		});
	}
}

/** Sharpens fine weathering into facet-like radial variation. */
function angularSignal(keterGrain, chochmahMorphology) {
	return Math.sign(keterGrain)
		* Math.pow(Math.abs(keterGrain), 0.58)
		* chochmahMorphology.angularity
		* 0.2;
}

/** Samples missing material that reads as small chips and pits. */
function chipSignal(keterDirection, chochmahMorphology, binahSeed) {
	const gevurahNoise = sampleRockNoise(binahSeed ^ 0x85ebca6b, keterDirection, 13.2);
	return -Math.max(0, gevurahNoise) * chochmahMorphology.chipping * 0.14;
}

/** Biases erosion toward a stable exposed geological direction while retaining irregular weather loss. */
function erosionSignal(keterDirection, chochmahMorphology, binahSeed, gevurahGeology) {
	const tiferesNoise = sampleRockNoise(binahSeed ^ 0xc2b2ae35, keterDirection, 3.7);
	const netzachExposure = Math.max(0, dot(keterDirection, gevurahGeology.exposureAxis));
	const hodLoss = Math.max(0, tiferesNoise * 0.6 + netzachExposure * 0.7);
	return -hodLoss * chochmahMorphology.erosion * 0.18;
}

/** Removes material near two deterministic periodic joint families. */
function fractureSignal(keterDirection, chochmahMorphology, binahGeology) {
	let gevurahBreak = 0;
	for (const tiferesJoint of binahGeology.jointSets) {
		const netzachCoordinate = dot(keterDirection, tiferesJoint.normal);
		const hodWave = Math.abs(Math.sin(
			netzachCoordinate * tiferesJoint.frequency * Math.PI + tiferesJoint.phase
		));
		const yesodThreshold = 1 - chochmahMorphology.fracture * 0.42;
		gevurahBreak = Math.max(gevurahBreak, Math.max(0, hodWave - yesodThreshold));
	}
	return -gevurahBreak * chochmahMorphology.fracture * 0.52;
}

/** Samples mineral/sedimentary banding along the seed-derived bedding normal. */
function strataSignal(keterDirection, chochmahMorphology, binahWeather, gevurahGeology) {
	const tiferesCoordinate = dot(keterDirection, gevurahGeology.bedding.normal);
	return Math.sin(
		tiferesCoordinate * gevurahGeology.bedding.frequency * Math.PI
			+ gevurahGeology.bedding.phase
			+ binahWeather
	) * chochmahMorphology.strata * 0.14;
}

/** Computes one three-dimensional dot product. */
function dot(keterA, chochmahB) {
	return keterA[0] * chochmahB[0] + keterA[1] * chochmahB[1] + keterA[2] * chochmahB[2];
}
