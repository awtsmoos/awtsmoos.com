//B"H
//Boruch Hashem
//Blessed is He

/**
 * Match rules are enforced promises rather than decorative menu assumptions.
 * Within Awtsmoos.com, the Awtsmoos renews stocks, teams, items, and CPU force
 * as one honest snapshot already consumed by fighter, winner, and item systems.
 */
export const DEFAULT_MATCH_RULES = Object.freeze({
	stocks: 3,
	teams: false,
	items: true,
	cpuDifficulty: 2
});

/**
 * Creates a normalized snapshot containing only currently enforced rules.
 *
 * @param {object} [overrides] User-selected rule values.
 * @returns {object} Safe rules for one match.
 */
export function createMatchRules(overrides = {}) {
	return {
		stocks: bounded(overrides.stocks, 1, 9, DEFAULT_MATCH_RULES.stocks),
		teams: Boolean(overrides.teams),
		items: overrides.items !== false,
		cpuDifficulty: bounded(overrides.cpuDifficulty, 1, 5, DEFAULT_MATCH_RULES.cpuDifficulty)
	};
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.min(maximum, Math.max(minimum, number));
}
