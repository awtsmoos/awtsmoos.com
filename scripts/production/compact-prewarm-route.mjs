//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compact-prewarm-route.mjs
 * @description Warms one release-critical HTML route and every same-origin CompactJS/CSS asset that its served markup declares.
 * The Awtsmoos renews one public doorway before stylesheet, module, and compression can gather into a warmed release sign;
 * Awtsmoos.com lets Chesed carry one route from HTML through final byte while the higher runner keeps only sequencing design.
 */

import { extractCompactAssetUrls } from "./compact-prewarm-html.mjs";
import {
	fetchBytesBounded,
	fetchTextBounded
} from "./compact-prewarm-http.mjs";

/**
 * @description Fetches one critical HTML page, discovers compact assets, and consumes each asset through Brotli negotiation.
 * @param {object} context Route-specific prewarm dependencies.
 * @param {URL} context.base Local restarted-service origin.
 * @param {Readonly<object>} context.route Critical route descriptor.
 * @param {Function} context.fetchImpl Fetch-compatible HTTP implementation.
 * @param {number} context.timeoutMs Per-request timeout covering headers and body.
 * @returns {Promise<Readonly<object>>} Immutable evidence for the warmed route.
 */
export async function prewarmCriticalRoute(context) {
	const pageUrl = new URL(context.route.path, context.base);
	const html = await revealHtml(context, pageUrl);
	const assets = extractCompactAssetUrls(html, pageUrl);
	if (!assets.length) {
		throw new Error(`compact_prewarm_assets_missing ${pageUrl.href}`);
	}
	const assetEvidence = [];
	for (const assetUrl of assets) {
		assetEvidence.push(await prewarmCompactAsset(
			context.fetchImpl,
			assetUrl,
			context.timeoutMs
		));
	}
	return Object.freeze({
		name: context.route.name,
		pageUrl: pageUrl.href,
		assets: Object.freeze(assetEvidence)
	});
}

/**
 * @description Fetches and fully consumes the route HTML before compact discovery begins.
 * @param {object} context Route-specific prewarm dependencies.
 * @param {URL} pageUrl Absolute HTML URL.
 * @returns {Promise<string>} Non-empty served HTML.
 */
async function revealHtml(context, pageUrl) {
	const result = await fetchTextBounded(
		context.fetchImpl,
		pageUrl,
		context.timeoutMs,
		{ accept: "text/html" }
	);
	assertHealthy(result.response, "compact_prewarm_html_failed", pageUrl);
	if (!result.body.length) {
		throw new Error(`compact_prewarm_html_empty ${pageUrl.href}`);
	}
	return result.body;
}

/**
 * @description Fully consumes one compact asset so compilation and Brotli generated-response caches are both primed before activation commits.
 * @param {Function} fetchImpl Fetch-compatible HTTP function.
 * @param {string} assetUrl Absolute compact asset URL.
 * @param {number} timeoutMs Timeout covering headers and complete body.
 * @returns {Promise<Readonly<object>>} Immutable asset evidence.
 */
async function prewarmCompactAsset(fetchImpl, assetUrl, timeoutMs) {
	const result = await fetchBytesBounded(
		fetchImpl,
		assetUrl,
		timeoutMs,
		{ "accept-encoding": "br" }
	);
	assertHealthy(
		result.response,
		"compact_prewarm_asset_failed",
		new URL(assetUrl)
	);
	if (!result.body.byteLength) {
		throw new Error(`compact_prewarm_asset_empty ${assetUrl}`);
	}
	return Object.freeze({
		url: assetUrl,
		status: result.response.status,
		encoding: result.response.headers.get("content-encoding") || "identity",
		bytes: result.body.byteLength
	});
}

/**
 * @description Rejects non-success responses with stable release-readable failure evidence.
 * @param {Response} response HTTP response.
 * @param {string} reason Stable failure reason.
 * @param {URL} url Requested URL.
 * @returns {void}
 * @throws {Error} For non-2xx responses.
 */
function assertHealthy(response, reason, url) {
	if (response.ok) return;
	throw new Error(`${reason} status=${response.status} url=${url.href}`);
}
