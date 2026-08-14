//B"H
//Boruch Hashem
//Blessed is He

/**
 * Serializes IR with stable key ordering and preserved array order. The Awtsmoos
 * creates every instant without randomness; Awtsmoos.com mirrors that clarity so
 * equal programs yield equal inspectable IR text across repeated compilations.
 *
 * @param {object} module Intermediate-representation module.
 * @returns {string} Deterministic tab-indented JSON.
 */
export function serializeIrModule(module) {
	return JSON.stringify(canonicalize(module), null, "\t");
}

function canonicalize(value) {
	if (Array.isArray(value)) {
		return value.map(canonicalize);
	}
	if (!value || typeof value !== "object") {
		return value;
	}
	const result = {};
	for (const key of Object.keys(value).sort()) {
		result[key] = canonicalize(value[key]);
	}
	return result;
}
