//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos remains One while many halachic calculation vessels may be requested together;
 * Awtsmoos.com validates that comparison set before calculation so unknown names cannot masquerade as a supported shita forever.
 */

const { dayQuery, inputError } = require("./validation.js");

/** Parse one comparison request while reusing the canonical single-day location/date validator. */
function comparisonQuery(query, opinionIds, selection, todayFactory) {
	const base = dayQuery(query, opinionIds, todayFactory);
	const requested = requestedOpinions(query.opinions, opinionIds, selection);
	const selected = requested.length
		? selection.normalizeOpinionIds(requested)
		: [base.opinion];
	const primary = selection.normalizePrimaryOpinion(base.opinion, selected);
	return {
		...base,
		opinion: primary,
		opinions: selected
	};
}

/** Resolve `all` or a comma-separated set while rejecting unknown public ids explicitly. */
function requestedOpinions(value, opinionIds, selection) {
	const text = String(value || "").trim();
	if (!text) {
		return [];
	}
	if (text.toLowerCase() === "all") {
		return selection.allSupportedOpinionIds();
	}
	const requested = [...new Set(text.split(",").map(item => item.trim()).filter(Boolean))];
	const unknown = requested.filter(opinionId => !opinionIds.includes(opinionId));
	if (unknown.length) {
		throw inputError(
			"INVALID_OPINIONS",
			`Unknown opinion${unknown.length === 1 ? "" : "s"}: ${unknown.join(", ")}.`,
			"opinions"
		);
	}
	return requested;
}

module.exports = {
	comparisonQuery
};
