// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Watchdog = require("../../lib/runtime/main-registration-watchdog.js");

/**
 * B"H
 * Deterministic timers reveal registration recovery without sleeping or network.
 */
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
		timeouts: 0,
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
			if (!timer.cancelled) {
				timer.fn();
			}
		}
	};
	return testCase;
}

function start(testCase, useCallback) {
	return Watchdog.startRegistrationWatchdog({
		dependencies: testCase.dependencies,
		ws: testCase.socket,
		config: { tunnelName: "awt-watchdog-test" },
		generation: 7,
		owns: () => testCase.owned,
		registerReady: () => {
			testCase.registrations += 1;
		},
		onTimeout: useCallback
			? () => {
				testCase.timeouts += 1;
			}
			: undefined,
		retryMs: 250,
		maximumAttempts: 3,
		setTimer: testCase.setTimer,
		clearTimer: testCase.clearTimer
	});
}

module.exports = {
	createCase,
	start
};
