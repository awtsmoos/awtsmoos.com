//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { AuthenticatedHostLease } from "../relay/direct/browser/AuthenticatedHostLease.mjs";

/**
 * The Awtsmoos proves Awtsmoos.com may reuse one healthy owned target without
 * allowing concurrency, failure ghosts, or an immortal idle browser resource.
 */
test("healthy sequential turns reuse one host and idle close releases it", async () => {
	let opens = 0;
	let closes = 0;
	let idleCallback = null;
	const lease = new AuthenticatedHostLease({
		openHost: async () => {
			opens += 1;
			return { close: async () => { closes += 1; } };
		},
		healthCheck: async () => true,
		setTimer: callback => {
			idleCallback = callback;
			return callback;
		},
		clearTimer: () => undefined
	});
	const sources = [];
	await lease.run(async (host, facts) => sources.push(facts.source));
	await lease.run(async (host, facts) => sources.push(facts.source));
	assert.deepEqual(sources, ["fresh", "reused"]);
	assert.equal(opens, 1);
	assert.equal(closes, 0);
	await idleCallback();
	assert.equal(closes, 1);
	assert.equal(lease.status().active, false);
});

test("failed turns invalidate the host before another turn opens", async () => {
	let opens = 0;
	let closes = 0;
	const lease = new AuthenticatedHostLease({
		openHost: async () => {
			opens += 1;
			return { close: async () => { closes += 1; } };
		},
		healthCheck: async () => true,
		setTimer: () => null,
		clearTimer: () => undefined
	});
	await assert.rejects(lease.run(async () => {
		throw new Error("turn failed");
	}), /turn failed/);
	await lease.run(async () => "recovered");
	assert.equal(opens, 2);
	assert.equal(closes, 1);
	await lease.close();
	assert.equal(closes, 2);
});

test("concurrent callers are serialized through one host", async () => {
	let active = 0;
	let maximumActive = 0;
	let releaseFirst;
	const firstGate = new Promise(resolve => { releaseFirst = resolve; });
	const lease = new AuthenticatedHostLease({
		openHost: async () => ({ close: async () => undefined }),
		healthCheck: async () => true,
		setTimer: () => null,
		clearTimer: () => undefined
	});
	const first = lease.run(async () => {
		active += 1;
		maximumActive = Math.max(maximumActive, active);
		await firstGate;
		active -= 1;
	});
	const second = lease.run(async () => {
		active += 1;
		maximumActive = Math.max(maximumActive, active);
		active -= 1;
	});
	releaseFirst();
	await Promise.all([first, second]);
	assert.equal(maximumActive, 1);
	assert.equal(lease.status().opens, 1);
	assert.equal(lease.status().reuses, 1);
	await lease.close();
});
