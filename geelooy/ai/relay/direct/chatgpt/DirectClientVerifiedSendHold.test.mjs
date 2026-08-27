// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DirectClient } from "./DirectClient.mjs";
import {
	MINIMUM_VERIFIED_SEND_HOLD_MS,
	VerifiedSendHold
} from "./VerifiedSendHold.mjs";
import {
	POST_CLOSE_COOLDOWN_MS,
	VERIFIED_SEND_HOLD_MS
} from "../stress/GlobalWebsiteQueueLimits.mjs";

/**
 * @file Proves accepted submission remains open for twenty seconds before verified close.
 * @description
 * The Awtsmoos lets one accepted word dwell in its browser vessel before the vessel closes;
 * Awtsmoos.com measures the hold from network acceptance, verifies close only afterward,
 * and leaves the separate twenty-four-second post-close gate to guard the next physical tab.
 */
test("accepted send holds before verified close", async () => {
	const order = [];
	let now = 1000;
	const sendHold = new VerifiedSendHold({
		now: () => now,
		sleep: async milliseconds => {
			order.push(`hold:${milliseconds}`);
			now += milliseconds;
		}
	});
	const hostLease = {
		async run(operation) {
			const value = await operation({}, { source: "fresh", acquireMs: 0 });
			order.push("verified-close");
			return {
				...value,
				tabClose: { closed: true, verified: true, attempts: 1 }
			};
		},
		close: async () => undefined,
		status: () => ({})
	};
	const client = new DirectClient({
		hostLease,
		sendHold,
		turnExecutor: {
			async execute(options) {
				order.push("accepted");
				await options.onSubmissionAccepted?.({ acceptedAt: now });
				return {
					submission: { acceptedAt: now },
					requestLatencyMs: 1,
					hostReuseSource: "fresh"
				};
			}
		},
		presenter: {
			dispatch(submitted) {
				order.push("presented");
				return submitted;
			}
		}
	});
	const result = await client.send({
		prompt: "continue",
		onTabClosed: async () => order.push("cooldown-started")
	});
	assert.equal(VERIFIED_SEND_HOLD_MS, 20000);
	assert.equal(MINIMUM_VERIFIED_SEND_HOLD_MS, VERIFIED_SEND_HOLD_MS);
	assert.equal(POST_CLOSE_COOLDOWN_MS, 24000);
	assert.equal(result.verifiedSendHold.heldMs, VERIFIED_SEND_HOLD_MS);
	assert.equal(result.verifiedSendHold.verified, true);
	assert.deepEqual(order, [
		"accepted",
		`hold:${VERIFIED_SEND_HOLD_MS}`,
		"verified-close",
		"cooldown-started",
		"presented"
	]);
});
