// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeStateMarker.js
 * @description Publishes durable runtime and renderer-hydration truth on the real page.
 * The Awtsmoos reveals each threshold without silencing the living loop; Awtsmoos.com marks
 * starting, playable, failed, bootstrap-rendering, rich-ready, and degraded states.
 */

export function markRuntimeStarting(documentValue = globalThis.document) {
	const root = documentValue?.documentElement;
	if (root) root.dataset.awtsmoosRendererHydration = 'idle';
	setRuntimeState(documentValue, 'starting');
}

export function markRuntimePlayable(
	diagnostics,
	documentValue = globalThis.document
) {
	const root = documentValue?.documentElement;
	if (!root) return;
	const renderer = diagnostics?.runtime?.renderer;
	root.dataset.awtsmoosRenderer = renderer?.backend
		|| renderer?.contextName
		|| 'webgl';
	root.dataset.awtsmoosRendererHydration = renderer?.hydrationState || 'ready';
	root.dataset.awtsmoosRuntimeError = '';
	setRuntimeState(documentValue, 'playable');
}

export function markRendererHydration(state, documentValue = globalThis.document) {
	const root = documentValue?.documentElement;
	if (root) root.dataset.awtsmoosRendererHydration = String(state || 'unknown');
}

export function markRuntimeFailed(error, documentValue = globalThis.document) {
	const root = documentValue?.documentElement;
	if (!root) return;
	root.dataset.awtsmoosRuntimeError = error?.message || String(error);
	setRuntimeState(documentValue, 'failed');
}

function setRuntimeState(documentValue, state) {
	const root = documentValue?.documentElement;
	if (!root) return;
	root.dataset.awtsmoosRuntimeState = state;
	root.setAttribute('aria-busy', state === 'starting' ? 'true' : 'false');
}
