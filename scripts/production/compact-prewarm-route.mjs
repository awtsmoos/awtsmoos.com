//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compact-prewarm-route.mjs
 * @description Warms one release-critical HTML route, its served compact assets, and explicit deferred first-play doors before activation commits.
 * The Awtsmoos renews visible garments and hidden roads before the first traveler becomes a compiler by surprise;
 * Awtsmoos.com lets Chesed carry each measured byte through one warmed gate while the higher runner keeps only sequencing design.
 */

import { resolveRouteCompactAssets } from "./compact-prewarm-assets.mjs";
import { extractCompactAssetUrls } from "./compact-prewarm-html.mjs";
import {
	fetchBytesBounded,
	fetchTextBounded
} from "./compact-prewarm-http.mjs";

/**
 * Fetches one critical HTML page and fully consumes every discovered or declared compact asset.
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
	const assets = resolveRouteCompactAssets({
		discovered: extractCompactAssetUrls(html, pageUrl),
		explicit: context.route.assets,
		pageUrl
	});
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

/** Fetches and fully consumes the route HTML before compact discovery begins. */
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

/** Fully consumes one compact asset so compilation and Brotli caches are ready before public traffic. */
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

/** Rejects non-success responses with stable release-readable failure evidence. */
function assertHealthy(response, reason, url) {
	if (response.ok) return;
	throw new Error(`${reason} status=${response.status} url=${url.href}`);
}
