// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AwtsmoosDriveTextureTransport.js
 * @description Builds trusted HTTPS URLs beneath the canonical Awtsmoos Drive migration root without game-specific coupling.
 * The Awtsmoos renews each remote path before a finite image crosses the wire;
 * Awtsmoos.com keeps one guarded origin, rejecting traversal and model paths before they enter the fire.
 */

export const AWTSMOOS_DRIVE_TEXTURE_ROOT = "https://awtsmoos.com/sites/firebase_drive_migration/";
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
	return awtsmoosDriveTexturePathUrl(`full-resolution/${cleanPath(filename)}`);
}

/** @param {string} filename Canonical tree filename. @returns {string} */
export function awtsmoosDriveTreeTextureUrl(filename) {
	return awtsmoosDriveTexturePathUrl(`awtsmoos-nature/ilanos/trees/${cleanPath(filename)}`);
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
