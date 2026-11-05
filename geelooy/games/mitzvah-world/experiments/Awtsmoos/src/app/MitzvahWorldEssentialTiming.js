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

/**
 * Returns the instant from which a fact's silence is honestly measured: its own latest
 * progress, or the boot-wide progress floor when the caller supplies one that is later.
 * Only the first-frame fact receives a floor (see the ledger); every other fact is
 * judged on its own progress alone, so renderer progress can never hide silent terrain.
 */
export function essentialEffectiveLastProgress(record, progressFloorMilliseconds = null) {
	const own = record.lastProgressAtMilliseconds ?? record.startedAtMilliseconds;
	if (progressFloorMilliseconds === null || progressFloorMilliseconds === undefined) return own;
	return own === null ? progressFloorMilliseconds : Math.max(own, progressFloorMilliseconds);
}

export function essentialRecordTimedOut(record, currentTime, progressFloorMilliseconds = null) {
	if (record.startedAtMilliseconds === null) return false;
	const latest = essentialEffectiveLastProgress(record, progressFloorMilliseconds);
	return currentTime - latest >= record.timeoutMilliseconds;
}

export function firstTimedOutEssentialRecord(records, currentTime, progressFloorForRecord = null) {
	return [...records.values()].find(record => {
		const floor = typeof progressFloorForRecord === 'function' ? progressFloorForRecord(record) : null;
		return record.status === 'pending' && essentialRecordTimedOut(record, currentTime, floor);
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
