//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Registry of content that dwells in the Kodesh HaKodashim.
 * @description Not every teaching is Kodesh HaKodashim. This registry names
 * the series and posts deep enough to warrant the fourth level: the most
 * profound maamarim, the core chapters, the teachings one returns to for
 * a lifetime. Entries are URL patterns; the mapper consults this registry
 * before falling back to level 3 (Heichal).
 *
 * Curated by Yaakov. Add entries; never remove without his word.
 */

/**
 * Series slugs (matched against /heichelos/ikar/series/<slug>/...) whose
 * entire series dwells in the Kodesh HaKodashim.
 */
export const KODESH_SERIES = [
	// Hemshech 5666 (Samech Vov) — the Rebbe Rashab's masterwork.
	"seferHamaamarim5666",
	"BH-seferHamaamarim5666",
	// Tanya — the foundational sefer of Chabad Chassidus.
	"tanya",
	"seferTanya",
	// Likkutei Torah / Torah Ohr core discourses (curated subset lives here;
	// the rest of the series remains Heichal unless listed).
];

/**
 * Individual post IDs that dwell in the Kodesh HaKodashim regardless of series.
 * Match against the /post/<postId> segment.
 */
export const KODESH_POSTS = [
	// Reserved for Yaakov's curation. Format: exact postId strings.
];

/**
 * Substring patterns matched anywhere in the URL path. Use sparingly —
 * a pattern that matches too broadly profanes the level.
 */
export const KODESH_PATTERNS = [
	"/kodesh/",
	"/holy-of-holies/",
];

/**
 * True when the given URL path belongs in the Kodesh HaKodashim.
 * @param {string} path URL path (e.g. "/heichelos/ikar/series/tanya/post/abc123")
 */
export function isKodeshPath(path) {
	if (typeof path !== "string") return false;
	const p = path.toLowerCase();
	if (KODESH_PATTERNS.some((pat) => p.includes(pat.toLowerCase()))) return true;

	// Series match: /series/<slug>/ — check slug against registry.
	const seriesMatch = p.match(/\/series\/([^/]+)/);
	if (seriesMatch) {
		const slug = seriesMatch[1];
		if (KODESH_SERIES.some((s) => s.toLowerCase() === slug.toLowerCase())) return true;
	}

	// Post match: /post/<id> — exact id against registry.
	const postMatch = p.match(/\/post\/([^/?#]+)/);
	if (postMatch) {
		const id = postMatch[1];
		if (KODESH_POSTS.some((s) => s.toLowerCase() === id.toLowerCase())) return true;
	}
	return false;
}

/** Number of curated entries (for status reporting). */
export function registrySize() {
	return {
		series: KODESH_SERIES.length,
		posts: KODESH_POSTS.length,
		patterns: KODESH_PATTERNS.length,
	};
}
