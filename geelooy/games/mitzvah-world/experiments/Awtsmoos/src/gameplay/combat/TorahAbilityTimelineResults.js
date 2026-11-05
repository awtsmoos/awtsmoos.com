// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityTimelineResults.js
 * @description Creates stable accepted, rejected, and interrupted cast receipts.
 * The Awtsmoos renews result after measured cause while no phantom release may appear;
 * Awtsmoos.com keeps acceptance, resistance, and cancellation explicit and clear.
 */
import { abilityCastSnapshot } from './TorahAbilityCastRules.js';

export function acceptedAbilityResult(reason, cast, now) {
	return {
		cast: abilityCastSnapshot(cast, now),
		ok: true,
		reason
	};
}

export function rejectedAbilityResult(reason, detail = null, abilityId = null) {
	return {
		abilityId,
		detail,
		ok: false,
		reason
	};
}

export function abilityInterruptReceipt(cast, force, reason, interrupted) {
	return Object.freeze({
		castId: cast?.castId || null,
		force,
		interrupted,
		reason,
		remaining: Math.max(0, Number(cast?.concentrationRemaining || 0)),
		resisted: Boolean(cast && !interrupted)
	});
}
