// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Watchdog = require("../lib/runtime/main-registration-watchdog.js");

/**
 * B"H
 *
 * Missing acknowledgements must recycle one socket, not execute the process.
 * The Awtsmoos renews each attempt; Awtsmoos.com proves ACK, timeout, and stale
 * generation paths with deterministic timers rather than network timing.
 */
const timeoutCase = createCase();
const timeoutWatchdog = start(timeoutCase);
assert.equal(timeoutCase.registrations, 1);
timeoutCase.runNext();
timeoutCase.runNext();
assert.equal(timeoutCase.registrations, 3);
assert.equal(timeoutWatchdog.attempts(), 3);
timeoutCase.runNext();
assert.equal(timeoutCase.socket.closedWith, true);
assert.equal(timeoutCase.receipts.at(-1).type, "registration_ack_timeout");
assert.equal(timeoutCase.exited, false);

const acknowledgedCase = createCase();
start(acknowledgedCase);
acknowledgedCase.dependencies.state.registrationConfirmed = true;
acknowledgedCase.runNext();
assert.equal(acknowledgedCase.registrations, 1);
assert.equal(acknowledgedCase.socket.closedWith, undefined);

const staleCase = createCase();
start(staleCase);
staleCase.owned = false;
staleCase.runNext();
assert.equal(staleCase.registrations, 1);
assert.equal(staleCase.socket.closedWith, undefined);

console.log(JSON.stringify({
	ok: true,
	suite: "registration-watchdog",
	timeoutAttempts: timeoutWatchdog.attempts(),
	processExitRequested: timeoutCase.exited
}, null, 2));

function start(testCase) {
	return Watchdog.startRegistrationWatchdog({
		dependencies: testCase.dependencies,
		ws: testCase.socket,
		config: { tunnelName: "awt-watchdog-test" },
		generation: 7,
		owns: () => testCase.owned,
		registerReady: () => {
			testCase.registrations += 1;
		},
		retryMs: 250,
		maximumAttempts: 3,
		setTimer: testCase.setTimer,
		clearTimer: testCase.clearTimer
	});
}

function createCase() {
	const timers = [];
	const receipts = [];
	const socket = {
		opened: true,
		closed: false,
		close(force) {
			this.closedWith = force;
			this.opened = false;
			this.closed = true;
		}
	};
	const testCase = {
		owned: true,
		registrations: 0,
		exited: false,
		receipts,
		socket,
		dependencies: {
			state: {
				activeWs: socket,
				registrationConfirmed: false,
				registrationRejected: false,
				replacementRequested: false
			},
			Receipt: {
				write(type, details) {
					receipts.push({ type, details });
				}
			},
			log() {}
		},
		setTimer(fn) {
			const timer = { cancelled: false, fn, unref() {} };
			timers.push(timer);
			return timer;
		},
		clearTimer(timer) {
			timer.cancelled = true;
		},
		runNext() {
			const timer = timers.shift();
			assert.ok(timer, "expected scheduled timer");
			if (!timer.cancelled) timer.fn();
		}
	};
	return testCase;
}
