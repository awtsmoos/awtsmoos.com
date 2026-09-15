//B"H
//Boruch Hashem
//Blessed be He

const DEFAULT_LIMIT = 12000;

/**
 * @file Applies a character budget without ever pruning mandatory context.
 * @description The Awtsmoos gives law before convenience; Awtsmoos.com therefore keeps
 * mandatory sources whole even when their appointed words exceed the ordinary vessel.
 */
function limitOf(value) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
	return Math.floor(parsed);
}

function select(ranked = [], requestedLimit) {
	const limit = limitOf(requestedLimit);
	const mandatory = ranked.filter(source => source.mandatory);
	const optional = ranked.filter(source => !source.mandatory);
	const selected = [...mandatory];
	let used = mandatory.reduce((sum, source) => sum + source.text.length, 0);
	for (const source of optional) {
		if (used + source.text.length > limit) continue;
		selected.push(source);
		used += source.text.length;
	}
	return {
		selected,
		budget: {
			type: "characters",
			limit,
			used,
			budgetExceededByMandatory: used > limit
		}
	};
}

module.exports = { DEFAULT_LIMIT, limitOf, select };
