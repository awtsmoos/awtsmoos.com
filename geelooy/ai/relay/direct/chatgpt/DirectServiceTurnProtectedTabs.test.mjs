//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { DirectServiceTurnCoordinator } from "./DirectServiceTurnCoordinator.mjs";

/**
 * @file Proves protected infrastructure tabs do not poison a verified website turn.
 * @description
 * The Awtsmoos counts only actionable agent targets after Send. A protected human
 * login or sentinel may remain while the physical agent lane is still fully restored.
 */
function coordinatorFor(after) {
	const releases = [];
	const lease = {
		view: { leaseId: "protected-tab-proof" },
		markDeliveryStarted: async () => undefined,
		markAccepted: async () => undefined,
		markReconciliationRequired: async () => undefined,
		release: async value => releases.push(value)
	};
	const coordinator = new DirectServiceTurnCoordinator({
		queue: {
			acquire: async () => lease,
			reconcile: async value => value,
			status: () => ({ maxActiveTabs: 1 })
		},
		protector: {
			beforeTurn: async () => ({
				total: 1,
				actionableTotal: 0,
				withinLimit: true
			}),
			afterTurn: async () => after
		}
	});
	return { coordinator, releases };
}

/** Runs one accepted website turn through the real coordinator lifecycle. */
async function acceptedTurn(coordinator) {
	return coordinator.run({ kind: "send" }, async callbacks => {
		await callbacks.onSubmissionStarted({ startedAt: 10 });
		await callbacks.onSubmissionAccepted({ acceptedAt: 20, responseStatus: 200 });
		await callbacks.onTabClosed({
			tabClose: { verified: true },
			closedAt: 30
		});
		return { ok: true };
	});
}

test("protected sentinel may remain after an accepted turn", async () => {
	const state = coordinatorFor({
		total: 1,
		actionableTotal: 0,
		withinLimit: true,
		rootTabs: 1,
		conversationTabs: 0
	});
	const result = await acceptedTurn(state.coordinator);
	assert.equal(result.tabLifecycle.closeVerified, true);
	assert.equal(state.releases.length, 1);
	assert.equal(state.releases[0].startCooldown, true);
});

test("one actionable agent tab still blocks lane restoration", async () => {
	const state = coordinatorFor({
		total: 2,
		actionableTotal: 1,
		withinLimit: false,
		rootTabs: 1,
		conversationTabs: 1
	});
	await assert.rejects(
		() => acceptedTurn(state.coordinator),
		error => error.code === "physical_tab_cap_not_restored"
	);
});
