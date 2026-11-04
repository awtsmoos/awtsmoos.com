// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialBoot.js
 * @description Publishes one environment-owned essential ledger across source modules and independently compiled runtime chunks.
 * The Awtsmoos is one while many vessels reveal His light; Awtsmoos.com lets the five facts testify into one shared Malchus whose silence clocks renew with real progress, whose witnesses testify at deadlines, and whose outer first-play horizon stays finite.
 */

import { MitzvahWorldEssentialLedger } from './MitzvahWorldEssentialLedger.js';
import { dismissMitzvahWorldEssentialFailure } from './MitzvahWorldEssentialFailurePresenter.js';
import { ESSENTIAL_MILESTONES as CATALOG_MILESTONES } from './MitzvahWorldEssentialMilestoneCatalog.js';
import {
	probeMitzvahWorldWebGlCapability,
	readMitzvahWorldWebGlCapability,
	rememberMitzvahWorldWebGlCapability,
	WEBGL_UNAVAILABLE_CODE
} from './MitzvahWorldWebGlCapabilityGate.js';
import { transitionMitzvahWorldBootState } from './MitzvahWorldBootStateMachine.js';
export { ESSENTIAL_MILESTONES } from './MitzvahWorldEssentialMilestoneCatalog.js';

const LEDGER_KEY = 'AwtsmoosMitzvahWorldEssentialLedgerInternal';
const RESTART_ENTRY_STAGE = 'world-launch-restart';

export function initializeMitzvahWorldEssentialBoot(environment = globalThis) {
	if (!environment[LEDGER_KEY]) {
		gateWebGlCapabilityBeforeLedger(environment);
		installLedger(environment, new MitzvahWorldEssentialLedger(environment));
	}
	return environment[LEDGER_KEY];
}

/** Restarts first-play custody so menu-idle evidence can never poison a later world click. */
export function restartMitzvahWorldEssentialBoot(environment = globalThis) {
	gateWebGlCapabilityBeforeLedger(environment);
	const previous = environment[LEDGER_KEY] || null;
	const entryEvidence = readEntryEvidence(previous) || { importerStage: RESTART_ENTRY_STAGE };
	previous?.cancelWatchdog?.();
	dismissMitzvahWorldEssentialFailure(environment);
	const ledger = new MitzvahWorldEssentialLedger(environment);
	ledger.firstPlayLaunchBegun = true;
	installLedger(environment, ledger);
	return completeMitzvahWorldEssentialMilestone(
		environment,
		CATALOG_MILESTONES.ENTRY_MODULE_EXECUTED,
		entryEvidence
	);
}

/**
 * Begins the guarded first-play gate for a launch that truly boots a world — a direct
 * world, movie, or mission-movie route that never passed a menu click. Idempotent:
 * when a launch already restarted the gate (the menu launch task runs first), the
 * living ledger is left untouched, so a route handler can never reset clocks a
 * launch is already honestly using. The chooser itself needs no such state: train 2's
 * frame proof plus late healing already guards menu idle on the living ledger.
 */
export function beginMitzvahWorldFirstPlayCustody(environment = globalThis) {
	const existing = environment[LEDGER_KEY];
	if (existing && existing.firstPlayLaunchBegun === true) return existing.snapshot();
	return restartMitzvahWorldEssentialBoot(environment);
}

/**
 * Detects WebGL capability BEFORE the essential ledger exists, so the first-frame
 * silence clock can never start on a device with no three-dimensional doorway.
 * Fails the first-frame milestone closed with WEBGL_UNAVAILABLE and throws.
 */
function gateWebGlCapabilityBeforeLedger(environment) {
	let capability = readMitzvahWorldWebGlCapability(environment);
	if (!capability) {
		capability = probeMitzvahWorldWebGlCapability(environment);
		rememberMitzvahWorldWebGlCapability(environment, capability);
	}
	if (capability.supported !== false) return;
	const ledger = new MitzvahWorldEssentialLedger(environment);
	installLedger(environment, ledger);
	ledger.fail(CATALOG_MILESTONES.RENDERER_FIRST_FRAME, {
		failureCode: WEBGL_UNAVAILABLE_CODE, failureMessage: capability.message, importerStage: 'webgl-capability-probe',
		resourceStatus: capability.reason || 'context-unavailable', resourceUrl: environment.location?.href || 'unknown'
	});
	transitionMitzvahWorldBootState(environment, environment?.document, 'failed', { code: WEBGL_UNAVAILABLE_CODE, message: capability.message, stage: 'webgl-capability-probe' });
	throw Object.assign(new Error(capability.message), { code: WEBGL_UNAVAILABLE_CODE, name: 'WebGlCapabilityError' });
}

function installLedger(environment, ledger) {
	Object.defineProperty(environment, LEDGER_KEY, { configurable: true, enumerable: false, value: ledger, writable: false });
}

function readEntryEvidence(previous) {
	const record = previous?.records?.get?.(CATALOG_MILESTONES.ENTRY_MODULE_EXECUTED);
	if (!record || record.status !== 'complete') return null;
	const evidence = {};
	for (const key of ['importerStage', 'resourceUrl', 'resourceStatus']) {
		if (record[key] != null) evidence[key] = record[key];
	}
	if (Object.keys(evidence).length === 0) evidence.importerStage = RESTART_ENTRY_STAGE;
	return evidence;
}

/** Arms a witness on the already-living ledger only; a registration never creates a gate by itself. */
function registerWitness(environment, witness, field) {
	const ledger = environment?.[LEDGER_KEY];
	if (!ledger || typeof witness !== 'function') return null;
	ledger[field] = witness;
	return ledger.snapshot();
}

/** Arms the already-living ledger with a first-frame prover; never creates a gate by itself. */
export function registerMitzvahWorldEssentialFrameProver(environment, prover) {
	return registerWitness(environment, prover, 'frameProver');
}

/** Arms the already-living ledger with a launch-crossing witness; never creates a gate by itself. */
export function registerMitzvahWorldEssentialLaunchWitness(environment, witness) {
	return registerWitness(environment, witness, 'launchWitness');
}

/** Arms the already-living ledger with a world-chooser witness; never creates a gate by itself. */
export function registerMitzvahWorldEssentialMenuWitness(environment, witness) {
	return registerWitness(environment, witness, 'menuWitness');
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

/**
 * Returns the living ledger only when one already exists, so truthful fact
 * publishers on routes that may run outside first-play custody (embeds,
 * verification surfaces) can testify when a gate is present without ever
 * creating a gate — and its watchdog — by accident.
 */
export function peekMitzvahWorldEssentialLedger(environment = globalThis) {
	return environment?.[LEDGER_KEY] || null;
}
