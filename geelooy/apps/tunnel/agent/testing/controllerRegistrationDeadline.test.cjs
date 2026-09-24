//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Deadline = require("../lib/connection-vessel/controller-registration-deadline.js");

/**
 * @file Proves replacement children must register before recovery can be considered complete.
 * @description The Awtsmoos does not count birth as arrival. Awtsmoos.com gives each replacement
 * child a bounded moment to prove registration, then renews that child again under the living parent.
 */
function timers() {
	const callbacks = [];
	const cleared = new Set();
	return {
		callbacks,
		setTimer(callback) {
			const timer = { index: callbacks.length, unref() {} };
			callbacks.push(callback);
			return timer;
		},
		clearTimer(timer) {
			cleared.add(timer.index);
		},
		cleared
	};
}

test("registration clears the armed replacement deadline", () => {
	const clock = timers();
	const deadline = Deadline.create({
		deadlineMs: 5000,
		now: () => 1000,
		setTimer: clock.setTimer,
		clearTimer: clock.clearTimer
	});
	assert.equal(deadline.arm(77, "child-a").active, true);
	const testimony = deadline.registered();
	assert.equal(testimony.childPid, 77);
	assert.equal(deadline.snapshot().active, false);
	assert.equal(clock.cleared.size, 1);
});

test("expired registration deadline requests another child repair once", () => {
	const clock = timers();
	const expirations = [];
	const deadline = Deadline.create({
		deadlineMs: 5000,
		now: () => 2000,
		setTimer: clock.setTimer,
		clearTimer: clock.clearTimer,
		onExpired: value => expirations.push(value)
	});
	deadline.arm(88, "child-b");
	assert.equal(clock.callbacks[0](), true);
	assert.equal(expirations.length, 1);
	assert.equal(expirations[0].reason, "child_registration_timeout");
	assert.equal(expirations[0].childPid, 88);
	assert.equal(deadline.snapshot().expirations, 1);
});

test("rearming fences an obsolete child's old timer", () => {
	const clock = timers();
	const expirations = [];
	const deadline = Deadline.create({
		setTimer: clock.setTimer,
		clearTimer: clock.clearTimer,
		onExpired: value => expirations.push(value)
	});
	deadline.arm(90, "child-old");
	deadline.arm(91, "child-new");
	assert.equal(clock.callbacks[0](), false);
	assert.equal(expirations.length, 0);
	assert.equal(clock.callbacks[1](), true);
	assert.equal(expirations[0].childPid, 91);
});
