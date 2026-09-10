//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file RuntimeStateMarker.js
 * @description Publishes one runtime truth to both the document diagnostics root and the public game shell.
 * The shell historically exposed data-awtsmoos-runtime while diagnostics exposed data-awtsmoos-runtime-state;
 * this module keeps both names synchronized so automation, accessibility, and users never see stale readiness.
 */

import {
	clearRendererRuntimeEvidence,
	publishRendererRuntimeEvidence
} from './RendererRuntimeEvidence.js';
import { requireWebGlRuntime } from './WebGlRuntimeRequirement.js';

/** Marks a new runtime boot and clears renderer evidence from an earlier world. */
export function markRuntimeStarting(documentValue = globalThis.document) {
	const documentRoot = documentValue?.documentElement;
	if (!documentRoot) return;
	clearRendererRuntimeEvidence(documentRoot);
	for (const root of runtimeRoots(documentValue)) {
		root.dataset.awtsmoosGameplay = 'false';
		root.dataset.awtsmoosRendererHydration = 'idle';
	}
	setRuntimeState(documentValue, 'starting');
}

/** Publishes playable state only after the renderer satisfies the WebGL covenant. */
export function markRuntimePlayable(
	diagnostics,
	documentValue = globalThis.document
) {
	const renderer = requireWebGlRuntime(diagnostics?.runtime?.renderer);
	const documentRoot = documentValue?.documentElement;
	if (!documentRoot) return;
	for (const root of runtimeRoots(documentValue)) {
		root.dataset.awtsmoosGameplay = 'true';
		root.dataset.awtsmoosRendererHydration = renderer.hydrationState || 'ready';
		root.dataset.awtsmoosRuntimeError = '';
	}
	publishRendererRuntimeEvidence(renderer, documentRoot);
	setRuntimeState(documentValue, 'playable');
}

/** Updates renderer hydration without changing overall gameplay readiness. */
export function markRendererHydration(
	state,
	documentValue = globalThis.document
) {
	for (const root of runtimeRoots(documentValue)) {
		root.dataset.awtsmoosRendererHydration = String(state || 'unknown');
	}
}

/** Marks startup failure while preserving the original error on every public runtime root. */
export function markRuntimeFailed(error, documentValue = globalThis.document) {
	for (const root of runtimeRoots(documentValue)) {
		root.dataset.awtsmoosGameplay = 'false';
		root.dataset.awtsmoosRuntimeError = error?.message || String(error);
	}
	setRuntimeState(documentValue, 'failed');
}

/** Synchronizes both historical runtime attributes and accessibility busy state. */
function setRuntimeState(documentValue, state) {
	for (const root of runtimeRoots(documentValue)) {
		root.dataset.awtsmoosRuntime = state;
		root.dataset.awtsmoosRuntimeState = state;
		root.setAttribute('aria-busy', state === 'starting' ? 'true' : 'false');
	}
}

/** Returns the diagnostic HTML root and public Mitzvah World host without duplicates. */
function runtimeRoots(documentValue) {
	const documentRoot = documentValue?.documentElement || null;
	const shellRoot = documentValue?.getElementById?.('mitzvah-world-root') || null;
	return [...new Set([documentRoot, shellRoot].filter(Boolean))];
}
