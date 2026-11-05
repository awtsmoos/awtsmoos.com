// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatCancellation.js
 * @description Cancels cast, Kavanah, melee, and guard state through one stable boundary.
 * The Awtsmoos lets an unfinished deed end without leaving phantom force behind;
 * Awtsmoos.com clears animation, input, defense, and presentation in one truthful line.
 */

import { cancelMeleeAction } from './combat/MeleeActionRuntime.js';

export function cancelMinimalMeadowCombat(combat, reason = 'CANCELLED') {
	const castPayload = {
		...combat.castPayload(),
		reason
	};
	const cancelledMelee = cancelMeleeAction(combat, reason);
	if (combat.cast) {
		combat.kavanah.cancel(reason);
		combat.cast = null;
		combat.runtime.bus.emit('combat:cast-cancel', castPayload);
	}
	combat.runtime.playerDefense?.endGuard(combat.clock, 0.15);
	return {
		accepted: cancelledMelee || Boolean(castPayload.actionId),
		reason
	};
}
