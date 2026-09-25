// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Receipts = require("../tools/fs/actionGroups/websiteCompletionReceipts.js");

/**
 * @file Proves website completion is idempotent with durable milestone receipts.
 * @description The Awtsmoos never lets a repeated completion double-write the room.
 * Awtsmoos.com proves a stable request key is derived from explicit idempotency handles,
 * every milestone is named in the response, and a duplicate replay returns the stored
 * receipt without rerunning any step.
 */

function memoryStore() {
	const map = new Map();
	return {
		loadReceipt: async key => map.get(key) || null,
		saveReceipt: async (key, receipt) => { map.set(key, JSON.parse(JSON.stringify(receipt))); },
		size: () => map.size
	};
}

function steps(counter) {
	return {
		persistEvent: async () => { counter.events += 1; return "evt_1"; },
		transitionCompletion: async () => { counter.transitions += 1; return "tr_1"; },
		acknowledgeDelivery: async () => {
			counter.deliveries += 1;
			return { dashboard: { ok: true }, websiteAgents: { ok: true } };
		}
	};
}

test("stable request key prefers explicit idempotency handles", () => {
	assert.equal(Receipts.deriveRequestKey({ requestKey: "rk1" }), "completion:rk1");
	assert.equal(Receipts.deriveRequestKey({ idempotencyKey: "ik2" }), "completion:ik2");
	assert.equal(Receipts.deriveRequestKey({ controlRequestId: "ctl3" }), "completion:ctl3");
	assert.equal(
		Receipts.deriveRequestKey({ reportId: "rep9", fromAgent: "agent-a" }),
		"completion:report:rep9:agent-a"
	);
	assert.equal(
		Receipts.deriveRequestKey({ missionId: "m1", kind: "completion" }),
		"completion:mission:m1:completion"
	);
	assert.equal(Receipts.deriveRequestKey({}), "");
});

test("first completion runs every step and names every milestone", async () => {
	const store = memoryStore();
	const counter = { events: 0, transitions: 0, deliveries: 0 };
	const coordinator = Receipts.createCompletionCoordinator(store);
	const result = await coordinator.complete(
		{ requestKey: "rk_first", missionId: "m1", kind: "completion" },
		steps(counter)
	);
	assert.equal(result.ok, true);
	assert.equal(result.duplicate, false);
	assert.deepEqual(result.milestones, {
		accepted: true,
		eventPersisted: true,
		completionTransitionPersisted: true,
		deliveryAcknowledged: true
	});
	assert.deepEqual(counter, { events: 1, transitions: 1, deliveries: 1 });
	assert.equal(result.delivery.dashboard.ok, true);
	assert.equal(result.delivery.websiteAgents.ok, true);
	assert.equal(result.receipt.complete, true);
});

test("duplicate completion replays the stored receipt without rerunning steps", async () => {
	const store = memoryStore();
	const counter = { events: 0, transitions: 0, deliveries: 0 };
	const coordinator = Receipts.createCompletionCoordinator(store);
	const input = { requestKey: "rk_dup", missionId: "m2", kind: "completion" };
	const first = await coordinator.complete(input, steps(counter));
	const second = await coordinator.complete(input, steps(counter));
	assert.equal(second.ok, true);
	assert.equal(second.duplicate, true);
	assert.equal(second.requestKey, first.requestKey);
	assert.deepEqual(second.milestones, first.milestones);
	assert.deepEqual(counter, { events: 1, transitions: 1, deliveries: 1 });
	assert.equal(store.size(), 1);
});

test("missing identity refuses instead of risking a duplicate", async () => {
	const coordinator = Receipts.createCompletionCoordinator(memoryStore());
	const result = await coordinator.complete({}, steps({ events: 0, transitions: 0, deliveries: 0 }));
	assert.equal(result.ok, false);
	assert.equal(result.error, "completion_request_key_required");
	assert.equal(result.duplicate, false);
});

test("coordinator requires injected persistence", () => {
	assert.throws(() => Receipts.createCompletionCoordinator({}), /completion_coordinator_requires_persistence/);
});
