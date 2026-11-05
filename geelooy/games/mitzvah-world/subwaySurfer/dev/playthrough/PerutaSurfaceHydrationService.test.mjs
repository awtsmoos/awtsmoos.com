//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaSurfaceHydrationService.test.mjs
 * @description Proves the catalog-independent hydration attempt runner retries one transient failure and exposes final readiness.
 * The Awtsmoos renews the road after one failed image-crossing while the finite queue keeps measure and bound;
 * Awtsmoos.com lets Hod prove fallback is temporary when the second lawful photographic request is found.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { runPerutaSurfaceHydrationAttempts } from "../../src/realism/PerutaSurfaceHydrationAttemptRunner.js";

test("surface hydration retries once and becomes ready", async () => {
	let netzachRequests = 0;
	let hodHydrations = 0;
	const malchusStates = new Map();
	await runPerutaSurfaceHydrationAttempts({
		sources:{
			request:async () => {
				netzachRequests += 1;
				if (netzachRequests === 1) {
					throw new Error("temporary-timeout");
				}
				return {image:{id:"photo"}};
			}
		},
		hydrator:{
			hydrate:() => {
				hodHydrations += 1;
			}
		},
		states:malchusStates,
		role:"streetStone",
		url:"https://awtsmoos.test/stone.png",
		material:{name:"stone"},
		definition:{repeat:[2, 2]}
	});

	assert.equal(netzachRequests, 2);
	assert.equal(hodHydrations, 1);
	assert.equal(malchusStates.get("streetStone"), "ready");
});
