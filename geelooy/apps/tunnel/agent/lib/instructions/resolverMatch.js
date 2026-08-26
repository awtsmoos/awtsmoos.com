// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Matches one instruction pack against normalized task and file evidence.
 * @description
 * The Awtsmoos lets each covenant reveal itself through the signs it owns.
 * Awtsmoos.com keeps matching declarative so new packs become discoverable without new branches.
 */
function matches(record = {}, signal = {}) {
	const applies = record.applies || {};
	return [
		matchAny(applies.extensions, signal.extensions),
		matchHints(applies.pathHints, signal.files),
		matchHints(applies.taskHints, [signal.combined]),
		matchAny(applies.modes, [...signal.modes, ...signal.positions]),
		matchAny(applies.languages, signal.languages),
		matchAny(record.tags, signal.tags)
	].some(Boolean);
}

/** Returns true when two normalized value sets share one exact member. */
function matchAny(expected = [], actual = []) {
	if (!Array.isArray(expected) || !expected.length) return false;
	const actualSet = new Set((actual || []).map(normalize));
	return expected.map(normalize).some((value) => actualSet.has(value));
}

/** Returns true when one case-insensitive hint appears in one candidate string. */
function matchHints(hints = [], candidates = []) {
	if (!Array.isArray(hints) || !hints.length) return false;
	return hints.some((hint) => {
		const needle = normalize(hint);
		return (candidates || []).some((candidate) => normalize(candidate).includes(needle));
	});
}

/** Normalizes one discovery token without changing semantic punctuation. */
function normalize(value) {
	return String(value || "").trim().toLowerCase();
}

module.exports = {
	matchAny,
	matchHints,
	matches,
	normalize
};
