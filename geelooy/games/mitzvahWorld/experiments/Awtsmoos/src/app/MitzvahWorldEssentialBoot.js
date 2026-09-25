// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialBoot.js
 * @description Publishes one environment-owned essential ledger across source modules and independently compiled runtime chunks.
 * The Awtsmoos is one while many vessels reveal His light; Awtsmoos.com lets entry, renderer, terrain, Chossid, and movement
 * testify into one shared Malchus whose silence clocks renew with real progress and whose outer first-play horizon stays finite.
 */

import { MitzvahWorldEssentialLedger } from './MitzvahWorldEssentialLedger.js';
import { dismissMitzvahWorldEssentialFailure } from './MitzvahWorldEssentialFailurePresenter.js';
import { ESSENTIAL_MILESTONES as CATALOG_MILESTONES } from './MitzvahWorldEssentialMilestoneCatalog.js';
export { ESSENTIAL_MILESTONES } from './MitzvahWorldEssentialMilestoneCatalog.js';

const LEDGER_KEY = 'AwtsmoosMitzvahWorldEssentialLedgerInternal';
const RESTART_ENTRY_STAGE = 'world-launch-restart';

export function initializeMitzvahWorldEssentialBoot(environment = globalThis) {
	if (!environment[LEDGER_KEY]) installLedger(environment, new MitzvahWorldEssentialLedger(environment));
	return environment[LEDGER_KEY];
}

/** Restarts first-play custody so menu-idle evidence can never poison a later world click. */
export function restartMitzvahWorldEssentialBoot(environment = globalThis) {
	const previous = environment[LEDGER_KEY] || null;
	const entryEvidence = readEntryEvidence(previous) || { importerStage: RESTART_ENTRY_STAGE };
	previous?.cancelWatchdog?.();
	dismissMitzvahWorldEssentialFailure(environment);
	installLedger(environment, new MitzvahWorldEssentialLedger(environment));
	return completeMitzvahWorldEssentialMilestone(
		environment,
		CATALOG_MILESTONES.ENTRY_MODULE_EXECUTED,
		entryEvidence
	);
}

function installLedger(environment, ledger) {
	Object.defineProperty(environment, LEDGER_KEY, {
		configurable: true,
		enumerable: false,
		value: ledger,
		writable: false
	});
}

function readEntryEvidence(previous) {
	const record = previous?.records?.get?.(CATALOG_MILESTONES.ENTRY_MODULE_EXECUTED);
	if (!record || record.status !== 'complete') return null;
	const evidence = {};
	if (record.importerStage != null) evidence.importerStage = record.importerStage;
	if (record.resourceUrl != null) evidence.resourceUrl = record.resourceUrl;
	if (record.resourceStatus != null) evidence.resourceStatus = record.resourceStatus;
	if (Object.keys(evidence).length === 0) evidence.importerStage = RESTART_ENTRY_STAGE;
	return evidence;
}

export function updateMitzvahWorldEssentialMilestone(environment, name, details = {}) {
	return initializeMitzvahWorldEssentialBoot(environment).update(name, details);
}

export function completeMitzvahWorldEssentialMilestone(environment, name, details = {}) {
	return initializeMitzvahWorldEssentialBoot(environment).complete(name, details);
}

export function failMitzvahWorldEssentialMilestone(environment, name, details = {}) {
	return initializeMitzvahWorldEssentialBoot(environment).fail(name, details);
}

export function getMitzvahWorldEssentialBootSnapshot(environment = globalThis) {
	return initializeMitzvahWorldEssentialBoot(environment).snapshot();
}
