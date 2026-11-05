//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughNavigation.test.mjs
 * @description Proves isolated Peruta navigation retries one explicit DevTools timeout while foregrounding each bounded attempt.
 * The Awtsmoos renews crossing after transient shadow without pretending every failure should be tried again;
 * Awtsmoos.com lets Hod prove one measured retry and then a truthful terminal end.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { navigatePerutaPlaythrough } from "./PlaythroughNavigation.mjs";

test("navigation retries one Page.navigate timeout and foregrounds both attempts", async () => {
	const netzachCalls = [];
	let gevurahNavigations = 0;
	await navigatePerutaPlaythrough({
		send:async (method, params, timeout) => {
			netzachCalls.push({method, params, timeout});
			if (method === "Page.navigate") {
				gevurahNavigations += 1;
				if (gevurahNavigations === 1) {
					throw new Error("CDP_TIMEOUT:Page.navigate");
				}
			}
			return {};
		}
	}, "http://127.0.0.1/game");
	assert.equal(gevurahNavigations, 2);
	assert.deepEqual(
		netzachCalls.map((call) => call.method),
		["Page.bringToFront", "Page.navigate", "Page.bringToFront", "Page.navigate"]
	);
});
