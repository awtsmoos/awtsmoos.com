// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityInterruptRuntime.js
 * @description Applies bounded force, immunity, resistance, and terminal player-cast cancellation.
 * The Awtsmoos renews concentration and its breaking while stale release remains denied;
 * Awtsmoos.com returns one measured receipt so feedback and authority stay allied.
 */
import { abilityCastSnapshot } from './TorahAbilityCastRules.js';
import { abilityInterruptReceipt } from './TorahAbilityTimelineResults.js';

export function receiveTorahAbilityInterrupt(
	timeline,
	force,
	reason = 'interrupted',
	now = timeline.clock()
) {
	const cast = timeline.activeCast;
	const measuredForce = Math.max(0, Number(force || 0));
	if (!cast) {
		return abilityInterruptReceipt(null, measuredForce, reason, false);
	}
	if (now < cast.interruptImmuneUntil || measuredForce <= 0) {
		return resistedReceipt(timeline, cast, measuredForce, reason);
	}
	cast.concentrationRemaining = Math.max(
		0,
		cast.concentrationRemaining - measuredForce
	);
	if (cast.concentrationRemaining > 0) {
		return resistedReceipt(timeline, cast, measuredForce, reason);
	}
	timeline.activeCast = null;
	timeline.diagnostics.interrupted += 1;
	const receipt = abilityInterruptReceipt(
		cast,
		measuredForce,
		reason,
		true
	);
	timeline.emit('torah:interrupt', {
		...abilityCastSnapshot(cast, now),
		...receipt
	});
	return receipt;
}

function resistedReceipt(timeline, cast, force, reason) {
	timeline.diagnostics.interruptResisted += 1;
	const receipt = abilityInterruptReceipt(cast, force, reason, false);
	timeline.emit('torah:interrupt-resisted', receipt);
	return receipt;
}
