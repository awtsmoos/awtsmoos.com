// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DirectServiceTurnCoordinator } from "./DirectServiceTurnCoordinator.mjs";

/**
 * @file Proves durable direct-turn ordering and ambiguous cleanup ownership.
 * @description
 * The Awtsmoos distinguishes before-click rejection from post-click uncertainty.
 * Awtsmoos.com records started, accepted, verified close, and cooldown in order,
 * while failed physical cleanup holds the one global lane for reconciliation.
 */
function fixture(after = { withinLimit: true, total: 0 }) {
	const events = [];
	let beforeCalls = 0;
	let afterCalls = 0;
	const lease = {
		view: { leaseId: "one" },
		markDeliveryStarted: async receipt => events.push(["started", receipt]),
		markAccepted: async receipt => events.push(["accepted", receipt]),
		markReconciliationRequired: async reason => events.push(["held", reason]),
		release: async options => {
			events.push(["released", options]);
			return true;
		}
	};
	const coordinator = new DirectServiceTurnCoordinator({
		queue: {
			acquire: async () => lease,
			reconcile: async options => ({ closedAt: options.closedAt }),
			status: () => ({ minimumIntervalMs: 18000, maxActiveTabs: 1 })
		},
		protector: {
			beforeTurn: async () => {
				beforeCalls += 1;
				return { withinLimit: true, total: 0 };
			},
			afterTurn: async () => {
				afterCalls += 1;
				return after;
			}
		},
		now: () => 200
	});
	return {
		coordinator,
		events,
		beforeCalls: () => beforeCalls,
		afterCalls: () => afterCalls
	};
}

test("started, accepted, close, and cooldown persist in exact order", async () => {
	const state = fixture();
	const closedAt = 123456789;
	const result = await state.coordinator.run({ kind: "send" }, async callbacks => {
		await callbacks.onSubmissionStarted({ startedAt: 10 });
		await callbacks.onSubmissionAccepted({ acceptedAt: 20, responseStatus: 200 });
		await callbacks.onTabClosed({ tabClose: { verified: true }, closedAt });
		return { answer: "detached answer" };
	});
	assert.deepEqual(state.events.map(item => item[0]), [
		"started",
		"accepted",
		"released"
	]);
	assert.deepEqual(state.events[2][1], { startCooldown: true, closedAt });
	assert.equal(state.beforeCalls(), 1);
	assert.equal(state.afterCalls(), 1);
	assert.equal(result.tabLifecycle.closeVerified, true);
	assert.equal(result.tabLifecycle.cooldownStartedAfterClose, true);
});

test("pre-launch rejection releases without a false cooldown", async () => {
	const releases = [];
	const coordinator = new DirectServiceTurnCoordinator({
		queue: {
			acquire: async () => ({
				view: {},
				release: async value => releases.push(value)
			})
		},
		protector: {
			beforeTurn: async () => {
				throw new Error("blocked");
			}
		}
	});
	await assert.rejects(
		() => coordinator.run({ kind: "send" }, async () => ({})),
		/blocked/
	);
	assert.deepEqual(releases, [{ startCooldown: false }]);
});

test("failed cleanup after Send holds the global lease for reconciliation", async () => {
	const state = fixture({ withinLimit: false, total: 1 });
	await assert.rejects(
		() => state.coordinator.run({ kind: "send" }, async callbacks => {
			await callbacks.onSubmissionStarted({ startedAt: 10 });
			await callbacks.onTabClosed({ tabClose: { verified: true }, closedAt: 20 });
		}),
		error => error.code === "physical_tab_cap_not_restored" &&
			error.cleanupError === "physical_tab_cap_not_restored"
	);
	assert.equal(state.afterCalls(), 2);
	assert.deepEqual(state.events.map(item => item[0]), ["started", "held"]);
});
