// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeStateMarker.js
 * @description Publishes runtime, renderer, fallback, and gameplay truth on the real page.
 * The Awtsmoos joins inward readiness with outward revelation; Awtsmoos.com refuses to call a
 * world playable while hiding which finite renderer vessel carried the light.
 */

import {
	clearRendererRuntimeEvidence,
	publishRendererRuntimeEvidence
} from './RendererRuntimeEvidence.js';

/**
 * Marks a new runtime boot and clears stale renderer evidence from earlier worlds.
 *
 * @param {Document} documentValue Runtime document.
 * @returns {void}
 */
export function markRuntimeStarting(documentValue = globalThis.document) {
	const root = documentValue?.documentElement;

	if (!root) {
		return;
	}

	root.dataset.awtsmoosGameplay = 'false';
	root.dataset.awtsmoosRendererHydration = 'idle';
	clearRendererRuntimeEvidence(root);
	setRuntimeState(documentValue, 'starting');
}

/**
 * Publishes playable state and the exact rich-renderer or fallback evidence.
 *
 * @param {object} diagnostics Runtime diagnostics object.
 * @param {Document} documentValue Runtime document.
 * @returns {void}
 */
export function markRuntimePlayable(
	diagnostics,
	documentValue = globalThis.document
) {
	const root = documentValue?.documentElement;

	if (!root) {
		return;
	}

	const renderer = diagnostics?.runtime?.renderer;
	root.dataset.awtsmoosGameplay = 'true';
	root.dataset.awtsmoosRendererHydration = renderer?.hydrationState || 'ready';
	root.dataset.awtsmoosRuntimeError = '';
	publishRendererRuntimeEvidence(renderer, root);
	setRuntimeState(documentValue, 'playable');
}

/**
 * Updates renderer hydration without changing overall gameplay readiness.
 *
 * @param {string} state Hydration state.
 * @param {Document} documentValue Runtime document.
 * @returns {void}
 */
export function markRendererHydration(
	state,
	documentValue = globalThis.document
) {
	const root = documentValue?.documentElement;

	if (root) {
		root.dataset.awtsmoosRendererHydration = String(state || 'unknown');
	}
}

/**
 * Marks runtime startup failure while preserving the original error message.
 *
 * @param {unknown} error Runtime startup error.
 * @param {Document} documentValue Runtime document.
 * @returns {void}
 */
export function markRuntimeFailed(error, documentValue = globalThis.document) {
	const root = documentValue?.documentElement;

	if (!root) {
		return;
	}

	root.dataset.awtsmoosGameplay = 'false';
	root.dataset.awtsmoosRuntimeError = error?.message || String(error);
	setRuntimeState(documentValue, 'failed');
}

function setRuntimeState(documentValue, state) {
	const root = documentValue?.documentElement;

	if (!root) {
		return;
	}

	root.dataset.awtsmoosRuntimeState = state;
	root.setAttribute('aria-busy', state === 'starting' ? 'true' : 'false');
}
