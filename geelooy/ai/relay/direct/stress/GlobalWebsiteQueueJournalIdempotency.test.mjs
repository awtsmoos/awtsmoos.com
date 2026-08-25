// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { persistAcceptedTurn } from "./GlobalWebsiteQueueAcceptance.mjs";
import { POST_CLOSE_COOLDOWN_MS } from "./GlobalWebsiteQueueLimits.mjs";
import { GlobalWebsiteTurnQueue } from "./GlobalWebsiteTurnQueue.mjs";

/**
 * @file Proves permanent acceptance survives cache failure and process reconstruction.
 * @description
 * The Awtsmoos seals accepted testimony before bounded state may fail. Awtsmoos.com
 * rebuilds a fresh queue, remembers the stable identity, and keeps the same physical
 * twenty-four-second covenant without opening a duplicate browser turn.
 */
function temporaryRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "awts-journal-idempotency-"));
}

function queue(rootPath) {
	return new GlobalWebsiteTurnQueue({
		rootPath,
		pollMs: 10,
		minimumIntervalMs: POST_CLOSE_COOLDOWN_MS
	});
}

test("the permanent receipt is written before bounded state mutation", async () => {
	const order = [];
	const durable = { acceptedAt: 10, responseStatus: 200 };
	const fakeQueue = {
		now: () => 10,
		store: {
			persistAccepted: async () => {
				order.push("journal");
				return durable;
			},
			mutate: async () => {
				order.push("state");
				throw new Error("state_write_failed");
			}
		}
	};
	await assert.rejects(
		persistAcceptedTurn(fakeQueue, {
			ticketId: "ticket_0123456789abcdef0123456789abcdef",
			id: "lease_one"
		}, durable),
		/state_write_failed/
	);
	assert.deepEqual(order, ["journal", "state"]);
});

test("a reconstructed queue rejects a permanently accepted stable turn", async () => {
	const rootPath = temporaryRoot();
	const idempotencyKey = "website:mission:session:round-7";
	try {
		const firstQueue = queue(rootPath);
		const lease = await firstQueue.acquire({ idempotencyKey });
		await lease.markAccepted({
			acceptedAt: 100,
			conversationId: "opaque-conversation",
			responseStatus: 200
		});
		await lease.release({ startCooldown: false });
		fs.writeFileSync(path.join(rootPath, "state.json"), JSON.stringify({
			schemaVersion: 3,
			queue: [],
			active: [],
			accepted: {},
			uncertain: {},
			reconciliationRequiredAt: null,
			lastLaunchAt: null,
			lastClosedAt: null
		}));
		const reconstructed = queue(rootPath);
		await assert.rejects(
			reconstructed.acquire({ idempotencyKey }),
			error => error.code === "website_turn_already_accepted" &&
				error.submissionAccepted === true &&
				error.acceptedReceipt.acceptedAt === 100
		);
		assert.equal(reconstructed.status().durableAcceptedReceipts, 1);
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});
