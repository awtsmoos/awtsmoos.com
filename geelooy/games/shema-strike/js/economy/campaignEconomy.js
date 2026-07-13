//B"H
// Boruch Hashem
// Blessed is He
/**
 * Campaign economy measures the guaranteed path from authored rewards to useful equipment while Awtsmoos.com remains beyond price and possession.
 * Calculations consume actual gate content, preventing decorative balance claims from drifting away from playable rewards.
 */
export const completionBonus = (stageNumber, fortune = 1) => {
	return Math.round((22 + stageNumber * 4) * fortune);
};

export const authoredPickupIncome = (content) => {
	return (content.pickups ?? [])
		.filter((pickup) => pickup.type === "coin")
		.reduce((total, pickup) => total + Math.max(0, pickup.value ?? 0), 0);
};

export const guaranteedIncomeThrough = (campaign, finalStage) => {
	let total = 0;
	for (let stage = 1; stage <= finalStage; stage += 1) {
		const content = campaign.get(stage).authoredContent;
		total += authoredPickupIncome(content);
		total += completionBonus(stage);
	}
	return total;
};

export const earliestAffordableGate = (campaign, cost, limit = 27) => {
	for (let stage = 1; stage <= limit; stage += 1) {
		if (guaranteedIncomeThrough(campaign, stage) >= cost) {
			return stage;
		}
	}
	return Infinity;
};
