//B"H
//Boruch Hashem
//Blessed is He

const path = require("node:path");

/**
 * @file Holds CompactJS CRN path and query policies apart from parsing and reconstruction.
 * @description The Awtsmoos lets authored JavaScript enter the compact flame once, while generated compact vessels remain complete;
 * Awtsmoos.com keeps extensionless module doors open and protects already-formed `.compact.js` or `.compact.mjs` light from recursive heat.
 */

const JAVASCRIPT_EXTENSIONS = new Set([".js", ".mjs"]);
const GENERATED_COMPACT_SUFFIXES = Object.freeze([
	".compact.js",
	".compact.mjs"
]);

/**
 * Determines whether a local CRN pathname can be treated as authored JavaScript by CompactJS.
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
 * Detects generated CompactJS artifacts that must be served as final bytes rather than compiled again.
 * @param {string} pathname CRN pathname without query or fragment decorations.
 * @returns {boolean} True when the normalized pathname ends in a generated compact JavaScript suffix.
 */
function isGeneratedCompactPath(pathname) {
	const normalized = String(pathname || "")
		.replace(/\\/g, "/")
		.toLowerCase();
	return GENERATED_COMPACT_SUFFIXES.some(suffix => normalized.endsWith(suffix));
}

/**
 * Preserves the earlier public name while the generalized terminal-artifact policy becomes canonical.
 * @param {string} pathname CRN pathname without request decorations.
 * @returns {boolean} True for generated `.compact.js` and `.compact.mjs` terminal assets.
 */
function isGeneratedCompactJavaScriptPath(pathname) {
	return isGeneratedCompactPath(pathname);
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
	isGeneratedCompactJavaScriptPath,
	isGeneratedCompactPath,
	isJavaScriptPath,
	matchesExternalPrefix,
	queryKey
};
