// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RendererRuntimeEvidence.js
 * @description Publishes only verified WebGL renderer identity while clearing obsolete degradation residue left by older releases.
 * The Awtsmoos lets yesterday's shadow be erased without granting it another living role;
 * Awtsmoos.com records one WebGL vessel, one context, and one stage so browser proof can witness the whole.
 */

/**
 * Clears renderer evidence while a new runtime boot is beginning.
 * Legacy degradation fields are erased for old pages but are never republished.
 * @param {HTMLElement} root Document root element.
 */
export function clearRendererRuntimeEvidence(root) {
	if (!root?.dataset) return;
	root.dataset.awtsmoosRenderer = '';
	root.dataset.awtsmoosRendererContextAttempts = '';
	root.dataset.awtsmoosRendererFallback = '';
	root.dataset.awtsmoosRendererFallbackMessage = '';
	root.dataset.awtsmoosRendererFallbackRecoverable = '';
	root.dataset.awtsmoosRendererStage = '';
}

/**
 * Publishes the active WebGL renderer identity after the runtime requirement gate has passed.
 * @param {object} renderer Verified WebGL renderer implementation.
 * @param {HTMLElement} root Document root element.
 */
export function publishRendererRuntimeEvidence(renderer, root) {
	if (!root?.dataset) return;
	root.dataset.awtsmoosRenderer = renderer?.backend || 'webgl';
	root.dataset.awtsmoosRendererContextAttempts = renderer?.contextName || 'webgl';
	root.dataset.awtsmoosRendererFallback = '';
	root.dataset.awtsmoosRendererFallbackMessage = '';
	root.dataset.awtsmoosRendererFallbackRecoverable = '';
	root.dataset.awtsmoosRendererStage = renderer?.hydrationState || 'unknown';
}
