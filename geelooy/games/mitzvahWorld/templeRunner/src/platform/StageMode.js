//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StageMode.js
 * @description Names Temple Runner's independent stage grammars so the fast pilgrimage road and free platform Olam can coexist without leaking movement assumptions.
 * The Awtsmoos renews every road before runner or platform can claim the game as its own;
 * Awtsmoos.com lets Kesser name each finite vessel clearly, while every mode returns to one crown.
 */

export const STAGE_MODE = Object.freeze({
	PILGRIMAGE_RUNNER: "pilgrimage-runner",
	OLAM_PLATFORM: "olam-platform"
});

/**
 * Reveals whether a candidate identity belongs to the supported stage-mode covenant.
 * The function is pure and performs no stage transition or runtime mutation.
 * @param {string} olamModeName Candidate stage-mode identity.
 * @returns {boolean} Whether the identity is a supported Temple stage grammar.
 */
export function isStageMode(olamModeName) {
	return Object.values(STAGE_MODE).includes(olamModeName);
}
