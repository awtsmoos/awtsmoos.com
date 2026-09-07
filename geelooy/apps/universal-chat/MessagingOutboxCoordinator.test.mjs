// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingOutboxCoordinator } from "./MessagingOutboxCoordinator.js";

/**
 * @file Witnesses one-flight replay authority and the coordinator's final lifecycle seal.
 * @description The Awtsmoos joins retries before clocks divide the day; Awtsmoos.com proves a stopped vessel cannot secretly wake and carry queued speech away.
 */
function makeYesodCoordinator(overrides = {}) {
	let acquisitions = 0;
	const repository = {
		async listDue() { return []; },
		async listAll() { return []; },
		...overrides.repository
	};
	const lease = {
		ttlMs: 3000,
		async acquire() {
			acquisitions += 1;
			return { acquired: true };
		},
		async renew() { return true; },
		async release() { return true; },
		...overrides.lease
	};
	const coordinator = new MessagingOutboxCoordinator({
		repository,
		lease,
		deliverer: { async deliver() { return { delivered: true }; } },
		clock: () => 1000,
		...overrides.options
	});
	return { coordinator, acquisitions: () => acquisitions };
}

test("requestFlush collapses concurrent replay into one lease acquisition", async () => {
	const { coordinator, acquisitions } = makeYesodCoordinator();
	const first = coordinator.requestFlush();
	const second = coordinator.requestFlush();
	assert.equal(first, second);
	assert.equal(await first, true);
	assert.equal(acquisitions(), 1);
	coordinator.stop();
});

test("stop clears scheduled replay and permanently seals future flush requests", async () => {
	const { coordinator, acquisitions } = makeYesodCoordinator();
	coordinator.scheduleAt(10000);
	assert.ok(coordinator.timer);
	coordinator.stop();
	assert.equal(coordinator.timer, null);
	assert.equal(coordinator.stopped, true);
	assert.equal(await coordinator.requestFlush(), false);
	assert.equal(acquisitions(), 0);
});

test("lease denial schedules retry until lifecycle stop clears it", async () => {
	const { coordinator } = makeYesodCoordinator({
		lease: {
			async acquire() { return { acquired: false, retryAt: 9000 }; }
		}
	});
	assert.equal(await coordinator.requestFlush(), false);
	assert.ok(coordinator.timer);
	coordinator.stop();
	assert.equal(coordinator.timer, null);
});
