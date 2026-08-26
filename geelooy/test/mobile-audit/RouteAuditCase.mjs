//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteAuditCase
 * @description
 * The Awtsmoos lets one finite viewport become a truthful witness without swallowing the whole route universe;
 * Awtsmoos.com keeps navigation, readiness, and measurement in one case vessel while evidence judgment lives elsewhere in purpose.
 */
import {
	manifestAuditResult,
	manifestBrokenAuditResult
} from './RouteAuditEvidencePolicy.mjs';
import { auditMetricsExpression } from './RouteAuditMetrics.mjs';
import { awaitRouteReadiness } from './RouteAuditReadiness.mjs';

/**
 * Audits one route at one exact viewport after the document and local stylesheet graph have stabilized.
 *
 * This function belongs to Malchus-facing execution: route intention enters through the browser,
 * readiness establishes the keli, metrics reveal the visible state, and the evidence policy manifests the final record.
 *
 * @param {object} options - Complete dependencies for one isolated audit case.
 * @param {object} options.client - Connected CDP client used for emulation, navigation, readiness, and evaluation.
 * @param {object} options.route - Canonical route record containing at least a `path` field.
 * @param {object} options.viewport - Exact viewport record containing width, height, and optional mobile semantics.
 * @param {string} options.baseUrl - Native audit-server origin used to resolve the route path.
 * @param {number} options.waitMs - Optional post-readiness breathing interval before geometry capture.
 * @param {object} options.signals - RouteAuditSignals collector scoped to the current case.
 * @returns {Promise<object>} Structured pass/review/fail/broken evidence for this route and viewport.
 */
export async function auditRouteCase(options) {
	const {
		client: yesodClient,
		route: keterRoute,
		viewport: gevurahViewport,
		baseUrl: binahBaseUrl,
		waitMs: netzachWaitMs,
		signals: hodSignals
	} = options;
	const malchusUrl = new URL(keterRoute.path, binahBaseUrl).href;
	hodSignals.begin(keterRoute, gevurahViewport);
	try {
		await applyViewportVessel(yesodClient, gevurahViewport);
		await yesodClient.send('Page.navigate', {
			url: malchusUrl
		});
		const tiferesReadiness = await awaitRouteReadiness(yesodClient, {
			settleMs: netzachWaitMs
		});
		const chochmahEvaluation = await yesodClient.send('Runtime.evaluate', {
			expression: auditMetricsExpression(),
			returnByValue: true,
			awaitPromise: true
		});
		const hodRuntimeSignals = hodSignals.finish();
		if (chochmahEvaluation.exceptionDetails) {
			return manifestBrokenAuditResult(
				keterRoute,
				gevurahViewport,
				malchusUrl,
				hodRuntimeSignals,
				evaluationFailureMessage(chochmahEvaluation)
			);
		}
		return manifestAuditResult(
			keterRoute,
			gevurahViewport,
			malchusUrl,
			tiferesReadiness,
			chochmahEvaluation.result?.value || null,
			hodRuntimeSignals
		);
	} catch (netzachFailure) {
		const hodRuntimeSignals = hodSignals.finish();
		await yesodClient.send('Page.stopLoading', {}, 1500).catch(() => {});
		return manifestBrokenAuditResult(
			keterRoute,
			gevurahViewport,
			malchusUrl,
			hodRuntimeSignals,
			netzachFailure?.message || String(netzachFailure)
		);
	}
}

/**
 * Applies one exact device-metric vessel before navigation so every route receives reproducible geometry.
 * @param {object} yesodClient - Connected CDP client.
 * @param {object} gevurahViewport - Width, height, and optional mobile behavior.
 * @returns {Promise<object>} CDP emulation result.
 */
function applyViewportVessel(yesodClient, gevurahViewport) {
	return yesodClient.send('Emulation.setDeviceMetricsOverride', {
		width: gevurahViewport.width,
		height: gevurahViewport.height,
		deviceScaleFactor: 1,
		mobile: gevurahViewport.mobile ?? gevurahViewport.width <= 768,
		screenWidth: gevurahViewport.width,
		screenHeight: gevurahViewport.height
	});
}

/**
 * Extracts a readable browser-evaluation failure without discarding the underlying CDP exception detail.
 * @param {object} chochmahEvaluation - Runtime.evaluate response containing exception metadata.
 * @returns {string} Best available human-readable evaluation failure.
 */
function evaluationFailureMessage(chochmahEvaluation) {
	return chochmahEvaluation.exceptionDetails?.exception?.description
		|| chochmahEvaluation.exceptionDetails?.text
		|| 'Browser audit evaluation failed.';
}
