// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCompactBootstrap.js
 * @description Keeps first control tiny while sharing essential boot truth and leaving release certification beyond an opaque dynamic boundary.
 * The Awtsmoos gives the doorway one swift spark before deeper vessels unfold.
 * Chapter 4: one preflight rejects a mixed release before the renderer starts and records the seven boot milestones.
 */

import { bootMinimalSharedMeadowPage } from './launcher/MinimalSharedMeadowPage.js';

// B"H: shared WebGL help gate (Yaakov 2026-10-13). When WebGL is unavailable the overlay explains + offers Try Again; halt boot here (module top-level return is illegal, so throw the equivalent halt).
if (globalThis.AwtsmoosWebGL && !globalThis.AwtsmoosWebGL.ensure({ gameName: 'Mitzvah World' })) {
	throw new Error('[Mitzvah World] WebGL unavailable — help overlay shown');
}

const ROOT = globalThis.document?.querySelector?.('#mitzvah-world-root') || null;
const ENTRY = './experiments/Awtsmoos/src/mitzvah-world.compact.js';
const ESSENTIAL = new URL('./app/MitzvahWorldEssentialBoot.js', import.meta.url).href;
const RELEASE = new URL('./app/MitzvahWorldReleaseGateSession.js', import.meta.url).href;
const PREFLIGHT = new URL('./app/MitzvahWorldBootPreflight.js', import.meta.url).href;

publish('loading');
const bootPromise = boot();
globalThis.AwtsmoosMitzvahWorldBootPromise = bootPromise;
if (globalThis.location?.search?.includes('releaseGate=1')) {
	import(RELEASE)
		.then(module => module.startMitzvahWorldReleaseGateSession(globalThis))
		.catch(report);
}

/** Proves the release seal, then entry, before opening canonical page boot. A mixed release fails closed here. */
async function boot() {
	try {
		const preflight = await import(PREFLIGHT);
		const session = preflight.beginMitzvahWorldBoot(globalThis);
		const essential = await import(ESSENTIAL);
		session.recordEntryImport();
		essential.initializeMitzvahWorldEssentialBoot(globalThis);
		essential.completeMitzvahWorldEssentialMilestone(
			globalThis,
			essential.ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED,
			{ importerStage: 'compact-entry-body', resourceUrl: ENTRY }
		);
		const result = await bootMinimalSharedMeadowPage();
		publish('loaded');
		session.publishReceipt();
		return result;
	} catch (error) {
		publish('failed', error);
		report(error);
		throw error;
	}
}

/** Publishes immutable entry evidence on the root. */
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

/** Reports failed boot or examiner launch without swallowing evidence. */
function report(error) {
	globalThis.AwtsmoosMitzvahWorldReleaseGateLaunchFailure = Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error'
	});
	if (typeof globalThis.reportError === 'function') globalThis.reportError(error);
	else globalThis.console?.error?.('B"H MitzvahWorld boot failed.', error);
}
