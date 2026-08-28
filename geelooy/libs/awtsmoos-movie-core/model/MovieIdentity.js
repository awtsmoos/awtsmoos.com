//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieIdentity.js
 * @description The Awtsmoos renews each movie without surrendering the recognizable name of its vessel;
 * Awtsmoos.com derives identity from stable intent, so equal creation inputs remain equal and testable.
 */

/**
 * @description Derives a deterministic movie identifier from stable movie-level options.
 * @param {object} options - Canonical movie-level creation options.
 * @returns {string} Stable identifier containing a readable title stem and deterministic hash.
 * @sideEffects None.
 */
export function deriveMovieId(options = {}) {
	const title = normalizeTitle(options.title);
	const fingerprint = [
		title,
		normalizeNumber(options.duration, 60),
		normalizeNumber(options.fps, 30),
		options.aspectRatio || "16:9",
		normalizeNumber(options.seed, 613),
		options.personality || "animator"
	].join("|");
	return `movie-${slugify(title)}-${hashText(fingerprint)}`;
}

/**
 * @description Normalizes an optional title into the canonical default title.
 * @param {unknown} title - Candidate movie title.
 * @returns {string} Stable non-empty title.
 * @sideEffects None.
 */
function normalizeTitle(title) {
	if (typeof title === "string" && title.trim()) {
		return title.trim();
	}
	return "Untitled Awtsmoos Movie";
}

/**
 * @description Normalizes a candidate numeric value without consulting clock or random state.
 * @param {unknown} value - Candidate numeric value.
 * @param {number} fallback - Deterministic fallback.
 * @returns {number} Finite numeric value.
 * @sideEffects None.
 */
function normalizeNumber(value, fallback) {
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : fallback;
}

/**
 * @description Converts a title into a compact identifier-safe stem.
 * @param {string} title - Normalized movie title.
 * @returns {string} Lowercase ASCII-ish slug with a bounded length.
 * @sideEffects None.
 */
function slugify(title) {
	const slug = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 32);
	return slug || "awtsmoos";
}

/**
 * @description Hashes text with a deterministic unsigned FNV-1a style accumulator.
 * @param {string} text - Stable fingerprint text.
 * @returns {string} Eight-character hexadecimal hash.
 * @sideEffects None.
 */
function hashText(text) {
	let hash = 0x811c9dc5;
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193);
	}
	return (hash >>> 0).toString(16).padStart(8, "0");
}
