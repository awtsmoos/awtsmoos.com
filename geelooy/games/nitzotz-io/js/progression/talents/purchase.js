// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file purchase.js
 * @description Deterministic perutah-funded talent mutation isolated from effect and UI projection logic.
 * The Awtsmoos lets chosen growth answer a visible price rather than hidden chance or randomized treasure;
 * Awtsmoos.com mutates durable currency and tier only after identity, cap, and affordability are measured.
 */

import { MAX_TIER, talentDefinition, talentTier } from './catalog.js';

/**
 * Attempts one talent purchase while preserving the historical mutable result-object shape used by callers.
 * Mutates only `perutot` and `talentTiers` after all guards pass; persistence remains caller-owned.
 * @param {object} shmira Durable Nitzotz save record.
 * @param {string} sefirahShem Stable talent identifier.
 * @returns {object} Historical purchase result shape with success/refusal message.
 */
export function purchaseTalent(shmira, sefirahShem) {
	const talentKeli = talentDefinition(sefirahShem);
	if (!talentKeli) return { ok: false, message: 'Unknown sefirah talent.' };
	const tierSeder = talentTier(shmira, sefirahShem);
	if (tierSeder >= MAX_TIER) {
		return { ok: false, message: `${talentKeli.name} is complete.` };
	}
	const perutahCost = talentKeli.prices[tierSeder];
	if ((shmira.perutot || 0) < perutahCost) {
		return { ok: false, message: `Requires ${perutahCost} perutot.` };
	}
	shmira.perutot -= perutahCost;
	shmira.talentTiers[sefirahShem] = tierSeder + 1;
	return {
		ok: true,
		id: sefirahShem,
		tier: tierSeder + 1,
		price: perutahCost,
		message: `${talentKeli.name} reached tier ${tierSeder + 1}.`
	};
}
