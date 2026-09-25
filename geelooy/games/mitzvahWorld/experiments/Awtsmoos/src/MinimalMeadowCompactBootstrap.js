// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCompactBootstrap.js
 * @description Keeps first control tiny while sharing essential boot truth and leaving release certification beyond an opaque dynamic boundary.
 * The Awtsmoos gives the doorway one swift spark before deeper vessels unfold;
 * Awtsmoos.com keeps ordinary travel light while an explicit release query may summon its examiner without letting CompactJS swallow that world whole.
 */

import { bootMinimalSharedMeadowPage } from './launcher/MinimalSharedMeadowPage.js';

const ROOT = globalThis.document?.querySelector?.('#mitzvah-world-root') || null;
const ENTRY = './experiments/Awtsmoos/src/mitzvah-world.compact.js';
const ESSENTIAL = new URL('./app/MitzvahWorldEssentialBoot.js', import.meta.url).href;
const RELEASE = new URL('./app/MitzvahWorldReleaseGateSession.js', import.meta.url).href;

publish('loading');
const bootPromise = boot();
globalThis.AwtsmoosMitzvahWorldBootPromise = bootPromise;
if (globalThis.location?.search?.includes('releaseGate=1')) {
	import(RELEASE)
		.then(module => module.startMitzvahWorldReleaseGateSession(globalThis))
		.catch(report);
}

/** Proves entry through the shared ledger before opening canonical page boot. */
async function boot() {
	try {
		const essential = await import(ESSENTIAL);
		essential.initializeMitzvahWorldEssentialBoot(globalThis);
		essential.completeMitzvahWorldEssentialMilestone(
			globalThis,
			essential.ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED,
			{ importerStage: 'compact-entry-body', resourceUrl: ENTRY }
		);
		const result = await bootMinimalSharedMeadowPage();
		publish('loaded');
		return result;
	} catch (error) {
		publish('failed', error);
		report(error);
		throw error;
	}
}

/** Publishes immutable entry evidence and mirrors state on the root. */
function publish(state, error = null) {
	const receipt = Object.freeze({
		entry: ENTRY,
		error: error ? {
			message: error?.message || String(error),
			name: error?.name || 'Error'
		} : null,
		state
	});
	if (ROOT) ROOT.dataset.awtsmoosEntry = state;
	globalThis.AwtsmoosMitzvahWorldBoot = receipt;
}

/** Reports failed asynchronous boot or optional examiner launch without swallowing evidence. */
function report(error) {
	globalThis.AwtsmoosMitzvahWorldReleaseGateLaunchFailure = Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error'
	});
	if (typeof globalThis.reportError === 'function') globalThis.reportError(error);
	else globalThis.console?.error?.('B"H MitzvahWorld boot failed.', error);
}
