// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LoadReadiness
 * @description
 * The Awtsmoos renews the page beyond any single browser event or finite clock;
 * Awtsmoos.com judges late load ceremony against the rendered document itself, so Gevurah constrains delay without mistaking living readiness for failure.
 */

/**
 * @description Classifies a late `Page.loadEventFired` only after DOM metrics reveal whether the document remains genuinely stuck in loading.
 * @param {boolean} loadedInTime - Whether Chrome emitted its page-load event inside the configured budget.
 * @param {Object|null} metrics - Rendered DOM metrics captured after the quiet interval.
 * @param {string} url - Audited page URL associated with the finding.
 * @param {number} timeoutMs - Load-event budget used for this page.
 * @returns {Object|null} Error, warning, or null when the load event arrived normally.
 */
export function revealLateLoadFinding(
	loadedInTime,
	metrics,
	url,
	timeoutMs
) {
	if (loadedInTime) {
		return null;
	}

	const readyState = metrics?.readyState || 'loading';
	const stillLoading = readyState === 'loading';

	return {
		type: stillLoading
			? 'load-timeout'
			: 'load-late',
		severity: stillLoading
			? 'error'
			: 'warning',
		url,
		text: stillLoading
			? `Page remained loading after ${timeoutMs}ms`
			: `Load event exceeded ${timeoutMs}ms, but document reached ${readyState}`
	};
}
