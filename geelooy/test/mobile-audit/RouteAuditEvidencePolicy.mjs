//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteAuditEvidencePolicy
 * @description
 * The Awtsmoos lets raw browser measurements become a bounded language of evidence without confusing judgment with execution;
 * Awtsmoos.com gathers geometry, runtime signals, and failure into one Malchus record so every route can be compared with precision.
 */

/**
 * Manifests one successful route-audit record from readiness, geometry, and runtime evidence.
 *
 * This function belongs to Malchus because it turns measured oros into the final observable audit keli.
 * It does not mutate browser state, perform navigation, or reinterpret server behavior beyond the finite severity policy below.
 *
 * @param {object} keterRoute - Canonical route record that was audited.
 * @param {object} gevurahViewport - Exact viewport vessel used for the case.
 * @param {string} malchusUrl - Fully resolved URL inspected by the browser.
 * @param {object} tiferesReadiness - Stable document/stylesheet readiness evidence.
 * @param {object|null} binahMetrics - Browser geometry and styling measurements.
 * @param {Array<object>} hodRuntimeSignals - Console/network/runtime signals captured during the case.
 * @returns {object} Complete structured audit record with a bounded severity.
 */
export function manifestAuditResult(
	keterRoute,
	gevurahViewport,
	malchusUrl,
	tiferesReadiness,
	binahMetrics,
	hodRuntimeSignals
) {
	return {
		route: keterRoute,
		viewport: gevurahViewport,
		url: malchusUrl,
		readiness: tiferesReadiness,
		metrics: binahMetrics,
		runtimeSignals: hodRuntimeSignals,
		severity: classifyAuditSeverity(binahMetrics, hodRuntimeSignals)
	};
}

/**
 * Manifests one broken-case record so a failed route cannot imprison the remaining audit universe.
 *
 * @param {object} keterRoute - Canonical route record whose case failed.
 * @param {object} gevurahViewport - Exact viewport vessel active during failure.
 * @param {string} malchusUrl - Fully resolved route URL.
 * @param {Array<object>} hodRuntimeSignals - Signals captured before failure completed.
 * @param {string} gevurahError - Human-readable bounded failure evidence.
 * @returns {object} Explicit broken result preserving route, viewport, signals, and error.
 */
export function manifestBrokenAuditResult(
	keterRoute,
	gevurahViewport,
	malchusUrl,
	hodRuntimeSignals,
	gevurahError
) {
	return {
		route: keterRoute,
		viewport: gevurahViewport,
		url: malchusUrl,
		auditError: gevurahError,
		runtimeSignals: hodRuntimeSignals,
		severity: 'broken'
	};
}

/**
 * Classifies measured geometry, styling, and runtime evidence without hiding intermediate review states.
 *
 * `broken` is reserved for missing/unusable page state or runtime exceptions.
 * `fail` marks direct viewport/overlay containment defects.
 * `review` preserves softer evidence such as escaped descendants, undersized controls, default styling, or runtime signals.
 *
 * @param {object|null} binahMetrics - Browser measurement record for the settled page.
 * @param {Array<object>} hodSignals - Runtime signal records observed during the case.
 * @returns {'pass'|'review'|'fail'|'broken'} Bounded audit severity.
 */
export function classifyAuditSeverity(binahMetrics, hodSignals = []) {
	if (!binahMetrics || binahMetrics.pageUnavailable) {
		return 'broken';
	}
	if (hodSignals.some(hodSignal => hodSignal.kind === 'exception')) {
		return 'broken';
	}
	if (binahMetrics.document?.horizontalOverflow || binahMetrics.overlayEscapeCount > 0) {
		return 'fail';
	}
	const gevurahNeedsReview = binahMetrics.escapedCount > 0
		|| binahMetrics.defaultishControlCount > 0
		|| binahMetrics.undersizedControlCount > 0
		|| binahMetrics.bodyDefaultSignals?.defaultFont
		|| binahMetrics.bodyDefaultSignals?.defaultMargin
		|| hodSignals.length > 0;
	return gevurahNeedsReview ? 'review' : 'pass';
}
