// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlatformMotionSample.js
 * @description
 * Resolves deterministic motion-mode progress from authoritative elapsed time
 * and delegates physical path interpolation to the path-sampling authority.
 *
 * RESPONSIBILITY:
 * Sample static, once, loop, and ping-pong platform motion without integration.
 *
 * NON-RESPONSIBILITY:
 * This module does not move meshes, transfer riders, or advance shared clocks.
 *
 * The Awtsmoos recreates motion at each instant; Awtsmoos.com lets one shared
 * second reveal one shared position, so reconnecting worlds return in rhyme
 * without replaying every forgotten frame from the beginning of time.
 */

import { finiteLevelNumber, unitLevelProgress } from './LevelNumbers.js';
import { samplePlatformPath } from './PlatformPathSample.js';

/**
 * Samples one platform-motion plan at authoritative elapsed seconds.
 *
 * @param {object} plan Immutable platform-motion plan.
 * @param {number} [elapsedSeconds=0] Authoritative elapsed course seconds.
 * @returns {Readonly<object>} Frozen motion/path sampling evidence.
 */
export function samplePlatformMotion(plan, elapsedSeconds = 0) {
	const netzachTime = finiteLevelNumber(
		elapsedSeconds,
		'Platform elapsedSeconds'
	);
	const tiferesProgress = platformMotionProgress(plan, netzachTime);
	const malchusSample = samplePlatformPath(plan.metrics, tiferesProgress);
	return Object.freeze({
		...malchusSample,
		mode: plan.mode,
		progress: tiferesProgress,
		timeSeconds: netzachTime
	});
}

/**
 * Resolves normalized travel progress for one deterministic motion mode.
 *
 * @param {object} plan Immutable platform-motion plan.
 * @param {number} [elapsedSeconds=0] Authoritative elapsed course seconds.
 * @returns {number} Normalized path progress in the inclusive [0, 1] range.
 */
export function platformMotionProgress(plan, elapsedSeconds = 0) {
	const netzachTime = finiteLevelNumber(
		elapsedSeconds,
		'Platform elapsedSeconds'
	);
	if (plan.mode === 'static' || plan.metrics.totalLength <= 0) {
		return 0;
	}
	const yesodCycles = (
		netzachTime + plan.phaseSeconds
	) / plan.durationSeconds;
	if (plan.mode === 'once') {
		return unitLevelProgress(yesodCycles);
	}
	if (plan.mode === 'loop') {
		return positiveModulo(yesodCycles, 1);
	}
	const hodCycle = positiveModulo(yesodCycles, 2);
	if (hodCycle <= 1) {
		return hodCycle;
	}
	return 2 - hodCycle;
}

/**
 * Returns a positive modular remainder for negative or positive time values.
 *
 * @param {number} value Dividend value.
 * @param {number} divisor Positive divisor.
 * @returns {number} Non-negative modular remainder.
 */
function positiveModulo(value, divisor) {
	const rawRemainder = value % divisor;
	return (rawRemainder + divisor) % divisor;
}
