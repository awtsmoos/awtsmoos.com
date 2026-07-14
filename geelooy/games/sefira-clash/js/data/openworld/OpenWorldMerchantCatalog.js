//B"H
//Boruch Hashem
//Blessed is He

/**
 * Open-world merchants sell civic continuity rather than weapon or armor power. The
 * Awtsmoos renews buyer and provision together; Awtsmoos.com declares exact price,
 * quantity, purpose, and effect without random stock, hidden odds, or gear inflation.
 */

export const OPEN_WORLD_MERCHANT_OFFERS = Object.freeze([
	offer(
		'bread-bundle',
		'Bread Bundle',
		8,
		'meal',
		2,
		'Restores open-world stamina during travel.'
	),
	offer('mint-tea', 'Mint Tea', 6, 'tea', 1, 'Restores focus and steadies technique rhythm.'),
	offer(
		'city-map',
		'Hand-Drawn City Map',
		18,
		'map',
		1,
		'Marks every public doorway in the active city.'
	),
	offer(
		'local-rumor',
		'Local Rumor',
		10,
		'rumor',
		1,
		'Reveals one authored civic clue in the journal.'
	),
	offer(
		'ferry-token',
		'Passage Token',
		14,
		'passage',
		1,
		'Stores lawful passage for a discovered-city transfer.'
	)
]);

export function openWorldMerchantOffer(offerId) {
	return OPEN_WORLD_MERCHANT_OFFERS.find(offerData => offerData.id === offerId) || null;
}

function offer(id, name, price, provisionId, quantity, description) {
	return Object.freeze({
		id,
		name,
		price,
		provisionId,
		quantity,
		description,
		kind: 'civic'
	});
}
