// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { DirectServiceTurnCoordinator } from "./DirectServiceTurnCoordinator.mjs";

function fixture(after = { withinLimit: true, total: 0 }) {
	const releases = [];
	let beforeCalls = 0;
	let afterCalls = 0;
	const coordinator = new DirectServiceTurnCoordinator({
		queue: {
			acquire: async () => ({
				view: { leaseId: "one" },
				release: async options => { releases.push(options); return true; }
			}),
			status: () => ({ minimumIntervalMs: 18000, maxActiveTabs: 1 })
		},
		protector: {
			beforeTurn: async () => { beforeCalls += 1; return { withinLimit: true, total: 0 }; },
			afterTurn: async () => { afterCalls += 1; return after; }
		}
	});
	return { coordinator, releases, beforeCalls: () => beforeCalls, afterCalls: () => afterCalls };
}

test("verified close releases immediately and anchors cooldown to close time", async () => {
	const state = fixture();
	const closedAt = 123456789;
	const result = await state.coordinator.run({ kind: "send" }, async ({ onTabClosed }) => {
		await onTabClosed({ tabClose: { verified: true }, closedAt });
		assert.equal(state.releases.length, 1);
		return { answer: "detached answer" };
	});
	assert.deepEqual(state.releases, [{ startCooldown: true, closedAt }]);
	assert.equal(state.beforeCalls(), 1);
	assert.equal(state.afterCalls(), 1);
	assert.equal(result.tabLifecycle.closedImmediatelyAfterAcceptedSend, true);
	assert.equal(result.tabLifecycle.cooldownStartedAfterClose, true);
});

test("pre-launch rejection releases without a false cooldown", async () => {
	const releases = [];
	const coordinator = new DirectServiceTurnCoordinator({
		queue: { acquire: async () => ({ view: {}, release: async value => releases.push(value) }) },
		protector: { beforeTurn: async () => { throw new Error("blocked"); } }
	});
	await assert.rejects(() => coordinator.run({ kind: "send" }, async () => ({})), /blocked/);
	assert.deepEqual(releases, [{ startCooldown: false }]);
});

test("unverified physical cleanup holds the single lease", async () => {
	const state = fixture({ withinLimit: false, total: 1 });
	await assert.rejects(
		() => state.coordinator.run({ kind: "send" }, async ({ onTabClosed }) => {
			await onTabClosed({ tabClose: { verified: true }, closedAt: 10 });
		}),
		error => error.code === "physical_tab_cap_not_restored"
	);
	assert.deepEqual(state.releases, []);
});
