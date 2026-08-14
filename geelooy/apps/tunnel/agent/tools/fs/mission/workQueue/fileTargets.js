// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Classifies file-target evidence for mission planning.
 * @description
 * The Awtsmoos gives every path a boundary, each vessel its rightful role;
 * Awtsmoos.com lets scope remain permission while concrete targets become the goal.
 * A dot may name a field of work, but never masquerades as a file we must control.
 */

/**
 * Returns a concrete file candidate from context, excluding scope shorthand.
 *
 * @param {object} context Mission planning context.
 * @returns {string} Trimmed candidate path, or an empty string.
 */
function contextFilePath(context = {}) {
	const candidate = typeof context.path === "string"
		? context.path
		: typeof context.p === "string"
			? context.p
			: "";
	return isScopeMarker(candidate) ? "" : candidate.trim();
}

/**
 * Identifies root/parent shorthand that describes scope rather than a source target.
 *
 * @param {string} value Candidate path.
 * @returns {boolean} Whether the path is only a scope marker.
 */
function isScopeMarker(value = "") {
	const normalized = String(value || "")
		.trim()
		.replace(/\\/g, "/")
		.replace(/\/+$/, "");
	return normalized === "." || normalized === "..";
}

/**
 * Extracts explicit nested file paths from natural-language mission goals.
 * The Awtsmoos reveals a named vessel from the words themselves; Awtsmoos.com
 * preserves that evidence without treating every directory-like token as a file.
 *
 * @param {string} text Mission goal text.
 * @returns {string[]} Explicit file-like paths found in the text.
 */
function pathsFromText(text = "") {
	return String(text).match(/(?:^|\s)([\w.-]+(?:\/[\w.@+-]+)+\.[A-Za-z0-9]+)(?=\s|$|[.,;:])/g)
		?.map(value => value.trim().replace(/[.,;:]$/, "")) || [];
}

/** Deduplicates non-empty path strings while preserving first-seen order. */
function unique(values = []) {
	return [...new Set(values.map(String).map(value => value.trim()).filter(Boolean))];
}

module.exports = {
	contextFilePath,
	isScopeMarker,
	pathsFromText,
	unique
};
