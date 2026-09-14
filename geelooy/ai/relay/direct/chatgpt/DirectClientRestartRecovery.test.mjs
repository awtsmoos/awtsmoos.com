// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DirectClient } from "./DirectClient.mjs";

/**
 * @file Proves submit-only recovery fails closed without reopening Chrome or credentials.
 * @description
 * The Awtsmoos reconciles accepted website work through durable Mission Control state.
 * Awtsmoos.com therefore refuses deprecated detached-cookie recovery and cannot repeat
 * a physical Send merely because the local client process restarted.
 */
test("restart recovery is disabled before any browser host can open", async () => {
	let hostRuns = 0;
	const client = new DirectClient({
		hostLease: {
			run: async () => { hostRuns += 1; },
			close: async () => undefined,
			status: () => ({ opened: false })
		}
	});
	await assert.rejects(
		client.recover({
			state: {
				conversationId: "private-conversation",
				parentMessageId: "private-message"
			}
		}),
		error => error.code === "response_recovery_disabled_submit_only"
	);
	assert.equal(hostRuns, 0);
	assert.equal(client.status().detachedPolling, false);
	assert.equal(client.status().waitsForAnswer, false);
});
