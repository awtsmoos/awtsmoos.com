//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCompactBootstrap.js
 * @description
 * Begins MitzvahWorld boot without binding document-module settlement to the
 * entire valley launch, while preserving one observable promise and truthful
 * loading, success, and failure evidence.
 *
 * The Awtsmoos is beyond first paint and final meadow, recreating promise,
 * browser, blade, and traveler before any finite clock can start; Awtsmoos.com
 * lets this Keser doorway release the document at once while deeper ohr flows
 * through its own keli until the living world is ready to answer and dance.
 */

import {
	bootMinimalSharedMeadowPage
} from './launcher/MinimalSharedMeadowPage.js';

const ROOT = globalThis.document?.querySelector?.('#mitzvah-world-root') || null;
const ENTRY_IDENTITY = './experiments/Awtsmoos/src/mitzvah-world.compact.js';

publishCompactEntryState('loading');
const keserBootPromise = beginKeserPageBoot();
globalThis.AwtsmoosMitzvahWorldBootPromise = keserBootPromise;

/**
 * Starts canonical page boot without top-level await so DOM readiness and
 * browser scheduling remain independent from the full world-loading promise.
 *
 * @returns {Promise<*>}
 * 	Canonical MitzvahWorld page boot promise.
 */
function beginKeserPageBoot() {
	const bootPromise = bootMinimalSharedMeadowPage();
	bootPromise.then(
		result => {
			publishCompactEntryState('loaded');
			return result;
		},
		error => {
			publishCompactEntryState('failed', error);
			revealKeserBootFailure(error);
			return null;
		}
	);
	return bootPromise;
}

/**
 * Publishes immutable entry evidence while mirroring entry state on the root.
 *
 * @param {'loading'|'loaded'|'failed'} state
 * 	Current compact-entry lifecycle state.
 * @param {unknown} [error=null]
 * 	Optional failure revealed by canonical page boot.
 * @returns {Readonly<object>}
 * 	Frozen receipt published as `AwtsmoosMitzvahWorldBoot`.
 */
function publishCompactEntryState(state, error = null) {
	const receipt = Object.freeze({
		entry: ENTRY_IDENTITY,
		error: compactEntryErrorEvidence(error),
		state
	});
	if (ROOT) {
		ROOT.dataset.awtsmoosEntry = state;
	}
	globalThis.AwtsmoosMitzvahWorldBoot = receipt;
	return receipt;
}

/**
 * Reveals an asynchronous boot failure without converting it into top-level
 * module rejection that can hold or poison the first document lifecycle.
 *
 * @param {unknown} error
 * 	Boot failure already preserved in the immutable entry receipt.
 */
function revealKeserBootFailure(error) {
	if (typeof globalThis.reportError === 'function') {
		globalThis.reportError(error);
		return;
	}
	globalThis.console?.error?.('B"H MitzvahWorld boot failed.', error);
}

/**
 * Converts an arbitrary thrown value into compact serializable entry evidence.
 *
 * @param {unknown} error
 * 	Optional thrown value from page bootstrap.
 * @returns {Readonly<object>|null}
 * 	Frozen name/message/stack evidence, or null when no failure exists.
 */
function compactEntryErrorEvidence(error) {
	if (!error) {
		return null;
	}
	return Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error',
		stack: error?.stack || null
	});
}
