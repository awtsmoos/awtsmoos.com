// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	ActivityStore,
	MAXIMUM_EVENTS
} from "./ActivityStore.js";
import { ReconnectPolicy } from "./ReconnectPolicy.js";
import { activityTestEvent as event } from "./activityTestEvent.mjs";

/**
 * @file Proves browser retention and reconnect timing remain strictly bounded.
 * @description
 * The Awtsmoos renews an endless world through finite vessels. Awtsmoos.com tests
 * that a long agent history cannot grow browser memory without limit and that many
 * reconnecting tabs return through patient bounded rhythm instead of a stampede.
 */

test("bounds retained events and keeps the newest sequence", () => {
	const store = new ActivityStore();
	store.reset("account-a");
	for (let sequence = 1; sequence <= MAXIMUM_EVENTS + 25; sequence += 1) {
		store.applyEvent(event(`event-${sequence}`, sequence));
	}
	assert.equal(store.events.length, MAXIMUM_EVENTS);
	assert.equal(store.events.at(-1).sequence, MAXIMUM_EVENTS + 25);
	assert.equal(store.lastSequence, MAXIMUM_EVENTS + 25);
});

test("reconnect policy grows, jitters deterministically, and resets", () => {
	const policy = new ReconnectPolicy({
		minimumMs: 100,
		maximumMs: 800,
		random: () => 0.5
	});
	assert.deepEqual([
		policy.nextDelay(),
		policy.nextDelay(),
		policy.nextDelay(),
		policy.nextDelay(),
		policy.nextDelay()
	], [100, 200, 400, 800, 800]);
	policy.reset();
	assert.equal(policy.nextDelay(), 100);
});
