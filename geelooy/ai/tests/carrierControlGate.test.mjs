//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierControlGate } from "../relay/direct/browser/CarrierControlGate.mjs";

/** The bounded gate waits through disabled application state. */
test("carrier gate waits until an enabled send control exists", async () => {
	let calls = 0;
	let clock = 0;
	const gate = new CarrierControlGate(null, {
		timeoutMs: 1000,
		intervalMs: 100,
		sleep: async milliseconds => {
			clock += milliseconds;
		}
	});
	gate.inspect = async () => {
		calls += 1;
		return calls === 2
			? { ready: true, sendSelector: "button[data-testid='send-button']", reason: "ready" }
			: { ready: false, sendSelector: null, reason: "send_disabled" };
	};
	const originalNow = Date.now;
	Date.now = () => clock;
	try {
		const result = await gate.waitUntilReady();
		assert.equal(result.ready, true);
		assert.equal(calls, 2);
	} finally {
		Date.now = originalNow;
	}
});
