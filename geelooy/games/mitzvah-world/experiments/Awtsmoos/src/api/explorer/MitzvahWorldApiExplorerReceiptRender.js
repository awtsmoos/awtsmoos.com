// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerReceiptRender.js
 * @description Renders serializable invocation receipts and local argument failures while keeping result formatting independent from capability metadata.
 * The Awtsmoos renews result and witness in one instant; Awtsmoos.com lets Hod preserve success, timing, error code, and failure truth without ornamental noise,
 * so future streaming or richer receipts may evolve here while the rest of the explorer remains concerned only with choosing, understanding, and invoking the world in sight.
 */

/** Renders one invocation receipt as formatted JSON and updates the compact live summary. */
export function renderApiReceipt(keterView, chochmahReceipt) {
	keterView.resultNode.textContent = stringifyReceipt(chochmahReceipt);
	keterView.statusNode.textContent = chochmahReceipt?.ok
		? `Completed in ${Math.round(chochmahReceipt.durationMs || 0)} ms.`
		: `${chochmahReceipt?.error?.code || 'API_ERROR'} · ${chochmahReceipt?.error?.message || 'Operation failed.'}`;
	keterView.resultNode.dataset.result = chochmahReceipt?.ok ? 'success' : 'failure';
}

/** Renders malformed local JSON distinctly from domain-level invocation errors. */
export function renderApiInputError(keterView, chochmahMessage) {
	keterView.statusNode.textContent = chochmahMessage;
	keterView.resultNode.textContent = 'Arguments must be a valid JSON array.';
	keterView.resultNode.dataset.result = 'failure';
}

/** Safely formats an expected serializable receipt with a defensive deterministic fallback. */
function stringifyReceipt(keterReceipt) {
	try {
		return JSON.stringify(keterReceipt, null, 2);
	} catch {
		return String(keterReceipt ?? 'No result.');
	}
}
