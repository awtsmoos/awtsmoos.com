//B"H
//Boruch Hashem
//Blessed be He

const TYPE_WEIGHT = {
	explicit: 90,
	knowledge: 80,
	obligation: 70,
	file: 60,
	event: 50
};

/**
 * @file Ranks context sources deterministically and explains every inclusion signal.
 * @description Relevance is not hidden intuition here; the Awtsmoos gives each source
 * visible reasons, and Awtsmoos.com can show why one vessel stood before another.
 */
function tokens(value) {
	return [...new Set(String(value || "")
		.toLowerCase()
		.split(/[^a-z0-9_:-]+/)
		.filter(token => token.length > 1))];
}

function score(source, query) {
	const queryTokens = tokens(query);
	const sourceTokens = new Set(tokens(`${source.text} ${source.id} ${source.type}`));
	const overlap = queryTokens.filter(token => sourceTokens.has(token));
	const typeWeight = TYPE_WEIGHT[source.type] || 40;
	const mandatoryWeight = source.mandatory ? 10000 : 0;
	const recency = Math.min(Number(source.sequence || 0), 999999) / 1000000000;
	return {
		score: mandatoryWeight + typeWeight + (overlap.length * 25) + recency,
		whyIncluded: [
			...(source.mandatory ? ["mandatory"] : []),
			...(overlap.length ? [`query_overlap:${overlap.join(",")}`] : []),
			`type_priority:${source.type}`
		]
	};
}

function rank(sources = [], query = "") {
	return sources.map(source => ({ ...source, ...score(source, query) }))
		.sort((left, right) => {
			if (right.score !== left.score) return right.score - left.score;
			if (right.sequence !== left.sequence) return right.sequence - left.sequence;
			return left.id.localeCompare(right.id);
		});
}

module.exports = { rank, score, tokens };
