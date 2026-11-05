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
import {
	restartMitzvahWorldBootState,
	transitionMitzvahWorldBootState
} from './MitzvahWorldBootStateMachine.js';

/** Marks a new runtime boot and clears renderer evidence from an earlier world. */
export function markRuntimeStarting(documentValue = globalThis.document) {
	const documentRoot = documentValue?.documentElement;
	if (!documentRoot) return;
	clearRendererRuntimeEvidence(documentRoot);
	const environment = documentValue?.defaultView || globalThis;
	restartMitzvahWorldBootState(environment, documentValue);
	for (const root of runtimeRoots(documentValue)) {
		root.dataset.awtsmoosGameplay = 'false';
		root.dataset.awtsmoosRendererHydration = 'idle';
	}
}

/** Publishes playable state only after the renderer satisfies the WebGL covenant. */
export function markRuntimePlayable(
	diagnostics,
	documentValue = globalThis.document
) {
	const renderer = requireWebGlRuntime(diagnostics?.runtime?.renderer);
	const documentRoot = documentValue?.documentElement;
	if (!documentRoot) return;
	const environment = documentValue?.defaultView || globalThis;
	// The single state machine refuses this transition unless boot truly left starting,
	// so playable can never be published while starting or failed.
	transitionMitzvahWorldBootState(environment, documentValue, 'ready', {
		backend: renderer.backend,
		code: 'PLAYABLE',
		contextName: renderer.contextName,
		hydrationState: renderer.hydrationState || 'ready'
	});
	for (const root of runtimeRoots(documentValue)) {
		root.dataset.awtsmoosRendererHydration = renderer.hydrationState || 'ready';
	}
	publishRendererRuntimeEvidence(renderer, documentRoot);
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
	const environment = documentValue?.defaultView || globalThis;
	transitionMitzvahWorldBootState(environment, documentValue, 'failed', {
		code: error?.code || 'RUNTIME_FAILED',
		message: error?.message || String(error),
		name: error?.name || 'Error'
	});
}

/** Returns the diagnostic HTML root and public Mitzvah World host without duplicates. */
function runtimeRoots(documentValue) {
	const documentRoot = documentValue?.documentElement || null;
	const shellRoot = documentValue?.getElementById?.('mitzvah-world-root') || null;
	return [...new Set([documentRoot, shellRoot].filter(Boolean))];
}
