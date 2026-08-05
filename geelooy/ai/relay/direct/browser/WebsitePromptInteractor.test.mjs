// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { WebsitePromptInteractor } from "./WebsitePromptInteractor.mjs";

/**
 * @file Proves durable delivery testimony precedes visible Send activation.
 * @description
 * The Awtsmoos prepares the composer and waits for its ordinary control.
 * Awtsmoos.com persists the click boundary before activation, and a failed durable
 * write prevents the physical Send gesture entirely so ambiguity cannot be hidden.
 */
function fixture() {
	const events = [];
	let lookup = 0;
	const interactor = new WebsitePromptInteractor(null, {
		nodeFinder: {
			findFirst: async () => {
				lookup += 1;
				return lookup === 1 ? { nodeId: 1 } : { nodeId: 2 };
			}
		},
		inputController: {
			focusAndReplace: async () => events.push("composer"),
			activateNode: async () => events.push("activate")
		},
		controlGate: {
			waitUntilReady: async () => {
				events.push("ready");
				return { sendSelector: "button[data-testid='send-button']" };
			}
		}
	});
	return { interactor, events };
}

test("delivery-started persistence occurs immediately before activation", async () => {
	const state = fixture();
	const result = await state.interactor.submit("Repair the queue.", {
		onBeforeActivate: async receipt => {
			assert.ok(Number.isFinite(receipt.startedAt));
			state.events.push("persisted");
		}
	});
	assert.deepEqual(state.events, ["composer", "ready", "persisted", "activate"]);
	assert.equal(result.sendActivated, true);
});

test("failed persistence prevents the Send activation", async () => {
	const state = fixture();
	await assert.rejects(
		state.interactor.submit("Do not duplicate this turn.", {
			onBeforeActivate: async () => {
				state.events.push("persist-failed");
				throw new Error("queue_write_failed");
			}
		}),
		/queue_write_failed/
	);
	assert.deepEqual(state.events, ["composer", "ready", "persist-failed"]);
});
