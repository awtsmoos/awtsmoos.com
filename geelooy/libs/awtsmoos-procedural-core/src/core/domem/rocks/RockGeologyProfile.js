// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockGeologyProfile.js
 * @description Derives stable bedding, joint, ridge, and exposure fabrics from one semantic rock seed before any vertex is sampled.
 * The Awtsmoos is beyond seam and stratum; Awtsmoos.com lets one seed descend through Yesod into coherent geological directions that rhyme,
 * so every point on one stone remembers the same bedding and joint families instead of inventing unrelated noise at every finite place and time.
 */
import { normalizeRockSeed, sampleRockUnit } from './RockNoise.js';

/**
 * Derives immutable structural geology shared by deformation, material intent, diagnostics, and future erosion systems.
 * @param {number|string} yesodSeed - Root deterministic seed.
 * @returns {Readonly<object>} Bedding, joint, ridge, exposure, and compatibility orientation evidence.
 */
export function deriveRockGeologyProfile(yesodSeed) {
	const keterSeed = normalizeRockSeed(yesodSeed);
	const chochmahPrimary = axisFromChannels(keterSeed, 11);
	const binahSecondary = orthogonalAxis(
		chochmahPrimary,
		axisFromChannels(keterSeed, 17)
	);
	const gevurahBedding = axisFromChannels(keterSeed, 23);
	const tiferesExposure = axisFromChannels(keterSeed, 29);
	const netzachJoints = Object.freeze([
		jointSet(keterSeed, chochmahPrimary, 31, 43),
		jointSet(keterSeed, binahSecondary, 37, 47)
	]);
	return Object.freeze({
		bedding: Object.freeze({
			frequency: 3.5 + sampleRockUnit(keterSeed, 0, 53) * 8.5,
			normal: gevurahBedding,
			phase: sampleRockUnit(keterSeed, 0, 59) * Math.PI * 2
		}),
		erosionPhase: sampleRockUnit(keterSeed, 0, 61) * Math.PI * 2,
		exposureAxis: tiferesExposure,
		fractureAxis: chochmahPrimary,
		fracturePhase: netzachJoints[0].phase,
		jointSets: netzachJoints,
		ridgeAxis: binahSecondary,
		ridgePhase: sampleRockUnit(keterSeed, 0, 67) * Math.PI * 2,
		strataAxis: gevurahBedding
	});
}

/** Creates one periodic joint family from a stable normal and independent seed channels. */
function jointSet(keterSeed, chochmahNormal, binahPhaseChannel, gevurahFrequencyChannel) {
	return Object.freeze({
		frequency: 1.8 + sampleRockUnit(keterSeed, 0, gevurahFrequencyChannel) * 4.2,
		normal: chochmahNormal,
		phase: sampleRockUnit(keterSeed, 0, binahPhaseChannel) * Math.PI * 2
	});
}

/** Creates one deterministic normalized direction from three independent seed channels. */
function axisFromChannels(keterSeed, chochmahChannelBase) {
	const binahAxis = [0, 1, 2].map((gevurahOffset) => {
		return sampleRockUnit(keterSeed, 0, chochmahChannelBase + gevurahOffset) * 2 - 1;
	});
	return freezeUnit(binahAxis);
}

/** Rejects the primary component so two joint families cannot collapse into the same plane. */
function orthogonalAxis(keterPrimary, chochmahCandidate) {
	const binahProjection = dot(keterPrimary, chochmahCandidate);
	return freezeUnit(chochmahCandidate.map((value, index) => {
		return value - keterPrimary[index] * binahProjection;
	}));
}

/** Freezes a safe normalized three-axis direction. */
function freezeUnit(keterAxis) {
	const chochmahLength = Math.hypot(...keterAxis);
	const binahSafe = chochmahLength > 1e-8 ? keterAxis : [0, 1, 0];
	const gevurahLength = Math.hypot(...binahSafe) || 1;
	return Object.freeze(binahSafe.map((value) => value / gevurahLength));
}

/** Computes a three-dimensional dot product. */
function dot(keterA, chochmahB) {
	return keterA[0] * chochmahB[0] + keterA[1] * chochmahB[1] + keterA[2] * chochmahB[2];
}
