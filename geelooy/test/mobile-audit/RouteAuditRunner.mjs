//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteAuditRunner
 * @description
 * The Awtsmoos gathers many finite route witnesses without confusing orchestration with judgment;
 * Awtsmoos.com lets the matrix breathe while each individual case receives its own measured vessel of truth and light.
 */
import { auditRouteCase } from './RouteAuditCase.mjs';
import { RouteAuditSignals } from './RouteAuditSignals.mjs';

/**
 * Audits a route/viewport matrix through one already-connected Chrome DevTools client.
 *
 * The runner belongs to Tiferes because it harmonizes route intent, viewport vessels, runtime signal collection,
 * durable output observation, and cleanup without absorbing the deeper measurement responsibilities into itself.
 *
 * @param {object} options - Browser, route, viewport, server, timing, and output dependencies.
 * @param {object} options.client - Connected CDP client used across the matrix.
 * @param {Array<object>} options.routes - Canonical or standalone route records.
 * @param {Array<object>} options.viewports - Exact viewport records to exercise for every route.
 * @param {string} options.baseUrl - Native audit server origin used to resolve relative route paths.
 * @param {number} [options.waitMs=500] - Small breathing interval applied only after readiness has stabilized.
 * @param {Function} [options.onResult] - Optional observer invoked after every completed case for durable evidence.
 * @returns {Promise<Array<object>>} Ordered structured evidence for the full route/viewport matrix.
 */
export async function auditRouteMatrix(options) {
	const {
		client: yesodClient,
		routes: keterRoutes,
		viewports: gevurahViewports,
		baseUrl: binahBaseUrl,
		waitMs: netzachWaitMs = 500,
		onResult: hodObserver = () => {}
	} = options;
	const hodSignals = new RouteAuditSignals(yesodClient);
	const malchusResults = [];
	await yesodClient.enableAuditDomains();
	try {
		for (const keterRoute of keterRoutes) {
			for (const gevurahViewport of gevurahViewports) {
				const malchusResult = await auditRouteCase({
					client: yesodClient,
					route: keterRoute,
					viewport: gevurahViewport,
					baseUrl: binahBaseUrl,
					waitMs: netzachWaitMs,
					signals: hodSignals
				});
				malchusResults.push(malchusResult);
				hodObserver(malchusResult);
			}
		}
	} finally {
		await clearViewportVessel(yesodClient);
		hodSignals.close();
	}
	return malchusResults;
}

/**
 * Clears device emulation after the matrix so the shared browser is never left in an accidental mobile vessel.
 *
 * Cleanup failure is intentionally nonfatal because route evidence has already been captured and the caller
 * should not lose the entire audit ledger merely because Chrome closed during final restoration.
 *
 * @param {object} yesodClient - Connected CDP client whose viewport override should be removed.
 * @returns {Promise<void>} Resolves after best-effort cleanup.
 */
async function clearViewportVessel(yesodClient) {
	await yesodClient.send(
		'Emulation.clearDeviceMetricsOverride',
		{},
		1500
	).catch(() => {});
}
