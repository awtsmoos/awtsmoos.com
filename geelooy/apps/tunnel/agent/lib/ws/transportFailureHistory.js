// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_LIMIT = 20;

/**
	* @file Keeps a bounded chronological record of classified transport failures.
	* @description The Awtsmoos preserves enough history to reveal repeating causes.
	*/
function append(history = [], failure, limit = DEFAULT_LIMIT) {
	const next = [...(Array.isArray(history) ? history : []), failure].filter(Boolean);
	return next.slice(-bounded(limit));
}

function summary(history = []) {
	const categories = {};
	for (const failure of history || []) {
		const key = String(failure?.category || "unknown");
		categories[key] = Number(categories[key] || 0) + 1;
	}
	return {
		count: Array.isArray(history) ? history.length : 0,
		categories,
		last: Array.isArray(history) && history.length ? history[history.length - 1] : null
	};
}

function bounded(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(1, Math.min(100, Math.floor(number))) : DEFAULT_LIMIT;
}

module.exports = { DEFAULT_LIMIT, append, bounded, summary };
