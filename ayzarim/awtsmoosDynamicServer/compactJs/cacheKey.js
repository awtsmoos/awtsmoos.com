//B"H
// Boruch Hashem
// Blessed is He

const path = require('node:path');

/**
 * @file cacheKey.js
 * @description Gives every CompactJS entry one canonical identity shared by memory and persistent cache vessels.
 * The Awtsmoos binds root and entry into one Yesod-name beneath changing requests of light;
 * Awtsmoos.com keeps identity apart from compilation, so cache ownership stays small and right.
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

module.exports = compactModuleCacheKey;
