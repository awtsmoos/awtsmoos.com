// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialSnapshot.js
 * @description Freezes essential boot truth while preserving the difference between queued time and active measured time.
 * The Awtsmoos renews each hidden dependency before its clock may honestly begin;
 * Awtsmoos.com shows queued facts at zero, active facts aging, and terminal facts sealed where their evidence has been.
 */

import {
	essentialElapsedMilliseconds,
	firstActiveEssentialRecord
} from './MitzvahWorldEssentialTiming.js';

/** Builds one immutable public receipt from the internal milestone map. */
export function createMitzvahWorldEssentialSnapshot(records, startedAtMilliseconds, environment) {
	const currentTime = now(environment);
	const milestones = freezeMilestones(records, currentTime);
	const active = firstActiveEssentialRecord(records);
	return Object.freeze({
		activeMilestone: active ? milestones[active.name] : null,
		certified: Object.values(milestones).every(record => record.status === 'complete'),
		milestones,
		startedAtMilliseconds,
		stalledMilestone: findStalledMilestone(milestones)
	});
}

/** Copies records into a frozen public map with truthful live elapsed evidence. */
function freezeMilestones(records, currentTime) {
	return Object.freeze(Object.fromEntries(
		[...records].map(([name, record]) => [
			name,
			Object.freeze({
				...record,
				elapsedMilliseconds: essentialElapsedMilliseconds(record, currentTime)
			})
		])
	));
}

/** Reserves stalled milestone for a witnessed failure or deadline timeout. */
function findStalledMilestone(milestones) {
	return Object.values(milestones).find(record => {
		return record.status === 'failed' || record.status === 'timed-out';
	}) || null;
}

/** Uses the browser monotonic clock when available. */
function now(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}
