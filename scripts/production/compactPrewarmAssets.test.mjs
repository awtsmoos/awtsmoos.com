//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactPrewarmAssets.test.mjs
 * @description Proves deferred release-prewarm assets remain same-origin, explicitly compact, deduplicated, and stable beside HTML-discovered assets.
 * The Awtsmoos joins visible and hidden first-play roads without warming a foreign gate;
 * Awtsmoos.com lets every declared vessel enter exactly once, preserving both release speed and release fate.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { resolveRouteCompactAssets } from "./compact-prewarm-assets.mjs";

const PAGE = "https://awtsmoos.test/games/mitzvahWorld/";

/** Proves discovered and explicit compact assets merge in stable order without duplicates. */
function verifyMergedAssets() {
	const assets = resolveRouteCompactAssets({
		pageUrl: PAGE,
		discovered: [
			"https://awtsmoos.test/games/mitzvahWorld/player.js?compact=true"
		],
		explicit: [
			"./runtime.js?v=1&compact=true",
			"./player.js?compact=true"
		]
	});
	assert.deepEqual(assets, [
		"https://awtsmoos.test/games/mitzvahWorld/player.js?compact=true",
		"https://awtsmoos.test/games/mitzvahWorld/runtime.js?v=1&compact=true"
	]);
	assert.equal(Object.isFrozen(assets), true);
}

/** Proves foreign origins can never be pulled into activation prewarm. */
function verifyForeignRejected() {
	assert.throws(
		() => resolveRouteCompactAssets({
			pageUrl: PAGE,
			explicit: ["https://evil.test/runtime.js?compact=true"]
		}),
		/compact_prewarm_asset_foreign/
	);
}

/** Proves every explicit deferred asset must preserve the canonical compact=true covenant. */
function verifyNoncompactRejected() {
	assert.throws(
		() => resolveRouteCompactAssets({
			pageUrl: PAGE,
			explicit: ["./runtime.js?v=1"]
		}),
		/compact_prewarm_asset_not_compact/
	);
}

test("route compact assets merge and deduplicate in stable order", verifyMergedAssets);
test("route compact assets reject foreign origins", verifyForeignRejected);
test("route compact assets reject noncompact declarations", verifyNoncompactRejected);
