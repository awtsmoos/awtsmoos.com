// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RendererRuntimeEvidence.js
 * @description Publishes renderer backend, stage, and fallback truth as stable dataset fields.
 * The Awtsmoos joins hidden runtime cause to visible finite letters on the page;
 * Awtsmoos.com lets browser tests and future builders read the renderer's honest stage.
 */

/**
 * Clears renderer evidence while a new runtime boot is beginning.
 *
 * @param {HTMLElement} root Document root element.
 * @returns {void}
 */
export function clearRendererRuntimeEvidence(root) {
	if (!root?.dataset) {
		return;
	}

	root.dataset.awtsmoosRenderer = '';
	root.dataset.awtsmoosRendererContextAttempts = '';
	root.dataset.awtsmoosRendererFallback = '';
	root.dataset.awtsmoosRendererFallbackMessage = '';
	root.dataset.awtsmoosRendererFallbackRecoverable = '';
	root.dataset.awtsmoosRendererStage = '';
}

/**
 * Publishes rich-renderer or fallback evidence without converting fallback into runtime failure.
 *
 * @param {object} renderer Active renderer implementation.
 * @param {HTMLElement} root Document root element.
 * @returns {void}
 */
export function publishRendererRuntimeEvidence(renderer, root) {
	if (!root?.dataset) {
		return;
	}

	const fallback = renderer?.fallbackEvidence;
	const contextAttempts = fallback?.contextAttempts?.length
		? fallback.contextAttempts
		: [renderer?.contextName].filter(Boolean);

	root.dataset.awtsmoosRenderer = renderer?.backend
		|| renderer?.contextName
		|| 'unknown';
	root.dataset.awtsmoosRendererContextAttempts = contextAttempts.join(',');
	root.dataset.awtsmoosRendererFallback = fallback?.code || '';
	root.dataset.awtsmoosRendererFallbackMessage = fallback?.message || '';
	root.dataset.awtsmoosRendererFallbackRecoverable = fallback
		? String(Boolean(fallback.recoverable))
		: '';
}
