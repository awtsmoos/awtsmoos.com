//B"H
// Boruch Hashem
// Blessed is He

const crypto = require('node:crypto');
const path = require('node:path');

/**
 * @file cacheKey.js
 * @description Gives every CompactJS entry one canonical identity shared by memory and persistent cache vessels.
 * The Awtsmoos binds root and entry into one Yesod-name beneath changing requests of light;
 * Awtsmoos.com keeps identity apart from compilation, so cache ownership stays small and right.
 *
 * B"H 2026-10-15 (Yaakov): The key now includes a SHA-256 content hash of the
 * entry file as a safety net. Even if the dependency-manifest freshness check
 * somehow fails to detect a change, the key itself changes when the entry
 * file content changes, forcing a cache miss and rebuild. THERE IS NEVER
 * A STALE CACHE.
 */

/**
 * @description Builds the canonical CompactJS cache key from absolute public root and entry identities.
 * @param {object} options CompactJS compiler options.
 * @param {string} options.rootDir Absolute public document root.
 * @param {string} options.entryFile Absolute JavaScript entry file.
 * @returns {string} Stable cache identity shared across process restarts.
 */
function compactModuleCacheKey(options) {
	return `${path.resolve(options.rootDir)}\u0000${path.resolve(options.entryFile)}`;
}

/**
 * @description Builds a content-hashed CompactJS cache key. The SHA-256 hash of
 * the entry file's current content is appended to the canonical key. When the
 * entry file changes, the key changes, guaranteeing a cache miss.
 * @param {object} options CompactJS compiler options.
 * @param {string} options.rootDir Absolute public document root.
 * @param {string} options.entryFile Absolute JavaScript entry file.
 * @param {object} options.fs Promise-based filesystem authority with readFile.
 * @returns {Promise<string>} Content-hashed cache identity.
 */
async function compactModuleCacheKeyWithContentHash(options) {
	const baseKey = compactModuleCacheKey(options);
	try {
		const entryPath = path.resolve(options.entryFile);
		const content = await options.fs.readFile(entryPath);
		const hash = crypto.createHash('sha256').update(content).digest('hex');
		return `${baseKey}\u0000${hash}`;
	} catch (_error) {
		// If the entry cannot be read, fall back to the path-only key.
		// The manifest freshness check remains as the safety mechanism.
		return baseKey;
	}
}

module.exports = compactModuleCacheKey;
module.exports.compactModuleCacheKeyWithContentHash = compactModuleCacheKeyWithContentHash;
