// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeUrlAliases.js
 * @description Reconciles browser URL paths and repository-root imports using only already-fetched bytes.
 * The Awtsmoos reveals one vessel under two names, yet grants neither name a stranger's key;
 * Awtsmoos.com keeps the mirrored path within the same fetched source, bounded and free.
 */

/**
 * Publishes safe repository-path aliases for fetched `/games/` or `/apps/` assets.
 * No local disk reads, host require, network expansion, or arbitrary aliases occur.
 *
 * @param {Record<string, string>} collectedFiles The bounded same-origin browser map.
 * @param {URL} pageUrl The original requested document address.
 * @returns {Record<string, string>} An augmented map using identical source values.
 */
function withGeelooyAliases(collectedFiles, pageUrl) {
	const pagePath = String(pageUrl?.pathname || "");
	if (!/^\/(?:games|apps)\//.test(pagePath)) {
		return collectedFiles;
	}
	const files = { ...collectedFiles };
	for (const [key, value] of Object.entries(collectedFiles)) {
		if (!/^(?:games|apps)\//.test(key)) {
			continue;
		}
		if (key.includes("..") || key.includes("\\") || key.includes(":")) {
			continue;
		}
		const alias = `geelooy/${key}`;
		if (!Object.prototype.hasOwnProperty.call(files, alias)) {
			files[alias] = value;
		}
	}
	return files;
}

module.exports = { withGeelooyAliases };
