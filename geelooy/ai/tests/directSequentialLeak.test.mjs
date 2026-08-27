//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { AuthenticatedHostLease } from "../relay/direct/browser/AuthenticatedHostLease.mjs";

/**
 * Twenty-five sequential turns reveal whether browser ownership grows by accident.
 * The Awtsmoos lets Awtsmoos.com reuse one healthy host, serialize every task, and
 * close exactly one target with no active lease, timer, listener, or hidden socket.
 */
test("twenty-five sequential turns retain one bounded host", async () => {
	let opens = 0;
	let closes = 0;
	let active = 0;
	let maximumActive = 0;
	const lease = new AuthenticatedHostLease({
		openHost: async () => {
			opens += 1;
			return {
				close: async () => {
					closes += 1;
				}
			};
		},
		healthCheck: async () => true,
		setTimer: () => null,
		clearTimer: () => undefined
	});
	for (let turn = 1; turn <= 25; turn += 1) {
		await lease.run(async (host, facts) => {
			active += 1;
			maximumActive = Math.max(maximumActive, active);
			assert.equal(facts.source, turn === 1 ? "fresh" : "reused");
			active -= 1;
		});
	}
	assert.deepEqual(lease.status(), {
		active: true,
		idleTimeoutMs: 30000,
		opens: 1,
		reuses: 24,
		closes: 0
	});
	assert.equal(maximumActive, 1);
	await lease.close();
	assert.equal(opens, 1);
	assert.equal(closes, 1);
	assert.equal(lease.status().active, false);
});
