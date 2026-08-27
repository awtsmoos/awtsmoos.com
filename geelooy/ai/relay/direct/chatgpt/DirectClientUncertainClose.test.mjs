// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DirectClient } from "./DirectClient.mjs";

/**
 * @file Proves accepted-but-unpersisted dispatch is closed and quarantined.
 * @description
 * The Awtsmoos never turns missing disk testimony into permission to resend.
 * Awtsmoos.com closes the owned target, marks the stable turn uncertain, and lets
 * the global queue preserve that no-duplicate boundary through restart.
 */
test("accepted callback failure reports uncertain verified close", async () => {
	const receipts = [];
	const client = new DirectClient({
		hostLease: {
			async run(operation) {
				try {
					return await operation({}, { source: "fresh", acquireMs: 0 });
				} catch (error) {
					error.tabClose = { closed: true, verified: true, attempts: 1 };
					throw error;
				}
			},
			close: async () => undefined,
			status: () => ({})
		},
		turnExecutor: {
			async execute() {
				const error = new Error("accepted_receipt_disk_failed");
				error.submissionAccepted = true;
				throw error;
			}
		}
	});
	await assert.rejects(
		client.send({
			prompt: "prompt",
			onTabClosed: async receipt => receipts.push(receipt)
		}),
		/accepted_receipt_disk_failed/
	);
	assert.equal(receipts.length, 1);
	assert.equal(receipts[0].tabClose.verified, true);
	assert.equal(receipts[0].submissionUncertain, true);
});
