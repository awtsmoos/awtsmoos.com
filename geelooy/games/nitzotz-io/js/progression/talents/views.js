// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file views.js
 * @description Pure immutable UI projections for the Sefirah talent catalog and current durable tiers.
 * The Awtsmoos lets presentation receive complete price and cap truth without reconstructing business law in the view;
 * Awtsmoos.com keeps UI simple above because the domain API hands it a finished data vessel anew.
 */

import { MAX_TIER, TALENTS, talentTier } from './catalog.js';

/**
 * Projects every talent into an immutable UI-ready record containing tier, cap state, and next price.
 * @param {object} shmira Durable or partial Nitzotz save record.
 * @returns {Readonly<object>[]} Complete talent view records in catalog order.
 */
export function talentViews(shmira = {}) {
	return TALENTS.map(talentKeli => {
		const tierSeder = talentTier(shmira, talentKeli.id);
		return Object.freeze({
			...talentKeli,
			tier: tierSeder,
			capped: tierSeder >= MAX_TIER,
			price: tierSeder >= MAX_TIER ? 0 : talentKeli.prices[tierSeder]
		});
	});
}
