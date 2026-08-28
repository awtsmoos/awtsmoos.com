//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file cacheManifestSeal.js
 * @description Keeps dependency-cache compatibility and filesystem identity seals outside the manifest orchestration vessel.
 * The Awtsmoos lets older and newer callers enter one gate while Awtsmoos.com measures the same changing file by size, time, device, and inode;
 * thus one small module guards the remembered kli, and the public manifest river remains clear, modular, and fine.
 */

/**
 * @description Normalizes both established capture argument orders.
 * @param {object|Set<string>} first Filesystem authority or dependency set.
 * @param {Set<string>|object} second Dependency set or filesystem authority.
 * @returns {{dependencies:Set<string>,fs:object}} Canonical capture arguments.
 */
function normalizeCaptureArguments(first, second) {
	return first instanceof Set
		? { dependencies: first, fs: second }
		: { dependencies: second, fs: first };
}

/**
 * @description Normalizes both established freshness argument orders.
 * @param {object|Map<string, object>} first Filesystem authority or dependency manifest.
 * @param {Map<string, object>|object} second Dependency manifest or filesystem authority.
 * @returns {{fs:object,manifest:Map<string, object>}} Canonical freshness arguments.
 */
function normalizeFreshArguments(first, second) {
	return first instanceof Map
		? { fs: second, manifest: first }
		: { fs: first, manifest: second };
}

/**
 * @description Creates one filesystem identity and mutation signature for a compiled dependency.
 * @param {object} stats Node-like stat result.
 * @returns {object} Stable dependency seal.
 */
function createDependencySignature(stats) {
	return {
		ctimeMs: Number(stats.ctimeMs ?? stats.ctime?.getTime?.() ?? 0),
		dev: Number(stats.dev ?? 0),
		ino: Number(stats.ino ?? 0),
		mtimeMs: Number(stats.mtimeMs ?? stats.mtime?.getTime?.() ?? 0),
		size: Number(stats.size ?? 0)
	};
}

/**
 * @description Compares every sealed filesystem field without silently weakening freshness.
 * @param {object} current Current dependency signature.
 * @param {object} expected Previously captured signature.
 * @returns {boolean} True only when the signatures are exact.
 */
function sameDependencySignature(current, expected) {
	return current.ctimeMs === expected.ctimeMs
		&& current.dev === expected.dev
		&& current.ino === expected.ino
		&& current.mtimeMs === expected.mtimeMs
		&& current.size === expected.size;
}

module.exports = {
	createDependencySignature,
	normalizeCaptureArguments,
	normalizeFreshArguments,
	sameDependencySignature
};
