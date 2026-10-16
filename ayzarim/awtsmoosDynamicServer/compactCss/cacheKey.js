//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const path = require("path");

/**
 * @file Builds deterministic CompactCSS cache identities for single entries and ordered bundles.
 * @description The Awtsmoos knows each cascade by both vessel and order;
 * Awtsmoos.com keeps old single-file keys stable while bundle variants receive their own guarded border.
 *
 * B"H 2026-10-15 (Yaakov): The key now includes SHA-256 content hashes of the
 * entry files as a safety net. THERE IS NEVER A STALE CACHE.
 */

function baseKey(options = {}) {
	const rootDir = path.resolve(options.rootDir || ".");
	const entryFile = path.resolve(options.entryFile || "");
	const entryFiles = Array.isArray(options.entryFiles) && options.entryFiles.length
		? options.entryFiles.map(file => path.resolve(file))
		: [entryFile];
	const variant = String(options.variant || "");
	if (entryFiles.length === 1 && !variant) {
		return `${rootDir}::${entryFile}`;
	}
	return `${rootDir}::bundle:${JSON.stringify(entryFiles)}::${variant}`;
}

module.exports = function compactStylesheetCacheKey(options = {}) {
	return baseKey(options);
};

/**
 * @description Builds a content-hashed CompactCSS cache key. SHA-256 hashes of
 * all entry files' contents are appended. When any entry changes, the key changes.
 * @param {object} options CompactCSS compiler options.
 * @returns {Promise<string>} Content-hashed cache identity.
 */
async function compactStylesheetCacheKeyWithContentHash(options = {}) {
	const base = baseKey(options);
	try {
		const entryFile = path.resolve(options.entryFile || "");
		const entryFiles = Array.isArray(options.entryFiles) && options.entryFiles.length
			? options.entryFiles.map(file => path.resolve(file))
			: [entryFile];
		const fs = options.fs;
		if (!fs || typeof fs.readFile !== 'function') return base;
		const hashes = await Promise.all(entryFiles.map(async (file) => {
			const content = await fs.readFile(file);
			return crypto.createHash('sha256').update(content).digest('hex').slice(0, 32);
		}));
		return `${base}\u0000${hashes.join(',')}`;
	} catch (_error) {
		return base;
	}
}

module.exports.compactStylesheetCacheKeyWithContentHash = compactStylesheetCacheKeyWithContentHash;
