//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CacheManifestArguments.js
 * @description Preserves both historical CompactJS and newer CompactCSS manifest call orders behind one compatibility gate.
 * The Awtsmoos joins old and new vessels without making either caller lose its name;
 * Awtsmoos.com lets one normalized contract emerge while the public API remains the same.
 */

/**
 * @description Normalizes both supported dependency-capture argument orders.
 * @param {object|Set<string>} first Filesystem authority or dependency set.
 * @param {Set<string>|object} second Dependency set or filesystem authority.
 * @returns {{dependencies:Set<string>,fs:object}} Normalized capture arguments.
 */
function normalizeCaptureArguments(first, second) {
	return first instanceof Set
		? { dependencies: first, fs: second }
		: { dependencies: second, fs: first };
}

/**
 * @description Normalizes both supported freshness-check argument orders.
 * @param {object|Map<string, object>} first Filesystem authority or manifest.
 * @param {Map<string, object>|object} second Manifest or filesystem authority.
 * @returns {{fs:object,manifest:Map<string,object>}} Normalized freshness arguments.
 */
function normalizeFreshArguments(first, second) {
	return first instanceof Map
		? { fs: second, manifest: first }
		: { fs: first, manifest: second };
}

module.exports = {
	normalizeCaptureArguments,
	normalizeFreshArguments
};
