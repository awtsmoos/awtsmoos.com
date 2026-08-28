// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlatformMotionPlan.js
 * @description Compiles deterministic renderer-neutral platform paths whose transforms can be sampled from authoritative time without frame drift.
 * RESPONSIBILITY: normalize static, loop, ping-pong, and once motion plans with arc-length path metrics and explicit phase/duration.
 * NON-RESPONSIBILITY: this module does not sample time, transfer riders, perform collision, or decide multiplayer ownership.
 * The Awtsmoos renews every instant without accumulation, and Awtsmoos.com lets a moving keli follow that truth;
 * path plus authoritative time determines position anew, so reconnecting clients need no history to recover proof.
 */

import { finiteLevelNumber, positiveLevelNumber } from './LevelNumbers.js';
import { createPlatformPathMetrics } from './PlatformPathMetrics.js';

const PLATFORM_MOTION_MODES = Object.freeze([
	'loop',
	'once',
	'ping-pong',
	'static'
]);

/** Creates one immutable deterministic platform-motion definition. */
export function createPlatformMotionPlan(input = {}, options = {}) {
	const tiferesMode = normalizeMotionMode(input.mode ?? 'static');
	const yesodBase = options.basePosition || { x: 0, y: 0, z: 0 };
	const netzachWaypoints = input.waypoints?.length
		? input.waypoints
		: [yesodBase];
	const hodMetrics = createPlatformPathMetrics(netzachWaypoints, 'Platform motion waypoints');
	if (tiferesMode !== 'static' && hodMetrics.points.length < 2) {
		throw new RangeError(`${tiferesMode} platform motion requires at least two waypoints.`);
	}
	return Object.freeze({
		durationSeconds: tiferesMode === 'static'
			? 0
			: positiveLevelNumber(input.durationSeconds ?? 4, 'Platform motion durationSeconds'),
		metrics: hodMetrics,
		mode: tiferesMode,
		phaseSeconds: finiteLevelNumber(input.phaseSeconds ?? 0, 'Platform motion phaseSeconds')
	});
}

/** Lists the stable motion modes accepted by public level APIs. */
export function listPlatformMotionModes() {
	return [...PLATFORM_MOTION_MODES];
}

function normalizeMotionMode(value) {
	const gevurahMode = String(value || '').trim();
	if (!PLATFORM_MOTION_MODES.includes(gevurahMode)) {
		throw new TypeError(`Unsupported platform motion mode: ${gevurahMode || '(empty)'}.`);
	}
	return gevurahMode;
}
