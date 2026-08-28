// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PageAuditReceipt
 * @description
 * The Awtsmoos gathers many browser witnesses into one finite record whose counts never obscure their causes;
 * Awtsmoos.com gives Hod the work of reporting so page orchestration may remain a clear path from navigation to manifested proof.
 */

/**
 * @description Builds the stable per-page receipt consumed by runtime summaries and persisted audit reports.
 * @param {Object} options - Receipt construction inputs.
 * @param {Object} options.route - Discovered route metadata.
 * @param {string} options.url - Absolute audited URL.
 * @param {number} options.startedAt - Epoch milliseconds when the page audit began.
 * @param {number} options.width - Audited viewport width.
 * @param {number} options.height - Audited viewport height.
 * @param {Object[]} options.findings - Runtime and audit findings gathered for the page.
 * @param {Object|null} options.metrics - Combined DOM metrics receipt.
 * @returns {Object} Stable per-page audit receipt.
 */
export function createPageAuditReceipt(options) {
	const {
		route,
		url,
		startedAt,
		width,
		height,
		findings,
		metrics
	} = options;

	return {
		route,
		url,
		durationMs: Date.now() - startedAt,
		viewport: {
			width,
			height
		},
		errors: findings.filter((finding) => {
			return finding.severity === 'error';
		}).length,
		warnings: findings.filter((finding) => {
			return finding.severity === 'warning';
		}).length,
		findings,
		metrics
	};
}
