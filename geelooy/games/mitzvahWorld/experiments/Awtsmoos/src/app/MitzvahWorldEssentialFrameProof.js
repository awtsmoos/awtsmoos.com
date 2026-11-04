// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialFrameProof.js
 * @description Resolves an essential watchdog deadline: first the active proofs, then the honest failure.
 * The Awtsmoos does not merely watch for light; Awtsmoos.com, at the exact deadline of a covenant,
 * asks for the guarded reality itself — the first-frame vessel must produce one genuine frame, and a
 * launch-gated fact must be covered by its launch's truthful testimony (a crossing in flight, or a
 * chooser still awaiting the player's word) — so whatever can honestly testify passes, while a vessel
 * that produces nothing still fails by name, and the whole first-play hard horizon seals the rest.
 */

import { ESSENTIAL_HARD_TIMEOUT_CODE, timeoutDetails } from './MitzvahWorldEssentialDeadlinePolicy.js';
import { attemptEssentialLaunchProof, attemptEssentialMenuProof } from './MitzvahWorldEssentialLaunchProof.js';
import { ESSENTIAL_MILESTONES } from './MitzvahWorldEssentialMilestoneCatalog.js';
import { firstTimedOutEssentialRecord, touchEssentialRecord } from './MitzvahWorldEssentialTiming.js';
import { essentialHardTimeoutReached } from './MitzvahWorldEssentialWatchdog.js';

/**
 * Settles one watchdog firing for the ledger: an overdue fact first receives its active proof
 * attempts (frame proof for the first-frame fact, launch/menu testimony for launch-gated facts);
 * failing those, the silence is named exactly as before, and the whole first-play hard horizon
 * still bounds every active sibling that no living chooser honestly covers.
 * @param {object} ledger Essential ledger whose watchdog fired.
 * @param {number} nowMilliseconds Current essential time.
 * @returns {object} The ledger's published snapshot after the settlement.
 */
export function resolveEssentialWatchdogTimeout(ledger, nowMilliseconds) {
	const overdue = firstTimedOutEssentialRecord(ledger.records, nowMilliseconds, record => ledger.progressFloorFor(record));
	if (overdue) {
		if (attemptEssentialFrameProof(ledger, overdue, nowMilliseconds)) return ledger.publish();
		if (attemptEssentialLaunchProof(ledger, overdue, nowMilliseconds)) return ledger.publish();
		if (attemptEssentialMenuProof(ledger, overdue, nowMilliseconds)) return ledger.publish();
		return ledger.fail(overdue.name, timeoutDetails(overdue, {}, overdue.timeoutFailureCode, nowMilliseconds));
	}
	if (essentialHardTimeoutReached(nowMilliseconds, ledger.startedAtMilliseconds)) {
		const exposed = firstExposedEssentialRecord(ledger, nowMilliseconds);
		if (exposed) return ledger.fail(exposed.name, timeoutDetails(exposed, {}, ESSENTIAL_HARD_TIMEOUT_CODE, nowMilliseconds));
		ledger.cancelWatchdog();
		return ledger.publish();
	}
	ledger.rearmWatchdog(nowMilliseconds);
	return ledger.publish();
}

/**
 * Finds the first still-active fact the hard horizon may honestly condemn: one no living
 * chooser covers. When every active fact is launch-gated and menu-covered — the chooser
 * idling past the horizon with first play never requested — there is nothing to condemn,
 * and the caller disarms instead of naming a failure that never began.
 * @param {object} ledger Essential ledger under hard-horizon judgement.
 * @param {number} nowMilliseconds Current essential time.
 * @returns {object|null} The first exposed active record, or null when all are covered.
 */
function firstExposedEssentialRecord(ledger, nowMilliseconds) {
	for (const record of ledger.records.values()) {
		if (record.status !== 'pending' || record.startedAtMilliseconds === null) continue;
		if (attemptEssentialMenuProof(ledger, record, nowMilliseconds, false)) continue;
		return record;
	}
	return null;
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
