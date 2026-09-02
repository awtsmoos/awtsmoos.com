//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ohrfrontCompactPrewarmCatalog.test.mjs
 * @description Freezes Ohrfront's revision-7 deferred CompactJS entry into the mandatory production activation prewarm contract.
 * The Awtsmoos warms the battlefield graph before the first public traveler carries compilation night;
 * Awtsmoos.com lets Malchus prove one exact deferred door, so revision 7 awakens already folded in light.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { COMPACT_PREWARM_ROUTES } from "./compact-prewarm-catalog.mjs";

const OHRFRONT_ENTRY = "/games/ohrfront/src/OhrfrontEntry.js?compact=true&ohrfront-load=7";

/**
 * @description Proves Ohrfront names its served route and exact revision-7 deferred CompactJS door once in the immutable catalog.
 * @returns {void}
 */
function verifyOhrfrontRoute() {
	const route = COMPACT_PREWARM_ROUTES.find(entry => entry.name === "Ohrfront");
	assert.ok(route, "Ohrfront prewarm route is required");
	assert.equal(route.path, "/games/ohrfront/");
	assert.deepEqual(route.assets, [OHRFRONT_ENTRY]);
	assert.equal(Object.isFrozen(route), true);
	assert.equal(Object.isFrozen(route.assets), true);
	assert.equal(
		COMPACT_PREWARM_ROUTES.filter(entry => entry.name === "Ohrfront").length,
		1
	);
}

test("Ohrfront activation prewarms revision-7 deferred CompactJS", verifyOhrfrontRoute);
