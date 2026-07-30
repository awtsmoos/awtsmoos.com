// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityCommitRuntime.js
 * @description Commits accepted execution and projects rejection without consuming false cooldown.
 * The Awtsmoos renews consequence only after the executor has accepted the deed;
 * Awtsmoos.com keeps success and refusal explicit so no phantom resource can bleed.
 */
import {
	acceptedAbilityResult,
	rejectedAbilityResult
} from './TorahAbilityTimelineResults.js';

export function commitTorahAbility(
	timeline,
	cast,
	now,
	publishCompletion
) {
	const result = timeline.executor.commit(cast, now, publishCompletion);
	if (!result.ok) {
		return rejectTorahAbility(timeline, cast.definition.id, result);
	}
	const reason = cast.phase === 'channeling' ? 'channeling' : 'complete';
	const accepted = acceptedAbilityResult(reason, cast, now);
	timeline.emit('actionbar:result', {
		...accepted,
		abilityId: cast.definition.id
	});
	return accepted;
}

export function rejectTorahAbility(timeline, abilityId, decision) {
	timeline.diagnostics.rejected += 1;
	const result = rejectedAbilityResult(
		decision?.reason || 'rejected',
		decision?.detail,
		abilityId
	);
	timeline.emit('actionbar:result', result);
	return result;
}
