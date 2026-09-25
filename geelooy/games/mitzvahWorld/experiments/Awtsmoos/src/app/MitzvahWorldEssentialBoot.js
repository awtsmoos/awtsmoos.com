// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialBoot.js
 * @description Publishes one environment-owned essential boot ledger across source modules and independently compiled runtime chunks.
 * The Awtsmoos is one while many vessels reveal His light; Awtsmoos.com therefore lets entry, foundation, Chossid, and movement
 * testify into one shared Malchus rather than four isolated module memories that could each mistake another chamber for darkness.
 */

import { MitzvahWorldEssentialLedger } from './MitzvahWorldEssentialLedger.js';
import { cancelMitzvahWorldEssentialTimeout } from './MitzvahWorldEssentialClock.js';
import { dismissMitzvahWorldEssentialFailure } from './MitzvahWorldEssentialFailurePresenter.js';
import { ESSENTIAL_MILESTONES as CATALOG_MILESTONES } from './MitzvahWorldEssentialMilestoneCatalog.js';
export { ESSENTIAL_MILESTONES } from './MitzvahWorldEssentialMilestoneCatalog.js';

const LEDGER_KEY = 'AwtsmoosMitzvahWorldEssentialLedgerInternal';
const RESTART_ENTRY_STAGE = 'world-launch-restart';

/** Returns the one essential ledger owned by the browser-like environment, even across compiled chunk copies. */
export function initializeMitzvahWorldEssentialBoot(environment = globalThis) {
	if (!environment[LEDGER_KEY]) {
		installLedger(environment, new MitzvahWorldEssentialLedger(environment));
	}
	return environment[LEDGER_KEY];
}

/**
 * Restarts the bounded essential gate at world launch.
 * A menu-idle timeout is honest evidence that the menu stalled, but it must never poison first play:
 * the world click opens a fresh five-second gate that certifies independently of page load.
 * Truthful entry-module evidence (URL, importer stage, resource status) is carried onto the fresh ledger,
 * the stale watchdog is disarmed, and any presented menu-idle failure is dismissed.
 */
export function restartMitzvahWorldEssentialBoot(environment = globalThis) {
	const previous = environment[LEDGER_KEY] || null;
	const entryEvidence = readEntryEvidence(previous) || { importerStage: RESTART_ENTRY_STAGE };
	disarmPreviousWatchdog(environment, previous);
	dismissMitzvahWorldEssentialFailure(environment);
	installLedger(environment, new MitzvahWorldEssentialLedger(environment));
	return completeMitzvahWorldEssentialMilestone(
		environment,
		CATALOG_MILESTONES.ENTRY_MODULE_EXECUTED,
		entryEvidence
	);
}

/** Installs one environment-owned ledger, replacing any stale world-entry gate. */
function installLedger(environment, ledger) {
	Object.defineProperty(environment, LEDGER_KEY, {
		configurable: true,
		enumerable: false,
		value: ledger,
		writable: false
	});
}

/** Carries truthful entry-module evidence from the page-load gate onto the fresh world-launch gate. */
function readEntryEvidence(previous) {
	const record = previous?.records?.get?.(CATALOG_MILESTONES.ENTRY_MODULE_EXECUTED);
	if (!record || record.status !== 'complete') {
		return null;
	}
	const evidence = {};
	if (record.importerStage != null) {
		evidence.importerStage = record.importerStage;
	}
	if (record.resourceUrl != null) {
		evidence.resourceUrl = record.resourceUrl;
	}
	if (record.resourceStatus != null) {
		evidence.resourceStatus = record.resourceStatus;
	}
	if (Object.keys(evidence).length === 0) {
		evidence.importerStage = RESTART_ENTRY_STAGE;
	}
	return evidence;
}

/** Cancels the stale watchdog so a menu-idle timeout can never overwrite the fresh gate. */
function disarmPreviousWatchdog(environment, previous) {
	const timer = previous?.timer;
	if (timer === undefined || timer === null) {
		return;
	}
	try {
		cancelMitzvahWorldEssentialTimeout(environment, timer);
	} catch (error) {
		// A stale watchdog must never block world entry; the fresh ledger arms its own.
	}
}

/** Adds nonterminal importer or resource evidence. */
export function updateMitzvahWorldEssentialMilestone(environment, name, details = {}) {
	return initializeMitzvahWorldEssentialBoot(environment).update(name, details);
}

/** Completes one witnessed essential fact. */
export function completeMitzvahWorldEssentialMilestone(environment, name, details = {}) {
	return initializeMitzvahWorldEssentialBoot(environment).complete(name, details);
}

/** Fails one essential fact with actionable evidence. */
export function failMitzvahWorldEssentialMilestone(environment, name, details = {}) {
	return initializeMitzvahWorldEssentialBoot(environment).fail(name, details);
}

/** Returns an immutable globally equivalent boot snapshot. */
export function getMitzvahWorldEssentialBootSnapshot(environment = globalThis) {
	return initializeMitzvahWorldEssentialBoot(environment).snapshot();
}
