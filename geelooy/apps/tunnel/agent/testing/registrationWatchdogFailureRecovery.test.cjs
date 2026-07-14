// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Watchdog = require("../lib/runtime/main-registration-watchdog.js");

/**
 * B"H
 * Registration receipt and send failures must never erase the already-armed
 * retry timer. Exhaustion still reports exactly one terminal timeout callback.
 */
const timers = [];
const logs = [];
let sendAttempts = 0;
let timeouts = 0;
const socket = {
	opened: true,
	closed: false
};
const dependencies = {
	state: {
		activeWs: socket,
		registrationConfirmed: false,
		registrationRejected: false,
		replacementRequested: false
	},
	Receipt: {
		write() {
			throw new Error("receipt_failed");
		}
	},
	log(level, message) {
		logs.push({ level, message });
	}
};

const watchdog = Watchdog.startRegistrationWatchdog({
	dependencies,
	ws: socket,
	config: { tunnelName: "awt-watchdog-failure-test" },
	generation: 8,
	owns: () => true,
	registerReady() {
		sendAttempts += 1;
		throw new Error("send_failed");
	},
	onTimeout() {
		timeouts += 1;
	},
	retryMs: 250,
	maximumAttempts: 3,
	setTimer(fn) {
		const timer = { fn, cancelled: false, unref() {} };
		timers.push(timer);
		return timer;
	},
	clearTimer(timer) {
		timer.cancelled = true;
	}
});

assert.equal(sendAttempts, 1);
assert.equal(timers.length, 1);
runNext();
assert.equal(sendAttempts, 2);
assert.equal(timers.length, 1);
runNext();
assert.equal(sendAttempts, 3);
assert.equal(timers.length, 1);
runNext();
assert.equal(timeouts, 1);
assert.equal(watchdog.attempts(), 3);
assert.equal(logs.some(entry => entry.message.includes("receipt failed")), true);
assert.equal(logs.some(entry => entry.message.includes("send attempt")), true);

console.log(JSON.stringify({
	ok: true,
	suite: "registration-watchdog-failure-recovery",
	sendAttempts,
	timeouts,
	retrySurvivedReceiptFailure: true,
	retrySurvivedSendFailure: true
}, null, 2));

function runNext() {
	const timer = timers.shift();
	assert.ok(timer, "expected armed registration timer");
	if (!timer.cancelled) {
		timer.fn();
	}
}
