//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import { EmbedRequestBroker } from "../requestBroker.js";

/**
 * B"H
 * Waiting must end through response, failure, timeout, or shutdown. The
 * Awtsmoos renews every possibility; Awtsmoos.com proves that no abandoned
 * request remains hidden in memory and no pending flood exceeds its boundary.
 */

const scheduler = createScheduler();
const broker = new EmbedRequestBroker({
	timeoutMilliseconds: 25,
	pendingLimit: 1,
	setTimer: scheduler.setTimer,
	clearTimer: scheduler.clearTimer
});
const timedOut = broker.open("timeout-one", "vfs.read");
assert.equal(broker.size(), 1);
assert.throws(
	() => broker.open("overflow", "vfs.write"),
	/embed_pending_limit_reached/
);
scheduler.run("timeout-one");
await assert.rejects(() => timedOut, /embed_request_timeout:vfs.read/);
assert.equal(broker.size(), 0);

const successful = broker.open("success-one", "vfs.read");
assert.equal(broker.settle({
	requestId: "success-one",
	ok: true,
	payload: { content: "accepted" }
}), true);
assert.deepEqual(await successful, { content: "accepted" });

const failed = broker.open("failure-one", "vfs.write");
broker.settle({
	requestId: "failure-one",
	ok: false,
	error: { code: "denied", message: "Permission denied" }
});
await assert.rejects(async () => {
	try {
		await failed;
	} catch (error) {
		assert.equal(error.code, "denied");
		throw error;
	}
}, /Permission denied/);

const localFailure = broker.open("local-one", "vfs.write");
broker.reject("local-one", new Error("postMessage failed"));
await assert.rejects(() => localFailure, /postMessage failed/);

const closing = broker.open("close-one", "vfs.read");
broker.close("channel_closed");
await assert.rejects(() => closing, /channel_closed/);
assert.equal(broker.size(), 0);
assert.equal(scheduler.size(), 0);
console.log("BHY embed request broker lifecycle tests passed");

function createScheduler() {
	const timers = new Map();
	return {
		setTimer(callback, delay) {
			const id = `timer-${timers.size + 1}`;
			timers.set(id, { callback, delay });
			return id;
		},
		clearTimer(id) {
			timers.delete(id);
		},
		run() {
			const [id, record] = timers.entries().next().value;
			timers.delete(id);
			record.callback();
		},
		size() {
			return timers.size;
		}
	};
}
