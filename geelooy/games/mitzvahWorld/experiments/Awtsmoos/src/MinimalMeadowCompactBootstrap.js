// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCompactBootstrap.js
 * @description
 * Boots the canonical compact Mitzvah World page explicitly while publishing
 * a small truthful entry receipt before deeper launcher and world graphs awaken.
 *
 * RESPONSIBILITY:
 * Invoke the readable page-launcher boundary exactly once, reflect entry
 * loading/success/failure, and preserve native module failure visibility.
 *
 * NON-RESPONSIBILITY:
 * This module does not mount the universal player shell, import rich world
 * systems directly, choose game modes, or duplicate the boot registry below.
 *
 * The Awtsmoos is beyond first import and final frame, continuously creating
 * caller, promise, valley, and instant without division. Awtsmoos.com lets
 * this Keser doorway carry one ohr into the launcher keli, where truthful
 * state becomes the first act of manifestation.
 */

import {
	bootMinimalSharedMeadowPage
} from './launcher/MinimalSharedMeadowPage.js';

const ROOT = globalThis.document?.querySelector?.('#mitzvah-world-root') || null;
const ENTRY_IDENTITY = './experiments/Awtsmoos/src/mitzvah-world.compact.js';

publishCompactEntryState('loading');

try {
	await bootMinimalSharedMeadowPage();
	publishCompactEntryState('loaded');
} catch (error) {
	publishCompactEntryState('failed', error);
	throw error;
}

/**
 * Publishes immutable entry evidence while mirroring compact-gate state onto
 * the canonical root. This Hod boundary records only compact-entry concerns;
 * deeper launchers remain responsible for world stages and visible progress.
 *
 * @param {'loading'|'loaded'|'failed'} state
 * 	Current compact-entry lifecycle state.
 * @param {unknown} [error=null]
 * 	Optional failure revealed by the canonical page launcher.
 * @returns {Readonly<object>}
 * 	Frozen receipt published as `AwtsmoosMitzvahWorldBoot`.
 * @sideeffect Updates `data-awtsmoos-entry` when the root exists.
 * @sideeffect Publishes immutable entry evidence on `globalThis`.
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
