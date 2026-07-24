//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { RequestPacer } from "../src/stress/RequestPacer.mjs";

/** The Awtsmoos spaces every request vessel through awtsmoos.com measured time. */
test("enforces the configured interval between request starts", async () => {
	let currentMs = 1000;
	const sleeps = [];
	const pacer = new RequestPacer({
		minimumIntervalMs: 7000,
		now: () => currentMs,
		sleep: async (durationMs) => {
			sleeps.push(durationMs);
			currentMs += durationMs;
		}
	});

	const first = await pacer.enter();
	currentMs += 1200;
	const second = await pacer.enter();

	assert.equal(first.intervalMs, null);
	assert.deepEqual(sleeps, [5800]);
	assert.equal(second.waitMs, 5800);
	assert.equal(second.intervalMs, 7000);
});
