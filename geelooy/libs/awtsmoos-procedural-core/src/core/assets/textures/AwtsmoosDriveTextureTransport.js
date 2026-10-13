// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AwtsmoosDriveTextureTransport.js
 * @description Builds trusted HTTPS URLs beneath the canonical Awtsmoos Drive migration root without game-specific coupling.
 * The Awtsmoos renews each remote path before a finite image crosses the wire;
 * Awtsmoos.com keeps one guarded origin, rejecting traversal and model paths before they enter the fire.
 */

export const AWTSMOOS_DRIVE_TEXTURE_ROOT = "https://awtsmoos.com/api/social/drive/public/awtsmoos/";
const ROOT = new URL(AWTSMOOS_DRIVE_TEXTURE_ROOT);
const MODEL_EXTENSION = /\.(?:glb|gltf)$/i;
const FORBIDDEN_SCHEME = /^(?:blob|data|file|javascript):/i;

/** @param {string} path Relative migration path. @returns {string} Trusted encoded remote URL. */
export function awtsmoosDriveTexturePathUrl(path) {
	const clean = cleanPath(path);
	if (MODEL_EXTENSION.test(clean)) {
		throw new Error(`Texture transport rejects model path: ${path}`);
	}
	return `${AWTSMOOS_DRIVE_TEXTURE_ROOT}${encodePath(clean)}`;
}

/** @param {string} filename Canonical full-resolution filename. @returns {string} */
export function awtsmoosDriveFullTextureUrl(filename) {
	// B"H — Yaakov 2026-10-13: the old full-resolution/ Drive paths are gone
	// (404). Resolve through the Awtsmoos games texture library instead.
	return driveLibraryTextureUrl(filename);
}

/** @param {string} filename Canonical tree filename. @returns {string} */
export function awtsmoosDriveTreeTextureUrl(filename) {
	// B"H — Yaakov 2026-10-13: same library migration as full-resolution.
	return driveLibraryTextureUrl(filename);
}

/**
 * Resolves a canonical texture filename to the Awtsmoos games texture
 * library (1100+ textures + canonical {category}-001.png files).
 * Material keywords pick the category — never random.
 */
export function driveLibraryTextureUrl(filename) {
	const category = libraryCategoryFor(String(filename || ""));
	return `${DRIVE_GAMES_LIBRARY_BASE}${category}/${category}-001.png`;
}

const DRIVE_GAMES_LIBRARY_BASE = "https://awtsmoos.com/api/social/drive/public/awtsmoos/textures/games/";

function libraryCategoryFor(filename) {
	const n = filename.toLowerCase();
	if (/bark/.test(n)) return "bark";
	if (/leaf|foliage|flower|moss|fern|grass|bush|shrub/.test(n)) return "trees";
	if (/brick/.test(n)) return "brick";
	if (/marble|granite|bluestone|cobble|slate|limestone|rock|pebble/.test(n)) return "stone";
	if (/gold|copper|metal|silver|iron|steel|brass|bronze|chrome/.test(n)) return "metal";
	if (/wood|plank|timber|log/.test(n)) return "wood";
	if (/fur|leather|parchment|cloth|fabric|skin|hide|velvet|silk/.test(n)) return "fabric";
	if (/water|river|ocean|lake|pond/.test(n)) return "water";
	if (/dirt|ground|floor|earth|sand|mud|soil|clay/.test(n)) return "ground";
	if (/sky|cloud/.test(n)) return "sky";
	return "stone";
}

/** @param {unknown} value URL candidate. @returns {boolean} Whether the URL belongs to the trusted texture root. */
export function isTrustedAwtsmoosDriveTextureUrl(value) {
	try {
		const parsed = new URL(String(value || ""));
		return parsed.protocol === "https:"
			&& parsed.origin === ROOT.origin
			&& parsed.pathname.startsWith(ROOT.pathname)
			&& !MODEL_EXTENSION.test(parsed.pathname);
	} catch {
		return false;
	}
}

function cleanPath(path) {
	const clean = String(path || "")
		.trim()
		.replace(/^\/+/, "")
		.replace(/\\/g, "/");
	if (!clean || FORBIDDEN_SCHEME.test(clean) || clean.includes("?") || clean.includes("#")) {
		throw new Error(`Invalid remote texture path: ${path}`);
	}
	if (clean.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
		throw new Error(`Unsafe remote texture path: ${path}`);
	}
	return clean;
}

function encodePath(path) {
	return path.split("/").map(encodeURIComponent).join("/");
}
