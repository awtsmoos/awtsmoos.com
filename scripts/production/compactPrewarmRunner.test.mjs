//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactPrewarmRunner.test.mjs
 * @description Proves critical-route prewarming consumes served compact assets plus declared deferred doors sequentially and fails closed on broken release bytes.
 * The Awtsmoos warms what the page reveals and what first play conceals before Malchus opens the public gate;
 * Awtsmoos.com lets Tiferes prove every local vessel in order, rejecting hollow, foreign, or failing fate.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { prewarmCriticalRoutes } from "./compact-prewarm-runner.mjs";
import {
	revealFetchHarness,
	revealResponse
} from "./test/CompactPrewarmFetchHarness.mjs";

const ORIGIN = "https://awtsmoos.test";
const ROUTE = Object.freeze({
	name: "Mitzvah",
	path: "/game/",
	assets: Object.freeze(["./deferred.js?v=2&compact=true"])
});

/** Creates one successful page plus its discovered and deferred compact responses. */
function revealSuccessfulHarness() {
	const html = [
		'<link href="./ui.css?compact=true">',
		'<script src="./main.js?v=1&compact=true"></script>'
	].join("\n");
	return revealFetchHarness({
		[`${ORIGIN}/game/`]: revealResponse({ text: html }),
		[`${ORIGIN}/game/ui.css?compact=true`]: revealResponse({
			bytes: new Uint8Array([1]),
			headers: { "content-encoding": "br" }
		}),
		[`${ORIGIN}/game/main.js?v=1&compact=true`]: revealResponse({
			bytes: new Uint8Array([2, 3]),
			headers: { "content-encoding": "br" }
		}),
		[`${ORIGIN}/game/deferred.js?v=2&compact=true`]: revealResponse({
			bytes: new Uint8Array([4, 5, 6]),
			headers: { "content-encoding": "br" }
		})
	});
}

/** Proves ordered HTML/discovered/deferred warming, Brotli negotiation, and immutable evidence. */
async function verifySuccessfulWarm() {
	const harness = revealSuccessfulHarness();
	const evidence = await prewarmCriticalRoutes({
		origin: ORIGIN,
		routes: [ROUTE],
		fetchImpl: harness.fetch,
		timeoutMs: 100
	});
	assert.deepEqual(
		harness.calls.map(call => call.href),
		[
			`${ORIGIN}/game/`,
			`${ORIGIN}/game/ui.css?compact=true`,
			`${ORIGIN}/game/main.js?v=1&compact=true`,
			`${ORIGIN}/game/deferred.js?v=2&compact=true`
		]
	);
	for (const call of harness.calls.slice(1)) {
		assert.equal(call.headers["accept-encoding"], "br");
	}
	assert.equal(evidence[0].assets.length, 3);
	assert.equal(Object.isFrozen(evidence), true);
	assert.equal(Object.isFrozen(evidence[0].assets), true);
}

/** Verifies a critical page with neither discovered nor explicit assets blocks activation warming. */
async function verifyMissingAssets() {
	const harness = revealFetchHarness({
		[`${ORIGIN}/game/`]: revealResponse({ text: "<main>plain</main>" })
	});
	await assert.rejects(
		prewarmCriticalRoutes({
			origin: ORIGIN,
			routes: [{ name: "Plain", path: "/game/", assets: [] }],
			fetchImpl: harness.fetch
		}),
		/compact_prewarm_assets_missing/
	);
}

/** Verifies broken HTML, asset response, and empty asset each fail closed. */
async function verifyBrokenResponses() {
	const html = '<script src="./main.js?compact=true"></script>';
	for (const [page, asset, reason] of [
		[revealResponse({ status: 503 }), null, /compact_prewarm_html_failed/],
		[revealResponse({ text: html }), revealResponse({ status: 500 }), /compact_prewarm_asset_failed/],
		[revealResponse({ text: html }), revealResponse({ bytes: new Uint8Array() }), /compact_prewarm_asset_empty/]
	]) {
		const responses = { [`${ORIGIN}/game/`]: page };
		if (asset) responses[`${ORIGIN}/game/main.js?compact=true`] = asset;
		const harness = revealFetchHarness(responses);
		await assert.rejects(
			prewarmCriticalRoutes({
				origin: ORIGIN,
				routes: [{ name: "Broken", path: "/game/", assets: [] }],
				fetchImpl: harness.fetch
			}),
			reason
		);
	}
}

test("critical route warms discovered and deferred compact assets in order", verifySuccessfulWarm);
test("critical route rejects pages that expose no compact assets", verifyMissingAssets);
test("critical route fails closed on broken or empty responses", verifyBrokenResponses);
