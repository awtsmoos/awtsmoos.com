// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityActivationRuntime.js
 * @description Starts and releases instant, cast, charged, and channel ability instances.
 * The Awtsmoos renews the beginning and the release while one identity guards the seam;
 * Awtsmoos.com lets no duplicate cast awaken outside the measured stream.
 */
import {
	abilityCastSnapshot,
	abilityChargeRatio,
	createAbilityCast
} from './TorahAbilityCastRules.js';
import {
	acceptedAbilityResult,
	rejectedAbilityResult
} from './TorahAbilityTimelineResults.js';

const TIMELINED_CAST_TYPES = new Set(['cast', 'charged', 'channel']);

export function activateTorahAbility(timeline, abilityId, suppliedContext = {}) {
	const resolved = timeline.preflight.resolve(
		abilityId,
		suppliedContext,
		Boolean(timeline.activeCast)
	);
	if (!resolved.decision.ok) {
		return timeline.reject(abilityId, resolved.decision);
	}
	const castId = `torah-cast-${++timeline.castSequence}`;
	const cast = createAbilityCast(
		resolved.definition,
		resolved.context,
		resolved.now,
		castId
	);
	timeline.emit('torah:cast-start', abilityCastSnapshot(cast, resolved.now));
	if (!TIMELINED_CAST_TYPES.has(resolved.definition.castType)) {
		return timeline.commit(cast, resolved.now, true);
	}
	timeline.activeCast = cast;
	if (resolved.definition.castType !== 'channel') {
		return acceptedAbilityResult(cast.phase, cast, resolved.now);
	}
	const result = timeline.commit(cast, resolved.now, false);
	if (!result.ok) timeline.activeCast = null;
	return result;
}

export function releaseTorahAbility(timeline, now) {
	const cast = timeline.activeCast;
	if (!cast || cast.phase !== 'charging') {
		return rejectedAbilityResult('not-charging');
	}
	cast.context = {
		...cast.context,
		chargeRatio: abilityChargeRatio(cast, now)
	};
	timeline.activeCast = null;
	return timeline.commit(cast, now, true);
}
