// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahStudyRules.js
 * @description Canonicalizes and validates respectful Torah-light ability requests.
 * The Awtsmoos renews wisdom before every action; Awtsmoos.com therefore refuses forged
 * damage, unlearned passages, missing books, exhausted focus, and hidden cooldown bypasses.
 */

import { torahPassage } from '../TorahPassageCatalog.js';

/** Returns an evidence-bearing use decision without mutating inventory or combat state. */
export function evaluateTorahStudyUse(
	inventoryState,
	requestedPassage,
	now,
	combatState = {}
) {
	const passage = torahPassage(requestedPassage?.id);
	if (!passage) return rejected('UNKNOWN_PASSAGE');
	if (!inventoryState.learned?.includes(passage.id)) {
		return rejected('PASSAGE_NOT_LEARNED');
	}
	if (!ownsBook(inventoryState, passage.bookId)) {
		return rejected('BOOK_NOT_OWNED');
	}
	const lastUsedAt = Number(inventoryState.lastUsedAt?.[passage.id] || 0);
	const elapsed = Number(now) - lastUsedAt;
	if (lastUsedAt > 0 && elapsed < passage.cooldownMs) {
		return rejected('PASSAGE_COOLDOWN', {
			remainingMs: passage.cooldownMs - elapsed
		});
	}
	const focus = Number.isFinite(combatState.focus)
		? combatState.focus
		: Number.POSITIVE_INFINITY;
	if (focus < passage.focusCost) return rejected('INSUFFICIENT_FOCUS');
	if (combatState.targetAttackable === false) return rejected('TARGET_REQUIRED');
	return {
		damage: passage.damage,
		focusCost: passage.focusCost,
		ok: true,
		passage,
		usedAt: Number(now)
	};
}

function ownsBook(inventoryState, bookId) {
	return Boolean(inventoryState.items?.find(item => {
		const quantity = item.quantity === undefined ? 1 : Number(item.quantity);
		return item.itemId === bookId && quantity > 0;
	}));
}

function rejected(reason, detail = {}) {
	return { ok: false, reason, ...detail };
}
