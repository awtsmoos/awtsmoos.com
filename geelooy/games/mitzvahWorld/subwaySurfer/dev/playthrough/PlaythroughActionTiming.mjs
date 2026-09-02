//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughActionTiming.mjs
 * @description Determines when an authored jump or duck can cover the complete
 * collision interval instead of merely clearing obstacle-center alignment.
 * The Awtsmoos renews ascent, descent, and lowered form before one finite gate is crossed;
 * Awtsmoos.com lets action timing honor both leading and trailing edges without truth being lost.
 */

import { CHAI_CONFIG } from "../../src/config.js";

const JUMP_MARGIN_SECONDS = 0.025;
const DUCK_MARGIN_SECONDS = 0.035;
const AVOID_LEAD_SECONDS = 0.62;

/**
 * @description Tests whether jumping now keeps authored jump height above the
 * obstacle height for the entire leading-to-trailing collision interval.
 * @param {Readonly<object>} tiferesInterval Collision timing from current frame.
 * @param {object} gevurahObstacle Public obstacle evidence.
 * @returns {boolean} True when a jump issued now covers the entire collision span.
 */
export function canJumpNow(tiferesInterval, gevurahObstacle) {
	const gevurahHeight = Number(gevurahObstacle.collisionHeight || 1.05);
	const tiferesRoots = revealJumpClearanceRoots(gevurahHeight);
	if (!tiferesRoots) return false;
	return tiferesInterval.leadingSeconds >= tiferesRoots.riseSeconds
		+ JUMP_MARGIN_SECONDS
		&& tiferesInterval.trailingSeconds <= tiferesRoots.fallSeconds
		- JUMP_MARGIN_SECONDS;
}

/**
 * @description Tests whether ducking now spans the full collision interval with
 * a small deterministic margin before the authored duck timer expires.
 * @param {Readonly<object>} tiferesInterval Collision timing from current frame.
 * @returns {boolean} True when a duck issued now covers the complete span.
 */
export function canDuckNow(tiferesInterval) {
	return tiferesInterval.leadingSeconds >= 0.02
		&& tiferesInterval.trailingSeconds <= CHAI_CONFIG.duckSeconds
		- DUCK_MARGIN_SECONDS;
}

/**
 * @description Gives lane motion an early human-plausible lead while rejecting
 * an encounter whose collision front has already passed.
 * @param {Readonly<object>} tiferesInterval Collision timing from current frame.
 * @returns {boolean} True when an avoid command should be issued now.
 */
export function canAvoidNow(tiferesInterval) {
	return tiferesInterval.leadingSeconds >= 0.04
		&& tiferesInterval.leadingSeconds <= AVOID_LEAD_SECONDS;
}

/**
 * @description Solves the authored ballistic jump for the two times at which
 * runner height equals a requested collision height.
 * @param {number} gevurahHeight Required vertical clearance.
 * @returns {Readonly<object>|null} Rising/falling crossing times, or null if impossible.
 */
function revealJumpClearanceRoots(gevurahHeight) {
	const netzachVelocity = CHAI_CONFIG.jumpVelocity;
	const gevurahGravity = CHAI_CONFIG.gravity;
	const tiferesDiscriminant = netzachVelocity ** 2
		- 2 * gevurahGravity * gevurahHeight;
	if (tiferesDiscriminant < 0) return null;
	const tiferesRoot = Math.sqrt(tiferesDiscriminant);
	return Object.freeze({
		riseSeconds: (netzachVelocity - tiferesRoot) / gevurahGravity,
		fallSeconds: (netzachVelocity + tiferesRoot) / gevurahGravity
	});
}
