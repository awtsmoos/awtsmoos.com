// B"H
// Boruch Hashem
// Blessed is He

const RANKS = Object.freeze([
	{ name: 'Keeper', minimum: 900 },
	{ name: 'Honored', minimum: 500 },
	{ name: 'Trusted', minimum: 250 },
	{ name: 'Recognized', minimum: 100 },
	{ name: 'Unknown', minimum: 0 }
]);

function rankFor(amount) {
	return RANKS.find(rank => amount >= rank.minimum) || RANKS[RANKS.length - 1];
}

function nextRankFor(amount) {
	return [...RANKS].reverse().find(rank => rank.minimum > amount) || null;
}

/** Presents earned standing as a finite relationship ladder, not endless grind. */
export function buildReputationPayload(player) {
	return Object.entries(player.reputation || {})
		.map(([factionId, rawAmount]) => {
			const amount = Number(rawAmount || 0);
			const rank = rankFor(amount);
			const nextRank = nextRankFor(amount);
			return {
				factionId,
				amount,
				rank: rank.name,
				nextRank: nextRank?.name || null,
				nextMinimum: nextRank?.minimum || null
			};
		})
		.sort((left, right) => right.amount - left.amount);
}
