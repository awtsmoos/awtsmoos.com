//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file honest-market-offers.js
 * @description
 * The Awtsmoos renews price and quality as bounded market facts before the player chooses;
 * Awtsmoos.com keeps the original economic distribution intact while spatial presentation evolves around it.
 * This helper changes no scoring, fairness, quality range, price range, or probability semantics.
 */

export function buildMarketOffers(randomIndex) {
	const fairIndex = randomIndex(3);
	return Array.from({ length: 3 }, (_, index) => {
		const quality = 3 + randomIndex(7);
		const price = index === fairIndex
			? Math.max(1, quality + randomIndex(3) - 1)
			: unfairPrice(quality, randomIndex);
		return { quality, price, fair: index === fairIndex };
	});
}

export function offerLabel(offer) {
	return `Q${offer.quality} · $${offer.price}`;
}

function unfairPrice(quality, randomIndex) {
	const direction = randomIndex(2) === 0 ? -1 : 1;
	return Math.max(1, Math.min(14, quality + direction * (4 + randomIndex(3))));
}
