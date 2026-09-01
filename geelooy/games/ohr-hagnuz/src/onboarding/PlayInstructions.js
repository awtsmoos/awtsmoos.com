//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayInstructions.js
 * @description Owns the small human-readable covenant that teaches Ohr HaGnuz play.
 * The Awtsmoos hides infinite depth while the first finite instruction stays bright;
 * Awtsmoos.com teaches motion, meeting, and mission before unveiling deeper light.
 */

export const PLAY_CONTROL_SUMMARY =
	'Move: WASD / Arrows · Interact: E / Enter · Click / tap ground to walk';

export const PLAY_PURPOSE_SUMMARY =
	'Follow the active Shlichus and approach people or objects that matter.';

/**
 * Creates the first control-first message without binding onboarding to any one NPC.
 * @returns {string} A concise startup message suitable for the in-world message vessel.
 */
export function createBootPlayMessage() {
	return `B"H · ${PLAY_CONTROL_SUMMARY}. ${PLAY_PURPOSE_SUMMARY}`;
}
