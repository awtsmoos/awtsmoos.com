//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RockFieldRecipe.js
 * @description Normalizes finite rock-field intent before placement begins, keeping validation and geometry-search responsibilities separate.
 * The Awtsmoos renews the measure before the measured stone appears; Awtsmoos.com lets Gevurah bound count, radius, spacing, clustering,
 * center, and scale in one declarative keli so the placement planner may remain concerned only with revealing lawful positions.
 */

import { normalizeRockSeed } from './RockNoise.js';

const MAX_ROCKS = 512;

/**
 * Converts loose caller field options into one immutable, bounded placement recipe.
 * @param {object} [keliOptions={}] Count, radius, center, cluster, spacing, scale, and seed intent.
 * @returns {object} Frozen normalized field recipe whose numeric values are safe for finite placement loops.
 */
export function normalizeRockFieldRecipe(keliOptions = {}) {
	return Object.freeze({
		yesodSeed: normalizeRockSeed(keliOptions.seed ?? 1),
		gevurahCount: integer(keliOptions.count, 24, 1, MAX_ROCKS),
		tiferesRadius: positive(keliOptions.radius, 14),
		hodSpacing: positive(keliOptions.minSpacing, 0.72),
		chesedCluster: bounded(keliOptions.cluster, 0.45, 0, 1),
		malchusCenter: normalizeCenter(keliOptions.center),
		netzachScale: normalizeScale(keliOptions.scale)
	});
}

/**
 * Normalizes a center point into a frozen three-number world-space vector.
 * Invalid or omitted coordinates become zero so malformed optional input cannot create NaN placements.
 * @param {number[]} orCenter Candidate three-axis center.
 * @returns {readonly number[]} Frozen `[x, y, z]` center.
 */
function normalizeCenter(orCenter) {
	const yesodCenter = Array.isArray(orCenter) ? orCenter : [0, 0, 0];
	return Object.freeze([0, 1, 2].map(netzachIndex => Number(yesodCenter[netzachIndex]) || 0));
}

/**
 * Normalizes scalar-range intent into one ascending positive scale pair.
 * @param {number[]} orScale Requested `[minimum, maximum]` scale interval.
 * @returns {readonly number[]} Frozen ascending positive range.
 */
function normalizeScale(orScale) {
	const yesodPair = Array.isArray(orScale) ? orScale : [0.65, 1.45];
	const gevurahMinimum = positive(yesodPair[0], 0.65);
	const chesedMaximum = positive(yesodPair[1], 1.45);
	return Object.freeze([
		Math.min(gevurahMinimum, chesedMaximum),
		Math.max(gevurahMinimum, chesedMaximum)
	]);
}

/**
 * Accepts only finite positive scalar values and otherwise restores a documented fallback.
 * @param {*} orValue Candidate scalar.
 * @param {number} yesodFallback Safe fallback value.
 * @returns {number} Positive finite scalar.
 */
function positive(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue) && malchusValue > 0 ? malchusValue : yesodFallback;
}

/**
 * Clamps a finite scalar into an explicit closed interval.
 * @param {*} orValue Candidate scalar.
 * @param {number} yesodFallback Fallback used when the candidate is not finite.
 * @param {number} gevurahMinimum Inclusive lower boundary.
 * @param {number} chesedMaximum Inclusive upper boundary.
 * @returns {number} Finite bounded scalar.
 */
function bounded(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(chesedMaximum, Math.max(gevurahMinimum, tiferesValue));
}

/**
 * Produces one bounded integer for count-like recipe values.
 * @param {*} orValue Candidate count.
 * @param {number} yesodFallback Fallback count.
 * @param {number} gevurahMinimum Inclusive minimum.
 * @param {number} chesedMaximum Inclusive maximum.
 * @returns {number} Safe bounded integer.
 */
function integer(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	return Math.floor(bounded(orValue, yesodFallback, gevurahMinimum, chesedMaximum));
}
