// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { GlobalWebsiteQueueStore } from "./GlobalWebsiteQueueStore.mjs";
import { initialQueueState } from "./GlobalWebsiteQueueState.mjs";

/**
 * @file Proves durable queue and crash testimony survive store reconstruction.
 * @description
 * The Awtsmoos preserves a hundred waiting sparks beyond their first process.
 * Awtsmoos.com atomically restores ordered tickets, reclaims untouched leases, and
 * quarantines post-click ambiguity after a fresh store instance reads the same disk.
 */
function temporaryRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "awts-queue-restart-"));
}

function store(rootPath) {
	const value = new GlobalWebsiteQueueStore({
		rootPath,
		now: () => 1000000,
		leaseStaleMs: 60000
	});
	value.processAlive = () => false;
	return value;
}

function ticket(index) {
	return {
		id: `ticket_${index}`,
		idempotencyKey: `mission:agent:${index}`,
		createdAt: index,
		pid: 900000 + index
	};
}

test("one hundred queued requests survive a reconstructed store", () => {
	const rootPath = temporaryRoot();
	try {
		const state = initialQueueState();
		state.queue = Array.from({ length: 100 }, (_, index) => ticket(index));
		store(rootPath).write(state);
		const restored = store(rootPath).clean(store(rootPath).read());
		assert.equal(restored.queue.length, 100);
		assert.deepEqual(
			restored.queue.map(item => item.id),
			Array.from({ length: 100 }, (_, index) => `ticket_${index}`)
		);
		assert.equal(fs.statSync(path.join(rootPath, "state.json")).mode & 0o777, 0o600);
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});

test("an untouched stale claim requeues after store reconstruction", async () => {
	const rootPath = temporaryRoot();
	try {
		const state = initialQueueState();
		state.active = [{
			...ticket(1),
			id: "lease_ticket_1",
			ticketId: "ticket_1",
			phase: "claimed",
			acquiredAt: 1
		}];
		store(rootPath).write(state);
		await store(rootPath).mutate(value => value);
		const restored = store(rootPath).read();
		assert.equal(restored.active.length, 0);
		assert.equal(restored.queue[0].id, "ticket_1");
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});

test("a stale post-click lease persists uncertainty and reconciliation", async () => {
	const rootPath = temporaryRoot();
	try {
		const state = initialQueueState();
		state.active = [{
			...ticket(2),
			id: "lease_ticket_2",
			ticketId: "ticket_2",
			phase: "delivery_started",
			acquiredAt: 1,
			deliveryStartedAt: 2
		}];
		store(rootPath).write(state);
		await store(rootPath).mutate(value => value);
		const restored = store(rootPath).read();
		assert.equal(restored.queue.length, 0);
		assert.equal(restored.uncertain.ticket_2.deliveryStartedAt, 2);
		assert.equal(restored.reconciliationRequiredAt, 1000000);
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});
