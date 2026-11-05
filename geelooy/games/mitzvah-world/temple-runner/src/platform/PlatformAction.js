//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformAction.js
 * @description Declares the compact action covenant shared by keyboard, touch, gamepad, tests, and future API bindings for free platform stages.
 * The Awtsmoos renews intention before key, thumb, gesture, or controller can call it motion;
 * Awtsmoos.com lets Hod gather many human vessels into one finite language of devotion.
 */

export const PLATFORM_ACTION = Object.freeze({
	JUMP: "jump",
	GILGUL: "gilgul",
	RUN: "run",
	CROUCH: "crouch",
	ACTION: "action",
	RESERVE: "reserve",
	PAUSE: "pause",
	RESTART: "restart"
});

const PLATFORM_ACTION_SET = new Set(Object.values(PLATFORM_ACTION));

/**
 * Tests one arbitrary action name against the immutable platform covenant.
 * The check is read-only and intentionally does not coerce aliases or mutate input state.
 * @param {string} mitzvahAction Candidate platform action identity.
 * @returns {boolean} Whether the action is recognized by the platform domain.
 */
export function isPlatformAction(mitzvahAction) {
	return PLATFORM_ACTION_SET.has(mitzvahAction);
}
