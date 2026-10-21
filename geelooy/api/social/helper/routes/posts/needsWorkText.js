//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module NeedsWorkText
 * @description
 * Sibling of NeedsWorkRoutes: blank/int helpers and post text collection, relocated verbatim.
 */

function isBlank(value) {
	if (value === undefined || value === null) return true;
	if (typeof value === "string") return !value.trim();
	if (Array.isArray(value)) return value.length === 0;
	if (typeof value === "object") return Object.keys(value).length === 0;
	return false;
}

function queryInt(value, fallback, min, max) {
	const n = parseInt(value, 10);
	if (Number.isNaN(n)) return fallback;
	return Math.max(min, Math.min(max, n));
}

/** Collect searchable text from a post record (capped, read-only). */
function collectText(post, cap = 200000) {
	const parts = [];
	function push(value) {
		if (typeof value !== "string" || !value) return;
		if (parts.join("\n").length > cap) return;
		parts.push(value.slice(0, cap));
	}
	if (post && typeof post === "object") {
		if (post.source && Array.isArray(post.source.sections)) {
			for (const section of post.source.sections) push(section && section.originalText);
		}
		if (Array.isArray(post.units)) {
			for (const unit of post.units) {
				push(unit && unit.hebrew);
				push(unit && unit.english);
			}
		}
		const readable = post.translation && post.translation.readable;
		if (typeof readable === "string") push(readable);
		else if (readable && typeof readable === "object") {
			for (const value of Object.values(readable)) push(value);
		}
	}
	return parts.join("\n").slice(0, cap);
}

function countPageMarkers(text) {
	const valid = text.match(/\[p\.\s*\d+\s*\]/g) || [];
	const candidates = text.match(/\[p\.[^\]]*\]/g) || [];
	return { valid: valid.length, broken: Math.max(0, candidates.length - valid.length) };
}

module.exports = {
	isBlank,
	queryInt,
	collectText,
	countPageMarkers
};
