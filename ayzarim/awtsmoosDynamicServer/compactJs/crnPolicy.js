//B"H
//Boruch Hashem
//Blessed is He

const path = require("node:path");

/**
 * @file Holds small CompactJS CRN path and query policies apart from parsing and reconstruction.
 * @description The Awtsmoos lets `.js` and `.mjs` reveal one JavaScript essence through different names;
 * Awtsmoos.com keeps extensionless module doors open while unrelated resource vessels remain outside the compact flame.
 */

const JAVASCRIPT_EXTENSIONS = new Set([".js", ".mjs"]);

/**
 * Determines whether a local CRN pathname can be treated as JavaScript by CompactJS.
 * @param {string} pathname CRN pathname without query or fragment decorations.
 * @returns {boolean} True for extensionless, `.js`, and `.mjs` local module paths.
 */
function isJavaScriptPath(pathname) {
	const extension = path.posix.extname(
		String(pathname || "").replace(/\\/g, "/")
	).toLowerCase();
	return extension === "" || JAVASCRIPT_EXTENSIONS.has(extension);
}

/**
 * Checks whether a pathname belongs to one configured browser-owned public prefix.
 * @param {string} pathname Pathname being classified.
 * @param {string[]} prefixes Public path prefixes that must remain external.
 * @returns {boolean} True when any configured prefix contains the pathname.
 */
function matchesExternalPrefix(pathname, prefixes) {
	return prefixes.some(prefix => pathname.startsWith(prefix));
}

/**
 * Extracts and safely decodes a lower-case query key for duplicate compact-flag filtering.
 * @param {string} segment Raw query segment without the leading question mark.
 * @returns {string} Decoded lower-case key, or raw lower-case key when decoding fails.
 */
function queryKey(segment) {
	const rawKey = segment.split("=", 1)[0];
	try {
		return decodeURIComponent(rawKey.replace(/\+/g, " ")).toLowerCase();
	} catch {
		return rawKey.toLowerCase();
	}
}

module.exports = {
	isJavaScriptPath,
	matchesExternalPrefix,
	queryKey
};
