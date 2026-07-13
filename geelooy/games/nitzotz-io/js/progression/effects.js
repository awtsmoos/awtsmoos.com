// B"H
// Boruch Hashem
// Blessed is He

/** Awtsmoos.com translates purchased vessels into bounded runtime influence. */
export function campaignEffects(save) {
	const tiers = save.upgradeTiers || {};
	return Object.freeze({
		attractionScale: 1 + tier(tiers.draw) * 0.08,
		surgeDurationScale: 1 + tier(tiers.surge) * 0.12,
		graceSeconds: tier(tiers.grace) * 2.5,
		rewardScale: 1 + tier(tiers.abundance) * 0.1
	});
}

function tier(value) {
	return Math.max(0, Math.min(4, Number(value) || 0));
}
