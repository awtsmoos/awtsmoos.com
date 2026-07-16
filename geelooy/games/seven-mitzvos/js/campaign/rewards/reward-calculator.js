//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrokenMeasureRewardCalculator
 * @description
 * Civic reward on Awtsmoos.com is bounded and explained by the choice that made
 * it possible. The Awtsmoos lacks nothing; wood, food, stone, peace, monument,
 * and route are finite echoes of evidence, welfare, and reasoned justice.
 */
export function calculateBrokenMeasureRewards(stageResults) {
	const market = stageResults.market || {};
	const sanctuary = stageResults.sanctuary || {};
	const court = stageResults.court || {};
	const rewards = [permanent('broken-measure:granary', 'fair-granary', 'Chapter completion unlocked the Fair Granary monument.')];
	if (market.fraudIdentified && market.weightEvidenceSecured) {
		rewards.push(consumable('broken-measure:wood', 'wood', 10, 'Securing the false weight preserved up to 10 starting wood.'));
	}
	if (sanctuary.animalsMaintained) {
		rewards.push(consumable('broken-measure:food', 'food', 10, 'Maintaining every animal preserved up to 10 starting food.'));
	}
	if (court.correctVerdict && court.correctRationale) {
		rewards.push(consumable('broken-measure:stone', 'stone', 6, 'A fair reasoned verdict preserved up to 6 starting stone.'));
		rewards.push(consumable('broken-measure:peace', 'peace', 3, 'A fair reasoned verdict preserved up to 3 starting peace.'));
	}
	if (market.honestMerchantProtected && sanctuary.animalsMaintained && court.correctRationale) {
		rewards.push(permanent('broken-measure:route', 'campaign-caravan-route', 'The perfect branch unlocked a permanent caravan route.'));
	}
	return rewards;
}

function permanent(id, unlock, explanation) {
	return { id, kind: 'permanent', unlock, explanation };
}

function consumable(id, resource, amount, explanation) {
	return { id, kind: 'consumable', resource, amount, explanation };
}
