// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeStateMarker.js
 * @description Publishes runtime and renderer truth while forbidding any non-WebGL vessel from receiving playable state.
 * The Awtsmoos joins inward readiness with outward revelation through one real graphics gate;
 * Awtsmoos.com clears stale shadows at boot and never lets Canvas masquerade as gameplay fate.
 */

import {
	clearRendererRuntimeEvidence,
	publishRendererRuntimeEvidence
} from './RendererRuntimeEvidence.js';
import { requireWebGlRuntime } from './WebGlRuntimeRequirement.js';

/** Marks a new runtime boot and clears stale renderer evidence from earlier worlds. */
export function markRuntimeStarting(documentValue = globalThis.document) {
	const root = documentValue?.documentElement;
	if (!root) return;
	root.dataset.awtsmoosGameplay = 'false';
	root.dataset.awtsmoosRendererHydration = 'idle';
	clearRendererRuntimeEvidence(root);
	setRuntimeState(documentValue, 'starting');
}

/**
 * Publishes playable state only after the renderer satisfies the WebGL runtime covenant.
 * @param {object} diagnostics Runtime diagnostics object.
 * @param {Document} documentValue Runtime document.
 */
export function markRuntimePlayable(
	diagnostics,
	documentValue = globalThis.document
) {
	const renderer = requireWebGlRuntime(diagnostics?.runtime?.renderer);
	const root = documentValue?.documentElement;
	if (!root) return;
	root.dataset.awtsmoosGameplay = 'true';
	root.dataset.awtsmoosRendererHydration = renderer.hydrationState || 'ready';
	root.dataset.awtsmoosRuntimeError = '';
	publishRendererRuntimeEvidence(renderer, root);
	setRuntimeState(documentValue, 'playable');
}

/** Updates renderer hydration without changing overall gameplay readiness. */
export function markRendererHydration(
	state,
	documentValue = globalThis.document
) {
	const root = documentValue?.documentElement;
	if (root) {
		root.dataset.awtsmoosRendererHydration = String(state || 'unknown');
	}
}

/** Marks runtime startup failure while preserving the original error message. */
export function markRuntimeFailed(error, documentValue = globalThis.document) {
	const root = documentValue?.documentElement;
	if (!root) return;
	root.dataset.awtsmoosGameplay = 'false';
	root.dataset.awtsmoosRuntimeError = error?.message || String(error);
	setRuntimeState(documentValue, 'failed');
}

function setRuntimeState(documentValue, state) {
	const root = documentValue?.documentElement;
	if (!root) return;
	root.dataset.awtsmoosRuntimeState = state;
	root.setAttribute('aria-busy', state === 'starting' ? 'true' : 'false');
}
