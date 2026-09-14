//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Defines the two supported Chromium presentation modes for remote browsing.
 * @description
 * Ordinary browsing uses headless rendering. Provider-sensitive user login may request
 * compatibility mode, which is standard headful Chromium without anti-detection tricks.
 */

const MODES = new Set(['headless', 'compatibility']);

/**
 * Normalizes one requested engine mode and fails closed on invented values.
 * @param {unknown} value Requested public mode.
 * @returns {'headless'|'compatibility'} Canonical engine mode.
 */
function normalizeInteractiveEngineMode(value) {
	const mode = String(value || 'headless').trim().toLowerCase();
	if (MODES.has(mode)) {
		return mode;
	}
	const error = new Error('INTERACTIVE_ENGINE_MODE_INVALID');
	error.code = 'INTERACTIVE_ENGINE_MODE_INVALID';
	error.status = 400;
	throw error;
}

module.exports = {
	normalizeInteractiveEngineMode
};
