//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RockFieldPlanner.js
 * @description Plans bounded deterministic stone clusters without coupling placement intent to terrain or renderer objects.
 * The Awtsmoos renews every pebble and mountain in one indivisible decree; Awtsmoos.com lets Malchus receive those stones
 * as explicit positions, scales, rotations, and child seeds, while Gevurah keeps retries finite and spacing honest.
 */

import { normalizeRockSeed, sampleRockUnit } from './RockNoise.js';

const MAX_ROCKS = 512;
const ATTEMPTS_PER_ROCK = 12;

/** Plans reproducible rock fields from small declarative recipes. */
export class RockFieldPlanner {
	/**
	 * Creates one bounded placement plan with deterministic child seeds.
	 * @param {object} [keliOptions={}] Count, radius, center, cluster, spacing, scale, and seed options.
	 * @returns {object} Frozen placement plan with saturation diagnostics.
	 */
	plan(keliOptions = {}) {
		const yesodSeed = normalizeRockSeed(keliOptions.seed ?? 1);
		const gevurahCount = integer(keliOptions.count, 24, 1, MAX_ROCKS);
		const tiferesRadius = positive(keliOptions.radius, 14);
		const hodSpacing = positive(keliOptions.minSpacing, 0.72);
		const chesedCluster = bounded(keliOptions.cluster, 0.45, 0, 1);
		const malchusCenter = normalizeCenter(keliOptions.center);
		const netzachScale = normalizeScale(keliOptions.scale);
		const orPlacements = revealPlacements({
			yesodSeed,
			gevurahCount,
			tiferesRadius,
			hodSpacing,
			chesedCluster,
			malchusCenter,
			netzachScale
		});
		return Object.freeze({
			seed: yesodSeed,
			requestedCount: gevurahCount,
			placedCount: orPlacements.length,
			saturated: orPlacements.length < gevurahCount,
			placements: Object.freeze(orPlacements)
		});
	}
}

/** Executes a finite candidate search whose only state is the explicit recipe object. */
function revealPlacements(keliState) {
	const orPlacements = [];
	const binahLimit = keliState.gevurahCount * ATTEMPTS_PER_ROCK;
	for (let daasAttempt = 0; daasAttempt < binahLimit && orPlacements.length < keliState.gevurahCount; daasAttempt += 1) {
		const malchusPlacement = createCandidate(keliState, daasAttempt, orPlacements.length);
		if (hasSpacing(malchusPlacement, orPlacements, keliState.hodSpacing)) {
			orPlacements.push(Object.freeze(malchusPlacement));
		}
	}
	return orPlacements;
}

/** Creates one deterministic polar candidate around the configured center. */
function createCandidate(keliState, daasAttempt, netzachIndex) {
	const chesedAngle = sampleRockUnit(keliState.yesodSeed, daasAttempt, 1) * Math.PI * 2;
	const gevurahUnit = sampleRockUnit(keliState.yesodSeed, daasAttempt, 2);
	const tiferesDistance = keliState.tiferesRadius * Math.pow(gevurahUnit, 1.35 + keliState.chesedCluster * 2.8);
	const hodScale = keliState.netzachScale[0] + sampleRockUnit(keliState.yesodSeed, daasAttempt, 3) * (keliState.netzachScale[1] - keliState.netzachScale[0]);
	return {
		seed: normalizeRockSeed(keliState.yesodSeed ^ Math.imul(netzachIndex + 1, 0x9e3779b1)),
		position: Object.freeze([
			keliState.malchusCenter[0] + Math.cos(chesedAngle) * tiferesDistance,
			keliState.malchusCenter[1],
			keliState.malchusCenter[2] + Math.sin(chesedAngle) * tiferesDistance
		]),
		scale: hodScale,
		yaw: sampleRockUnit(keliState.yesodSeed, daasAttempt, 4) * Math.PI * 2
	};
}

/** Rejects candidates whose horizontal distance would violate the requested local spacing. */
function hasSpacing(malchusCandidate, orPlacements, hodSpacing) {
	return orPlacements.every(orExisting => {
		const netzachX = malchusCandidate.position[0] - orExisting.position[0];
		const hodZ = malchusCandidate.position[2] - orExisting.position[2];
		const gevurahMinimum = hodSpacing * Math.min(malchusCandidate.scale, orExisting.scale);
		return Math.hypot(netzachX, hodZ) >= gevurahMinimum;
	});
}

/** Normalizes a center point into a frozen three-number vector. */
function normalizeCenter(orCenter) {
	const yesodCenter = Array.isArray(orCenter) ? orCenter : [0, 0, 0];
	return Object.freeze([0, 1, 2].map(netzachIndex => Number(yesodCenter[netzachIndex]) || 0));
}

/** Normalizes scalar or range scale intent into an ascending frozen pair. */
function normalizeScale(orScale) {
	const yesodPair = Array.isArray(orScale) ? orScale : [0.65, 1.45];
	const gevurahMinimum = positive(yesodPair[0], 0.65);
	const chesedMaximum = positive(yesodPair[1], 1.45);
	return Object.freeze([Math.min(gevurahMinimum, chesedMaximum), Math.max(gevurahMinimum, chesedMaximum)]);
}

function positive(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue) && malchusValue > 0 ? malchusValue : yesodFallback;
}

function bounded(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	const malchusValue = Number(orValue ?? yesodFallback);
	return Math.min(chesedMaximum, Math.max(gevurahMinimum, Number.isFinite(malchusValue) ? malchusValue : yesodFallback));
}

function integer(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	return Math.floor(bounded(orValue, yesodFallback, gevurahMinimum, chesedMaximum));
}
