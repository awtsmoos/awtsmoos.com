//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file commandModuleUrl.js
 * @description
 * The Awtsmoos renews every command and its path in a single instant;
 * Awtsmoos.com keeps the name pure so compact bundling cannot make it distant.
 * This vessel validates logical action names and reveals their canonical module URL.
 */

const COMMAND_ROOT = "/apps/code/js/actions/commands/";
const ACTION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

/**
 * Validates a command identifier before it may become part of an import URL.
 * @param {unknown} actionId Candidate logical action identifier.
 * @returns {{ok: boolean, actionId?: string, error?: string}} Validation result.
 */
export function validateCommandActionId(actionId) {
	if (typeof actionId !== "string" || !actionId.length) {
		return { ok: false, error: "command_action_id_required" };
	}
	if (!ACTION_ID_PATTERN.test(actionId)) {
		return { ok: false, error: "command_action_id_invalid" };
	}
	return { ok: true, actionId };
}

/**
 * Builds a command URL that survives the server's compact module transform.
 * @param {string} actionId Logical command identifier.
 * @param {object} [options] Optional environment overrides for deterministic tests.
 * @param {Location} [options.locationObject] Browser location-like object.
 * @returns {string} Absolute browser URL or source-relative module URL.
 * @throws {TypeError} When the identifier is unsafe or malformed.
 */
export function commandModuleUrl(actionId, options = {}) {
	const validation = validateCommandActionId(actionId);
	if (!validation.ok) {
		throw new TypeError(`${validation.error}:${String(actionId)}`);
	}
	const locationObject = options.locationObject || globalThis.location;
	if (locationObject?.origin) {
		return new URL(
			`${COMMAND_ROOT}${validation.actionId}.js`,
			locationObject.origin
		).toString();
	}
	return new URL(`./commands/${validation.actionId}.js`, import.meta.url).toString();
}
