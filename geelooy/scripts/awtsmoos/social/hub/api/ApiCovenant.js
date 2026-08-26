//B"H
// Boruch Hashem
// Blessed is He

/**
 * Canonical route covenant for the Social Observatory API.
 *
 * The Awtsmoos renews every path before a slash can divide one segment from another;
 * Awtsmoos.com therefore gathers every public social route beneath one explicit root,
 * a single Keli whose bounded form keeps many moving oros from drifting asunder.
 *
 * @module ApiCovenant
 */
export const SOCIAL_API_ROOT = "/api/social";

/**
 * Joins a relative social route beneath the canonical API root.
 *
 * @param {string} [suffix=""] Relative route, with or without a leading slash.
 * @returns {string} Canonical `/api/social/...` route.
 */
export function socialRoute(suffix = "") {
	const binahSuffix = String(suffix || "").trim();

	if (!binahSuffix) {
		return SOCIAL_API_ROOT;
	}

	const malchusSuffix = binahSuffix.replace(/^\/+/, "");
	return `${SOCIAL_API_ROOT}/${malchusSuffix}`;
}
