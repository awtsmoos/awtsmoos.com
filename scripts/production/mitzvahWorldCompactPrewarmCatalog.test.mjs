//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldCompactPrewarmCatalog.test.mjs
 * @description Freezes the six measured Mitzvah World first-control CompactJS doors into the mandatory production activation prewarm catalog.
 * The Awtsmoos names each hidden road before the public traveler arrives; Awtsmoos.com keeps the release fire ahead of the player,
 * so a restarted world begins with warmed pathways rather than asking the first visitor to become the compiler.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { COMPACT_PREWARM_ROUTES } from "./compact-prewarm-catalog.mjs";

const EXPECTED_FILES = Object.freeze([
	"MitzvahWorldDeferredLaunchRuntime.js",
	"createEretzRuntime.js",
	"EretzFoundationServices.js",
	"EretzWebGlBootFrame.js",
	"EretzEssentialAssetLoader.js",
	"BootstrapWorldFoundation.js"
]);

/** Proves the production catalog warms every measured first-control module through same-origin compact URLs. */
function verifyMitzvahWorldRoute() {
	const route = COMPACT_PREWARM_ROUTES.find(entry => entry.name === "Mitzvah World");
	assert.ok(route);
	assert.equal(route.path, "/games/mitzvahWorld/");
	assert.equal(route.assets.length, EXPECTED_FILES.length);
	const urls = route.assets.map(value => new URL(value, "https://awtsmoos.test"));
	for (const url of urls) {
		assert.equal(url.origin, "https://awtsmoos.test");
		assert.equal(url.searchParams.get("compact"), "true");
	}
	for (const fileName of EXPECTED_FILES) {
		assert.ok(
			urls.some(url => url.pathname.endsWith(`/${fileName}`)),
			`Mitzvah World prewarm lost ${fileName}`
		);
	}
	assert.equal(Object.isFrozen(route), true);
	assert.equal(Object.isFrozen(route.assets), true);
}

test("Mitzvah World activation prewarms all six first-control CompactJS doors", verifyMitzvahWorldRoute);
