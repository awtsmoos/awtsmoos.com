// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialTiming.js
 * @description Owns activation and silence-deadline arithmetic for essential first-play facts.
 * The Awtsmoos renews every dependency only when its vessel can truly receive the next light;
 * Awtsmoos.com therefore measures each active fact from its latest witnessed progress, never from stale wall-clock memory.
 */

import { essentialDependenciesComplete } from './MitzvahWorldEssentialRecord.js';

export function activateReadyEssentialRecords(records, currentTime) {
	const activated = [];
	for (const record of records.values()) {
		if (record.status !== 'pending' || record.startedAtMilliseconds !== null) continue;
		if (!essentialDependenciesComplete(records, record)) continue;
		record.startedAtMilliseconds = currentTime;
		record.lastProgressAtMilliseconds = currentTime;
		activated.push(record.name);
	}
	return activated;
}

export function touchEssentialRecord(record, currentTime) {
	if (record.status !== 'pending' || record.startedAtMilliseconds === null) return false;
	record.lastProgressAtMilliseconds = currentTime;
	return true;
}

export function essentialRecordTimedOut(record, currentTime) {
	if (record.startedAtMilliseconds === null) return false;
	const latest = record.lastProgressAtMilliseconds ?? record.startedAtMilliseconds;
	return currentTime - latest >= record.timeoutMilliseconds;
}

export function firstTimedOutEssentialRecord(records, currentTime) {
	return [...records.values()].find(record => {
		return record.status === 'pending' && essentialRecordTimedOut(record, currentTime);
	}) || null;
}

export function firstActiveEssentialRecord(records) {
	return [...records.values()].find(record => {
		return record.status === 'pending' && record.startedAtMilliseconds !== null;
	}) || null;
}

export function essentialElapsedMilliseconds(record, currentTime) {
	if (record.status !== 'pending') return record.elapsedMilliseconds;
	if (record.startedAtMilliseconds === null) return 0;
	return Math.max(0, currentTime - record.startedAtMilliseconds);
}
