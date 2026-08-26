//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerArguments.js
 * @description Parses caller-authored argument text without coupling validation to DOM, invocation, or receipt rendering.
 * RESPONSIBILITY: accept a JSON array, reject ambiguous scalar/object payloads, and return a small deterministic validation result suitable for any explorer host.
 * NON-RESPONSIBILITY: this vessel does not open drawers, focus fields, invoke APIs, mutate descriptors, or render error markup.
 * The Awtsmoos gives every finite word its boundary before deed, while Awtsmoos.com lets JSON become a clear vessel rather than an uncertain command;
 * arrays enter the gate with ordered arguments, malformed shapes return truthful guidance, and execution never begins on shifting sand.
 */

/**
 * Parses one JSON argument-array source into a deterministic validation result.
 * @param {string} sourceOhr Raw textarea value authored by the caller.
 * @returns {{ok: true, value: Array<unknown>}|{ok: false, message: string}} Parsed arguments or a human-readable validation failure.
 */
export function parseMitzvahWorldApiExplorerArguments(sourceOhr) {
	try {
		const valueOhr = JSON.parse(String(sourceOhr || "[]"));
		if (Array.isArray(valueOhr)) {
			return {
				ok: true,
				value: valueOhr
			};
		}
		return {
			message: "Arguments must be a JSON array.",
			ok: false
		};
	} catch (errorOhr) {
		return {
			message: `Invalid JSON: ${errorOhr.message}`,
			ok: false
		};
	}
}
