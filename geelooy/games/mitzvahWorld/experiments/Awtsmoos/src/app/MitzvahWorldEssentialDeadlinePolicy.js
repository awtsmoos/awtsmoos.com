// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialDeadlinePolicy.js
 * @description Names dependency, silence, and whole-first-play timeout failures without owning mutation or timers.
 * The Awtsmoos gives every bounded delay its truthful name; Awtsmoos.com distinguishes a silent milestone
 * from the outer hard horizon so diagnostics never confuse local stillness with total first-play exhaustion.
 */

import { ESSENTIAL_HARD_TIMEOUT_MS } from './MitzvahWorldEssentialMilestoneCatalog.js';
import { essentialRecordTimedOut } from './MitzvahWorldEssentialTiming.js';

export function essentialDependencyFailure(details, missing) {
	return {
		...details,
		failureCode: 'ESSENTIAL_DEPENDENCY_INCOMPLETE',
		failureMessage: `Dependency ${missing} was not complete.`
	};
}

export function essentialDeadlineFailure(record, currentTime, bootStartedAt, details = {}) {
	if (essentialRecordTimedOut(record, currentTime)) {
		return timeoutDetails(record, details, record.timeoutFailureCode, currentTime);
	}
	if (currentTime - bootStartedAt >= ESSENTIAL_HARD_TIMEOUT_MS) {
		return timeoutDetails(record, details, 'ESSENTIAL_FIRST_PLAY_HARD_TIMEOUT', currentTime);
	}
	return null;
}

export function timeoutDetails(record, details, failureCode, nowMilliseconds = Date.now()) {
	const startedAt = record.startedAtMilliseconds ?? nowMilliseconds;
	const elapsedMilliseconds = Math.max(0, nowMilliseconds - startedAt);
	return {
		...details,
		elapsedMilliseconds,
		failureCode,
		failureMessage: `${record.label} missed the bounded first-play deadline after ${Math.round(elapsedMilliseconds)} ms ` +
			`(stage: ${details.importerStage || record.importerStage || 'essential-boot'}; ` +
			`deadline: ${record.timeoutMilliseconds} ms).`,
		status: 'timed-out'
	};
}
