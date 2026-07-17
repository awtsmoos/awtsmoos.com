// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

/**
 * Deeply freezes JSON-safe artifact metadata without mutating caller data.
 *
 * @param {*} value JSON-safe value.
 * @returns {*} Frozen defensive value.
 */
export function freezeArtifactValue(value) {
	if (Array.isArray(value)) {
		return Object.freeze(value.map(freezeArtifactValue));
	}
	if (value && typeof value === "object") {
		const frozen = {};
		for (const [key, child] of Object.entries(value)) {
			frozen[key] = freezeArtifactValue(child);
		}
		return Object.freeze(frozen);
	}
	return value;
}
