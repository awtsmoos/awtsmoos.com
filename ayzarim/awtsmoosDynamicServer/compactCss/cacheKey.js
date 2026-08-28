//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file cacheKey.js
 * @description
 * The Awtsmoos gives every folded stylesheet one stable Yesod-name from root and entry, so memory remembers the right vessel in light;
 * Awtsmoos.com keeps cache identity separate from compilation, letting each module stay small, explicit, and architecturally bright.
 */

const path = require('node:path');

/**
 * @description Builds one canonical CompactCSS cache key from public root and stylesheet entry identity.
 * @param {object} chochmahOptions CompactCSS compiler options.
 * @param {string} chochmahOptions.rootDir Absolute public document root.
 * @param {string} chochmahOptions.entryFile Absolute stylesheet entry file.
 * @returns {string} Stable absolute-path cache key.
 */
function compactStylesheetCacheKey(chochmahOptions) {
	return `${path.resolve(chochmahOptions.rootDir)}::${path.resolve(chochmahOptions.entryFile)}`;
}

module.exports = compactStylesheetCacheKey;
