// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { pollUntilTerminal } from "../pollingLoop.js";
import { createPollingState, nextPayload, observePollingEnvelope } from "../pollingPolicy.js";

let state = createPollingState();
state = observePollingEnvelope(state, { progressSequence: "one", retryAfterMs: 900 });
assert.equal(state.delayMs, 25);
state = observePollingEnvelope(state, { progressSequence: "one", retryAfterMs: 120 });
assert.equal(state.delayMs, 120);
state = observePollingEnvelope(state, { progressSequence: "two", retryAfterMs: 120 });
assert.equal(state.delayMs, 25);

const retryPayload = { action: "retryAction", controlRequestId: "resume-one" };
assert.deepEqual(nextPayload({}, {
	pending: true,
	resumeToken: "resume-one",
	retryPayload
}), retryPayload);

const payloads = [];
const delays = [];
let now = 0;
const responses = [
	{
		ok: false,
		pending: true,
		resumeToken: "resume-one",
		retryPayload
	},
	{
		ok: true,
		done: false,
		progressSequence: "1:5",
		retryAfterMs: 50,
		pollPayload: { action: "asyncTaskOutputPage", offsetChars: 5 }
	},
	{
		ok: true,
		done: true,
		status: "completed",
		progressSequence: "2:9",
		content: "done"
	}
];

const result = await pollUntilTerminal(
	async payload => {
		payloads.push(payload);
		return responses.shift();
	},
	{ action: "asyncTaskStatus", taskId: "task-one" },
	{
		clock: () => now,
		timeoutMs: 1000,
		sleep: async milliseconds => {
			delays.push(milliseconds);
			now += milliseconds;
		}
	}
);

assert.equal(result.done, true);
assert.equal(result.pollAttempts, 3);
assert.equal(result.content, "done");
assert.deepEqual(delays, [25, 25]);
assert.equal(payloads[1].action, "retryAction");
assert.equal(payloads[2].offsetChars, 5);

const timeout = await pollUntilTerminal(
	async () => ({ ok: true, done: false, retryAfterMs: 100 }),
	{},
	{
		clock: () => now,
		timeoutMs: 100,
		sleep: async milliseconds => { now += milliseconds; }
	}
);
assert.equal(timeout.error, "client_poll_timeout");

const controller = new AbortController();
controller.abort(new Error("stop-now"));
await assert.rejects(
	pollUntilTerminal(async () => ({ ok: true }), {}, { signal: controller.signal }),
	/stop-now/
);
console.log("BHY adaptive polling and relay resume tests passed");
