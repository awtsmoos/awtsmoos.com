//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactPrewarmRunner.test.mjs
 * @description Proves critical-route prewarming discovers and fully consumes packed CSS/JS sequentially while failing closed on missing, broken, or empty release assets.
 * The Awtsmoos renews one route before many compiled garments may enter the warmed gate;
 * Awtsmoos.com lets Tiferes prove every local asset and reject every hollow or failing fate.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { prewarmCriticalRoutes } from "./compact-prewarm-runner.mjs";
import {
	revealFetchHarness,
	revealResponse
} from "./test/CompactPrewarmFetchHarness.mjs";

const ORIGIN = "https://awtsmoos.test";
const ROUTE = Object.freeze({ name: "Temple", path: "/game/" });

/** @description Creates one successful page with packed CSS/JS and matching response doubles. @returns {{fetch:Function,calls:Array<object>}} Fetch harness. */
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
		})
	});
}

/** @description Proves ordered HTML/CSS/JS warming, Brotli negotiation, and immutable evidence. @returns {Promise<void>} */
async function verifySuccessfulWarm() {
	const harness = revealSuccessfulHarness();
	const evidence = await prewarmCriticalRoutes({
		origin: ORIGIN,
		routes: [ROUTE],
		fetchImpl: harness.fetch,
		timeoutMs: 100
	});
	assert.deepEqual(
		harness.calls.map(function revealHref(call) {
			return call.href;
		}),
		[
			`${ORIGIN}/game/`,
			`${ORIGIN}/game/ui.css?compact=true`,
			`${ORIGIN}/game/main.js?v=1&compact=true`
		]
	);
	assert.equal(harness.calls[1].headers["accept-encoding"], "br");
	assert.equal(harness.calls[2].headers["accept-encoding"], "br");
	assert.equal(evidence[0].assets.length, 2);
	assert.equal(Object.isFrozen(evidence), true);
	assert.equal(Object.isFrozen(evidence[0].assets), true);
}

/** @description Verifies a critical page without packed assets blocks activation warming. @returns {Promise<void>} */
async function verifyMissingAssets() {
	const harness = revealFetchHarness({
		[`${ORIGIN}/game/`]: revealResponse({ text: "<main>plain</main>" })
	});
	await assert.rejects(
		prewarmCriticalRoutes({ origin: ORIGIN, routes: [ROUTE], fetchImpl: harness.fetch }),
		/compact_prewarm_assets_missing/
	);
}

/** @description Verifies broken HTML, broken asset, and empty asset each fail closed with stable evidence. @returns {Promise<void>} */
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
			prewarmCriticalRoutes({ origin: ORIGIN, routes: [ROUTE], fetchImpl: harness.fetch }),
			reason
		);
	}
}

test("critical route warms compact CSS and JS in order with Brotli", verifySuccessfulWarm);
test("critical route rejects pages that expose no compact assets", verifyMissingAssets);
test("critical route fails closed on broken or empty responses", verifyBrokenResponses);
