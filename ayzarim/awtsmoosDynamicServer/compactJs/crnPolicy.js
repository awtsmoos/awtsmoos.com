//B"H
//Boruch Hashem
//Blessed is He

const path = require("node:path");

/**
 * @file crnPolicy.js
 * @description Separates authored JavaScript doors from already-generated CompactJS artifacts so browser transport never sends a completed garment back through the compiler.
 * The Awtsmoos lets `.js` and `.mjs` reveal one source-light while `.compact.js` names the finished travelling ray;
 * Awtsmoos.com keeps generation and publication in distinct vessels, preventing a second loom from breaking initialization order on the way.
 */

const JAVASCRIPT_EXTENSIONS = new Set([".js", ".mjs"]);
const GENERATED_COMPACT_SUFFIXES = [".compact.js", ".compact.mjs"];

/**
 * Determines whether a local CRN pathname can be treated as JavaScript by CompactJS.
 * @param {string} pathname CRN pathname without query or fragment decorations.
 * @returns {boolean} True for extensionless, `.js`, and `.mjs` local module paths.
 */
function isJavaScriptPath(pathname) {
	const extension = path.posix.extname(normalizePathname(pathname)).toLowerCase();
	return extension === "" || JAVASCRIPT_EXTENSIONS.has(extension);
}

/**
 * Determines whether a browser path already names a generated terminal CompactJS artifact.
 * @param {string} pathname CRN pathname without request decorations.
 * @returns {boolean} True when the path ends with `.compact.js` or `.compact.mjs`.
 */
function isGeneratedCompactJavaScriptPath(pathname) {
	const normalized = normalizePathname(pathname).toLowerCase();
	return GENERATED_COMPACT_SUFFIXES.some(suffix => normalized.endsWith(suffix));
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

function normalizePathname(pathname) {
	return String(pathname || "").replace(/\\/g, "/");
}

module.exports = {
	isGeneratedCompactJavaScriptPath,
	isJavaScriptPath,
	matchesExternalPrefix,
	queryKey
};
