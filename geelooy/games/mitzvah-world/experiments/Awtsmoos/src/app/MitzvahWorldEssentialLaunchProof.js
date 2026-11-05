// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialLaunchProof.js
 * @description Lets a launch-gated fact be judged by the launch's own testimony at its silence deadline.
 * The Awtsmoos does not condemn earth that was never asked to rise; Awtsmoos.com therefore asks, at the
 * exact deadline of terrain or the Chossid, what is true of the only crossing that can produce them:
 * a launch in flight inside its own progress law renews the fact with the crossing's witnessed stage,
 * a living chooser testifies that first play was never requested, and anything else — a settled launch,
 * an exhausted stall law, a vanished chooser, a throwing or counterfeit witness — leaves the honest
 * silence verdict standing under its original name. The whole first-play hard horizon seals every
 * in-flight testimony: no crossing, however lively, testifies past it.
 */

import { applyEssentialDetails } from './MitzvahWorldEssentialRecord.js';
import { touchEssentialRecord } from './MitzvahWorldEssentialTiming.js';
import { essentialHardTimeoutReached } from './MitzvahWorldEssentialWatchdog.js';

/**
 * Asks the registered launch witness whether a governed world crossing is still in flight.
 * The testimony is believed only while the crossing's latest truthful progress sits inside its
 * own stall budget and before the hard horizon; acceptance renews the fact from that evidence
 * exactly once for this deadline and records the proof in the fact's own diagnostics.
 * @param {object} ledger Essential ledger whose watchdog reached the deadline.
 * @param {object} record Overdue launch-gated milestone record under judgement.
 * @param {number} nowMilliseconds Current essential time.
 * @returns {boolean} True only when truthful in-flight testimony renewed the fact.
 */
export function attemptEssentialLaunchProof(ledger, record, nowMilliseconds) {
	if (!record.launchGated || typeof ledger.launchWitness !== 'function') return false;
	if (essentialHardTimeoutReached(nowMilliseconds, ledger.startedAtMilliseconds)) return false;
	const testimony = callWitness(ledger.launchWitness);
	if (!testimony || typeof testimony.importerStage !== 'string' || !testimony.importerStage) return false;
	const progressedAt = testimony.lastProgressAtMilliseconds;
	const stallBudget = testimony.stallBudgetMilliseconds;
	if (!Number.isFinite(progressedAt) || !Number.isFinite(stallBudget) || stallBudget <= 0) return false;
	if (progressedAt < (record.startedAtMilliseconds ?? 0) || progressedAt > nowMilliseconds) return false;
	if (nowMilliseconds - progressedAt > stallBudget) return false;
	acceptTestimony(ledger, record, nowMilliseconds, {
		importerStage: testimony.importerStage,
		resourceStatus: 'launch-in-flight'
	}, 'launchProofCount');
	return true;
}

/**
 * Asks the registered menu witness whether the world chooser is still the live surface.
 * Its testimony — first play not yet requested — is the one state in which a launch-gated
 * fact's silence is not evidence against it, so acceptance renews the fact with the chooser's
 * stage. With renew false the testimony is only read, never consumed: the hard-horizon
 * judgement asks whether every still-active fact is covered before it disarms in peace.
 * @param {object} ledger Essential ledger whose watchdog is judging.
 * @param {object} record Launch-gated milestone record under judgement.
 * @param {number} nowMilliseconds Current essential time.
 * @param {boolean} [renew] Whether acceptance may renew the fact's silence clock.
 * @returns {boolean} True only when a living chooser truthfully covers the fact.
 */
export function attemptEssentialMenuProof(ledger, record, nowMilliseconds, renew = true) {
	if (!record.launchGated || typeof ledger.menuWitness !== 'function') return false;
	const testimony = callWitness(ledger.menuWitness);
	if (!testimony || typeof testimony.importerStage !== 'string' || !testimony.importerStage) return false;
	if (!renew) return true;
	acceptTestimony(ledger, record, nowMilliseconds, {
		importerStage: testimony.importerStage,
		resourceStatus: testimony.resourceStatus || 'chooser-live'
	}, 'menuProofCount');
	return true;
}

/** Invokes a witness defensively: a throwing or empty testimony is no testimony. */
function callWitness(witness) {
	try {
		const testimony = witness();
		return testimony && typeof testimony === 'object' ? testimony : null;
	} catch {
		return null;
	}
}

/** Renews one fact from accepted testimony and rearms the watchdog for its siblings. */
function acceptTestimony(ledger, record, nowMilliseconds, details, counterField) {
	applyEssentialDetails(record, details);
	touchEssentialRecord(record, nowMilliseconds);
	record[counterField] = (record[counterField] || 0) + 1;
	ledger.rearmWatchdog(nowMilliseconds);
}
