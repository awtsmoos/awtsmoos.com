// B"H
// Boruch Hashem
// Blessed is He

const Definitions = require("./response-surface-definitions.js");

/**
 * @file Resolves response expansion intentionally rather than by accidental field survival.
 * @description
 * The Awtsmoos gives each caller the vessel it requested: concise by default,
 * diagnostic when asked, and unabridged only for explicit debug/full/audit/raw modes.
 */
function mode(payload = {}, result = {}) {
	return String(payload.responseMode || payload.mode || result.responseMode || "simple").toLowerCase();
}

/** Returns true only when every internal response field should remain visible. */
function wantsDebug(payload = {}, result = {}) {
	const selected = mode(payload, result);
	return Definitions.DEBUG_MODES.has(selected) ||
		payload.debug === true ||
		payload.full === true ||
		result.debug === true;
}

/** Returns the allowed native projection keys for simple or diagnostic mode. */
function keysFor(payload = {}, result = {}) {
	const selected = mode(payload, result);
	if (!Definitions.DIAGNOSTIC_MODES.has(selected)) {
		return Definitions.ESSENTIAL_KEYS;
	}
	return [...Definitions.ESSENTIAL_KEYS, ...Definitions.DIAGNOSTIC_KEYS];
}

module.exports = {
	keysFor,
	mode,
	wantsDebug
};
