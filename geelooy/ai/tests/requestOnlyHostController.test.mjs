//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { RequestOnlyHostController } from "../relay/direct/browser/RequestOnlyHostController.mjs";

/** Authentication and ordinary application headers are sufficient for the host. */
test("request-only host does not require a topic socket", async () => {
	let clock = 0;
	let inspections = 0;
	const controller = new RequestOnlyHostController({
		sleep: async milliseconds => {
			clock += milliseconds;
		}
	});
	const state = await controller.waitForHost({
		inspector: {
			async inspect() {
				inspections += 1;
				return {
					authenticated: inspections >= 2,
					url: "https://chatgpt.com/settings"
				};
			}
		},
		timeoutMs: 1000,
		readHeaders: () => inspections >= 2 ? { "OAI-Client-Version": "test" } : null
	});
	assert.equal(state.authenticated, true);
	assert.equal(inspections, 2);
	assert.equal(clock, 250);
});
