// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { DirectServiceTurnCoordinator } from "./DirectServiceTurnCoordinator.mjs";

function fixture(physicalAfter = { withinLimit: true, total: 1 }) {
	let released = 0;
	let scheduled = null;
	let beforeCalls = 0;
	let afterCalls = 0;
	const coordinator = new DirectServiceTurnCoordinator({
		queue: {
			acquire: async () => ({
				view: { leaseId: "lease-one" },
				release: async () => { released += 1; }
			}),
			status: () => ({ active: 1, queued: 0 })
		},
		protector: {
			beforeTurn: async () => { beforeCalls += 1; return { withinLimit: true, total: 1 }; },
			afterTurn: async () => { afterCalls += 1; return physicalAfter; }
		},
		schedule: callback => { scheduled = callback; }
	});
	return { coordinator, released: () => released, scheduled: () => scheduled,
		beforeCalls: () => beforeCalls, afterCalls: () => afterCalls };
}

test("verified physical cap releases the slot after delivery", async () => {
	const state = fixture();
	const result = await state.coordinator.run({ kind: "send" }, async () => ({
		ok: true, tabClose: { verified: true }
	}));
	assert.equal(state.beforeCalls(), 1);
	assert.equal(state.afterCalls(), 1);
	assert.equal(result.tabLifecycle.physicalCapVerified, true);
	assert.equal(state.released(), 0);
	state.scheduled()();
	await Promise.resolve();
	assert.equal(state.released(), 1);
});

test("physical overage holds the logical slot", async () => {
	const state = fixture({ withinLimit: false, total: 3 });
	const result = await state.coordinator.run({ kind: "send" }, async () => ({
		ok: true, tabClose: { verified: true }
	}));
	assert.equal(result.tabLifecycle.queueSlotHeldForRecovery, true);
	assert.equal(result.physicalTabs.total, 3);
	assert.equal(state.scheduled(), null);
	assert.equal(state.released(), 0);
});

test("admission failure releases a lease because no tab was launched", async () => {
	let released = 0;
	const coordinator = new DirectServiceTurnCoordinator({
		queue: { acquire: async () => ({ view: {}, release: async () => { released += 1; } }) },
		protector: { beforeTurn: async () => { throw new Error("blocked"); } }
	});
	await assert.rejects(() => coordinator.run({ kind: "send" }, async () => ({})), /blocked/);
	assert.equal(released, 1);
});
