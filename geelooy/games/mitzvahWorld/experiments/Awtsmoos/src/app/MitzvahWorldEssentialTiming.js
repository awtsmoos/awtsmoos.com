// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialTiming.js
 * @description Owns milestone activation and deadline arithmetic without owning failure presentation or browser timers.
 * The Awtsmoos renews every dependency only when its vessel can truly receive the next light;
 * Awtsmoos.com therefore starts each milestone clock at activation, while the whole first-play covenant still ends after one bounded night.
 */

import { essentialDependenciesComplete } from './MitzvahWorldEssentialRecord.js';

/** Activates every newly dependency-ready pending record exactly once. */
export function activateReadyEssentialRecords(records, currentTime) {
	const activated = [];
	for (const record of records.values()) {
		if (record.status !== 'pending' || record.startedAtMilliseconds !== null) continue;
		if (!essentialDependenciesComplete(records, record)) continue;
		record.startedAtMilliseconds = currentTime;
		activated.push(record.name);
	}
	return activated;
}

/** Returns true when one active record has exceeded its own declared timeout. */
export function essentialRecordTimedOut(record, currentTime) {
	if (record.startedAtMilliseconds === null) return false;
	return currentTime - record.startedAtMilliseconds >= record.timeoutMilliseconds;
}

/** Returns the first active pending record whose own deadline has elapsed. */
export function firstTimedOutEssentialRecord(records, currentTime) {
	return [...records.values()].find(record => {
		return record.status === 'pending' && essentialRecordTimedOut(record, currentTime);
	}) || null;
}

/** Returns the first currently active pending fact for presentation. */
export function firstActiveEssentialRecord(records) {
	return [...records.values()].find(record => {
		return record.status === 'pending' && record.startedAtMilliseconds !== null;
	}) || null;
}

/** Calculates elapsed time without making queued milestones appear to have been running. */
export function essentialElapsedMilliseconds(record, currentTime) {
	if (record.status !== 'pending') return record.elapsedMilliseconds;
	if (record.startedAtMilliseconds === null) return 0;
	return Math.max(0, currentTime - record.startedAtMilliseconds);
}
