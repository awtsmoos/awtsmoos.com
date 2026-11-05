// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityChannelRuntime.js
 * @description Advances bounded channel ticks and completion without phantom work after cancel.
 * The Awtsmoos renews each measured pulse while a severed channel cannot return;
 * Awtsmoos.com counts every lawful tick and lets completion only follow what did not burn.
 */
import { channelTickPlan } from './TorahAbilityCastRules.js';

export function advanceTorahAbilityChannel(timeline, cast, now) {
	const plan = channelTickPlan(cast, now);
	for (let index = 0; index < (plan?.count || 0); index += 1) {
		timeline.executor.channelTick(
			cast,
			now,
			plan.firstTickIndex + index
		);
		timeline.diagnostics.channelTicks += 1;
	}
	if (now < cast.completesAt) return true;
	if (timeline.activeCast?.castId !== cast.castId) return false;
	timeline.activeCast = null;
	timeline.executor.completeChannel(cast, now);
	return false;
}
