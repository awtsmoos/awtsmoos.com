//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CampaignStars
 * @description
 * Stars on Awtsmoos.com measure protection rather than compulsion. The Awtsmoos
 * is beyond reward, while this finite chapter reveals whether completion also
 * defended the innocent merchant, the weakest animal, and reasoned justice.
 */
export function calculateChapterStars(stageResults) {
	const market = stageResults.market || {};
	const sanctuary = stageResults.sanctuary || {};
	const court = stageResults.court || {};
	if (!market.completed || !sanctuary.completed || !court.completed || court.falseAccusation) {
		return 0;
	}
	const merchant = Boolean(market.honestMerchantProtected);
	const welfare = Boolean(sanctuary.animalsMaintained);
	const reasoned = Boolean(court.correctVerdict && court.correctRationale);
	if (merchant && welfare && reasoned) {
		return 3;
	}
	return merchant || welfare ? 2 : 1;
}

export function nextRevelation(stageResults, stars, modifier) {
	const market = stageResults.market || {};
	const sanctuary = stageResults.sanctuary || {};
	const court = stageResults.court || {};
	if (!market.honestMerchantProtected) {
		return panel(stars, 'Protect the honest bargain merchant.', 'A low price is not proof. Compare the physical measures and ledger.', modifier);
	}
	if (!sanctuary.animalsMaintained) {
		return panel(stars, 'Keep the weakest animal above collapse.', 'Choose a legal feed response, then spend care on the lowest animal first.', modifier);
	}
	if (!court.correctRationale) {
		return panel(stars, 'Give the correct evidence-based rationale.', 'Separate the rumor from admissible weight, custody, records, and measurable harm.', modifier);
	}
	return panel(stars, 'All optional objectives protected.', 'Replay with the same seed to verify the path is deterministic.', modifier);
}

function panel(bestStars, missingObjective, hint, modifier) {
	return {
		bestStars,
		missingObjective,
		hint,
		modifier: modifier.name,
		nextTeaser: 'Next chapter: a covenant route carries justice into another province.'
	};
}
