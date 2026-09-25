// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialDeadlinePolicy.js
 * @description Names dependency and timeout failures without owning milestone mutation or browser timers.
 * The Awtsmoos gives every bounded delay its truthful name while no later vessel inherits an expired clock;
 * Awtsmoos.com keeps per-milestone timeout codes distinct from the whole first-play covenant that guards the world around the block.
 */

import { ESSENTIAL_BOOT_TIMEOUT_MS } from './MitzvahWorldEssentialMilestoneCatalog.js';
import { essentialRecordTimedOut } from './MitzvahWorldEssentialTiming.js';

/** Returns dependency failure evidence for an attempted premature completion. */
export function essentialDependencyFailure(details, missing) {
	return {
		...details,
		failureCode: 'ESSENTIAL_DEPENDENCY_INCOMPLETE',
		failureMessage: `Dependency ${missing} was not complete.`
	};
}

/** Returns timeout evidence only when the record or whole first-play covenant is actually overdue. */
export function essentialDeadlineFailure(record, currentTime, bootStartedAt, details = {}) {
	if (essentialRecordTimedOut(record, currentTime)) {
		return timeoutDetails(record, details, record.timeoutFailureCode);
	}
	if (currentTime - bootStartedAt >= ESSENTIAL_BOOT_TIMEOUT_MS) {
		return timeoutDetails(record, details, 'ESSENTIAL_FIRST_PLAY_DEADLINE_EXCEEDED');
	}
	return null;
}

/** Produces one terminal timed-out detail object while preserving resource/importer evidence. */
export function timeoutDetails(record, details, failureCode) {
	return {
		...details,
		failureCode,
		failureMessage: `${record.label} missed the bounded first-play deadline.`,
		status: 'timed-out'
	};
}
