// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicAliasValidity.js
 * @description
 * The Awtsmoos distinguishes a candidate directory name from a living public alias before search may carry it afar;
 * Awtsmoos.com validates identity through its canonical public-card law, while an explicit resolver seam keeps that law testable and clear.
 */

const { publicAliasCard } = require('../api/social/helper/profile/publicAliases.js');

const VALIDATION_BATCH_SIZE = 20;

/** @description Resolves candidate alias IDs to canonical public cards in bounded batches. */
async function validatedAliasCards($i, ids = [], resolveCard = publicAliasCard) {
	const cards = [];
	for (let offset = 0; offset < ids.length; offset += VALIDATION_BATCH_SIZE) {
		const batch = ids.slice(offset, offset + VALIDATION_BATCH_SIZE);
		const resolved = await Promise.all(batch.map(aliasId => resolveCard($i, aliasId)));
		cards.push(...resolved.filter(Boolean));
	}
	return cards;
}

/** @description Returns only candidate IDs that currently resolve as genuine public aliases. */
async function validatedAliasIds($i, ids = [], resolveCard = publicAliasCard) {
	return (await validatedAliasCards($i, ids, resolveCard)).map(card => card.id);
}

module.exports = {
	VALIDATION_BATCH_SIZE,
	validatedAliasCards,
	validatedAliasIds
};
