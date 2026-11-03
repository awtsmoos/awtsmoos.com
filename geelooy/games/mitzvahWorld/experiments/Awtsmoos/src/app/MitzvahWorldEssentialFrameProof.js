// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialFrameProof.js
 * @description Resolves an essential watchdog deadline: first the active frame proof, then the honest failure.
 * The Awtsmoos does not merely watch for light; Awtsmoos.com, at the exact deadline of the first-frame
 * covenant, asks the registered vessel to produce one genuine frame on demand — so a renderer that can
 * render passes in any visibility state, while a vessel that produces nothing still fails by name.
 */

import { ESSENTIAL_HARD_TIMEOUT_CODE, timeoutDetails } from './MitzvahWorldEssentialDeadlinePolicy.js';
import { ESSENTIAL_MILESTONES } from './MitzvahWorldEssentialMilestoneCatalog.js';
import { firstActiveEssentialRecord, firstTimedOutEssentialRecord, touchEssentialRecord } from './MitzvahWorldEssentialTiming.js';
import { essentialHardTimeoutReached } from './MitzvahWorldEssentialWatchdog.js';

/**
 * Settles one watchdog firing for the ledger: an overdue fact first receives its one active
 * proof attempt when it is the first-frame fact; failing that, the silence is named exactly
 * as before, and the whole first-play hard horizon still bounds every active sibling.
 * @param {object} ledger Essential ledger whose watchdog fired.
 * @param {number} nowMilliseconds Current essential time.
 * @returns {object} The ledger's published snapshot after the settlement.
 */
export function resolveEssentialWatchdogTimeout(ledger, nowMilliseconds) {
	const overdue = firstTimedOutEssentialRecord(ledger.records, nowMilliseconds);
	if (overdue) {
		if (attemptEssentialFrameProof(ledger, overdue, nowMilliseconds)) return ledger.publish();
		return ledger.fail(overdue.name, timeoutDetails(overdue, {}, overdue.timeoutFailureCode, nowMilliseconds));
	}
	if (essentialHardTimeoutReached(nowMilliseconds, ledger.startedAtMilliseconds)) {
		const record = firstActiveEssentialRecord(ledger.records);
		if (record) return ledger.fail(record.name, timeoutDetails(record, {}, ESSENTIAL_HARD_TIMEOUT_CODE, nowMilliseconds));
	}
	ledger.rearmWatchdog(nowMilliseconds);
	return ledger.publish();
}

/**
 * Makes the single permitted active attempt when the first-frame fact reaches its deadline.
 * The prover is invoked synchronously and at most once per ledger; it must return truthful
 * completion evidence (the milestone details of a frame it truly produced) or nothing.
 * A throwing, empty, or counterfeit attempt leaves the honest timeout failure untouched.
 * @param {object} ledger Essential ledger whose watchdog reached the deadline.
 * @param {object} record Overdue milestone record under judgement.
 * @param {number} nowMilliseconds Current essential time.
 * @returns {boolean} True only when the proof genuinely completed the first-frame fact.
 */
export function attemptEssentialFrameProof(ledger, record, nowMilliseconds) {
	if (record.name !== ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME) return false;
	if (typeof ledger.frameProver !== 'function' || ledger.frameProofAttempted) return false;
	ledger.frameProofAttempted = true;
	let receipt = null;
	try {
		receipt = ledger.frameProver();
	} catch {
		receipt = null;
	}
	if (!receipt || typeof receipt !== 'object') return false;
	touchEssentialRecord(record, nowMilliseconds);
	ledger.complete(record.name, receipt);
	return record.status === 'complete';
}
