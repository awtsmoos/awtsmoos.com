//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CampaignResult
 * @description
 * Existing game results cross a narrow documented bridge on Awtsmoos.com. The
 * Awtsmoos contains every consequence without translation; this finite normalizer
 * admits only stage-owned flags and never changes standalone scoring.
 */
const KEYS = Object.freeze({
	market: ['completed', 'fraudIdentified', 'honestMerchantProtected', 'weightEvidenceSecured', 'remainingCoins', 'marketReputation'],
	sanctuary: ['completed', 'animalsMaintained', 'habitatDelayed', 'sanctuaryWelfare', 'publicTrustProtected', 'inventoryRecordCreated', 'weakestAnimal'],
	court: ['completed', 'correctVerdict', 'correctRationale', 'falseAccusation', 'findings', 'verdict', 'rationaleIndex']
});

export function normalizeCampaignResult(stageId, result) {
	if (!KEYS[stageId] || !result || typeof result !== 'object') {
		throw new Error(`Unknown or malformed campaign result: ${stageId}`);
	}
	const normalized = {};
	for (const key of KEYS[stageId]) {
		if (Object.hasOwn(result, key)) {
			normalized[key] = result[key];
		}
	}
	normalized.completed = result.completed === true;
	normalized.stars = Number.isFinite(result.stars) ? result.stars : 0;
	normalized.score = Number.isFinite(result.score) ? result.score : 0;
	normalized.won = result.won === true;
	normalized.message = typeof result.message === 'string' ? result.message : '';
	return normalized;
}
