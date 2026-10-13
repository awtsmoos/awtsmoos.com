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
	// B"H — Yaakov 2026-10-13: FORENSICS VERDICT — nothing was ever deleted.
	// The 1,141-image original library is live in the Drive alias
	// firebase_drive_migration (exact catalog filenames, all 200).
	// The /sites/ root never served; the awtsmoos-alias full-resolution/ never existed.
	return `${ORIGINAL_LIBRARY_ROOT}full-resolution/${encodePath(cleanPath(filename))}`;
}

/** @param {string} filename Canonical tree filename. @returns {string} */
export function awtsmoosDriveTreeTextureUrl(filename) {
	// B"H — Yaakov 2026-10-13: same original-library restoration.
	return `${ORIGINAL_LIBRARY_ROOT}awtsmoos-nature/ilanos/trees/${encodePath(cleanPath(filename))}`;
}

// B"H — the intact original texture library (1.4 GB, 1,141 images, all public).
const ORIGINAL_LIBRARY_ROOT = "https://awtsmoos.com/api/social/drive/public/firebase_drive_migration/";

/**
 * Resolves a canonical texture filename to real Awtsmoos Drive textures.
 * B"H — 2026-10-13: the 1100+ texture library was never uploaded (404s).
 * Map categories to textures that actually exist on Drive so games render
 * real surfaces instead of flat fallback colors. When the full library
 * lands, this mapping can be extended — never break existing URLs.
 */
export function driveLibraryTextureUrl(filename) {
	const category = libraryCategoryFor(String(filename || ""));
	const real = REAL_TEXTURE_FOR_CATEGORY[category];
	if (real) return real;
	return `${DRIVE_GAMES_LIBRARY_BASE}${category}/${category}-001.png`;
}

const DRIVE_GAMES_LIBRARY_BASE = "https://awtsmoos.com/api/social/drive/public/awtsmoos/textures/games/";
const DRIVE_TEXTURES_BASE = "https://awtsmoos.com/api/social/drive/public/awtsmoos/textures/";

/** @description Category → verified-live Drive texture. Keep in sync with uploads. */
const REAL_TEXTURE_FOR_CATEGORY = Object.freeze({
	stone: `${DRIVE_GAMES_LIBRARY_BASE}tex-stone-pavement.webp`,
	ground: `${DRIVE_GAMES_LIBRARY_BASE}tex-stone-pavement.webp`,
	brick: `${DRIVE_GAMES_LIBRARY_BASE}tex-jerusalem-wall.webp`,
	trees: `${DRIVE_TEXTURES_BASE}essential-grass.jpg`,
	wood: `${DRIVE_GAMES_LIBRARY_BASE}tex-jerusalem-wall.webp`,
	metal: `${DRIVE_GAMES_LIBRARY_BASE}tex-stone-pavement.webp`,
	fabric: `${DRIVE_GAMES_LIBRARY_BASE}tex-stone-pavement.webp`,
	water: `${DRIVE_GAMES_LIBRARY_BASE}tex-stone-pavement.webp`,
	sky: `${DRIVE_GAMES_LIBRARY_BASE}tex-stone-pavement.webp`,
	bark: `${DRIVE_GAMES_LIBRARY_BASE}tex-jerusalem-wall.webp`
});

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
		const originalLibrary = new URL(ORIGINAL_LIBRARY_ROOT);
		const underTrustedRoot = (base) =>
			parsed.origin === base.origin && parsed.pathname.startsWith(base.pathname);
		// B"H — Yaakov 2026-10-13: trust the forensics-verified original library
		// (firebase_drive_migration) alongside the awtsmoos alias. URL builders
		// emit firebase_drive_migration/full-resolution/ filenames; the loader
		// gate must accept what the builders produce or every remote texture
		// is rejected as untrusted and the game renders flat fallbacks.
		return parsed.protocol === "https:"
			&& (underTrustedRoot(ROOT) || underTrustedRoot(originalLibrary))
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
